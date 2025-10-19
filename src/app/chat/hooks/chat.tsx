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
      
      const response = await axiosInstance.get(endpoints.chat.getThreads(userId));
      
      if (response.data.success) {
        setThreads(response.data.data || []);
      } else {
        setError('Failed to fetch threads');
      }
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      setError(err.response?.data?.error || 'Failed to fetch threads');
      toast.error('Failed to load chat threads');
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
      
      const response = await axiosInstance.get(endpoints.chat.getMessages(threadId));
      
      if (response.data.success) {
        setMessages(response.data.data || []);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.error || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!threadId) return;

    try {
      const response = await axiosInstance.post(endpoints.chat.sendMessage(threadId), {
        senderId,
        content,
        messageType: 'text',
      });

      if (response.data.success) {
        // Add the new message to the list
        setMessages(prev => [...prev, response.data.data]);
        return response.data.data;
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      throw err;
    }
  }, [threadId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}
