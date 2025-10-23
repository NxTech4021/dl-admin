import { useState, useEffect, useCallback } from 'react';
import axiosInstance, { endpoints } from '@/lib/endpoints';
import { toast } from 'sonner';

export interface ChatUser {
  id: string;
  name: string;
  username?: string;
  image?: string;
}

export interface ThreadMember {
  userId: string;
  role?: string;
  user: ChatUser;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: ChatUser;
  readBy?: any[];
}

export interface Thread {
  id: string;
  name?: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  members: ThreadMember[];
  messages: Message[];
  _count: {
    messages: number;
  };
}

export interface AvailableUser {
  id: string;
  name: string;
  username?: string;
  image?: string;
  email?: string;
}

export function useChatData(userId?: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching threads for userId:', userId);
      const response = await axiosInstance.get(endpoints.chat.getThreads(userId));
      console.log('Threads response:', response.data);
      
      // Handle different possible response structures
      if (response.data) {
        // If response has a success property and data property
        if (response.data.success && response.data.data) {
          setThreads(response.data.data);
        }
        // If response data is directly an array
        else if (Array.isArray(response.data)) {
          setThreads(response.data);
        }
        // If response has threads property
        else if (response.data.threads && Array.isArray(response.data.threads)) {
          setThreads(response.data.threads);
        }
        // If response data has no specific structure but contains the threads
        else {
          setThreads([]);
        }
      } else {
        setThreads([]);
      }
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to fetch threads';
      setError(errorMessage);
      toast.error('Failed to load chat threads');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    loading,
    error,
    refetch: fetchThreads,
  };
}

export function useMessages(threadId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching messages for threadId:', threadId);
      const response = await axiosInstance.get(endpoints.chat.getMessages(threadId));
      console.log('Messages response:', response.data);
      
      // Handle different possible response structures
      if (response.data) {
        // If response has a success property and data property
        if (response.data.success && response.data.data) {
          setMessages(Array.isArray(response.data.data) ? response.data.data : []);
        }
        // If response data is directly an array
        else if (Array.isArray(response.data)) {
          setMessages(response.data);
        }
        // If response has messages property
        else if (response.data.messages && Array.isArray(response.data.messages)) {
          setMessages(response.data.messages);
        }
        // Default to empty array
        else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to fetch messages';
      setError(errorMessage);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!threadId) return;

    try {
      console.log('Sending message:', { threadId, senderId, content });
      
      const response = await axiosInstance.post(endpoints.chat.sendMessage(threadId), {
        senderId,
        content,
        messageType: 'text',
      });

      console.log('Send message response:', response.data);

      // Handle different possible response structures for the new message
      let newMessage = null;
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          newMessage = response.data.data;
        } else if (response.data.message) {
          newMessage = response.data.message;
        } else if (response.data.id) {
          // Response data is the message itself
          newMessage = response.data;
        }
      }

      if (newMessage) {
        // Add the new message to the list
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      } else {
        // If we don't get the message back, refresh the messages
        await fetchMessages();
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to send message';
      toast.error(errorMessage);
      throw err;
    }
  }, [threadId, fetchMessages]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await axiosInstance.post(endpoints.chat.markAsRead(messageId));
      // Optionally update the message's read status locally
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), { userId: 'currentUser' }] }
            : msg
        )
      );
    } catch (err: any) {
      console.error('Error marking message as read:', err);
      // Don't show toast for read errors as they're not critical
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}

// Additional hook for thread members if needed
export function useThreadMembers(threadId?: string) {
  const [members, setMembers] = useState<ThreadMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!threadId) {
      setMembers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(endpoints.chat.getThreadMembers(threadId));
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          setMembers(Array.isArray(response.data.data) ? response.data.data : []);
        } else if (Array.isArray(response.data)) {
          setMembers(response.data);
        } else if (response.data.members && Array.isArray(response.data.members)) {
          setMembers(response.data.members);
        } else {
          setMembers([]);
        }
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      console.error('Error fetching thread members:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to fetch thread members';
      setError(errorMessage);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  };
}

// Hook for creating new threads
export function useCreateThread() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createThread = useCallback(async (data: {
    name?: string;
    isGroup: boolean;
    memberIds: string[];
    createdBy: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating thread:', data);
      
      const response = await axiosInstance.post(endpoints.chat.createThread, data);
      
      console.log('Create thread response:', response.data);

      if (response.data) {
        let newThread = null;
        
        if (response.data.success && response.data.data) {
          newThread = response.data.data;
        } else if (response.data.thread) {
          newThread = response.data.thread;
        } else if (response.data.id) {
          newThread = response.data;
        }

        if (newThread) {
          toast.success('Thread created successfully');
          return newThread;
        }
      }
      
      throw new Error('Failed to create thread');
    } catch (err: any) {
      console.error('Error creating thread:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create thread';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createThread,
    loading,
    error,
  };
}

export function useAvailableUsers(currentUserId?: string) {
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableUsers = useCallback(async () => {
    if (!currentUserId) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching available users for:', currentUserId);
      const response = await axiosInstance.get(endpoints.chat.getAvailableUsers(currentUserId));
      
      console.log('Available users response:', response.data);
      
      let usersData: AvailableUser[] = [];
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          usersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          usersData = response.data.users;
        }
      }
      
      // Filter out current user just in case
      const filteredUsers = usersData.filter(user => user.id !== currentUserId);
      setUsers(filteredUsers);
      
    } catch (err: any) {
      console.error('Error fetching available users:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to fetch users';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchAvailableUsers,
  };
}

