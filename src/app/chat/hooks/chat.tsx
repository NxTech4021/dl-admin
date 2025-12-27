import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useSocket } from "@/context/socket-context";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import type {
  ChatUser,
  ThreadMember,
  Message,
  Thread,
  AvailableUser,
  ChatParticipant,
} from "@/constants/types/chat";

export function useChatData(userId?: string, selectedThreadId?: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();

  // Use ref to access selectedThreadId in callbacks without adding it as dependency
  const selectedThreadIdRef = useRef<string | undefined>(selectedThreadId);
  selectedThreadIdRef.current = selectedThreadId;

  // Debounce ref for marking thread as read when messages arrive
  const markReadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchThreads = useCallback(async (): Promise<Thread[]> => {
    if (!userId) {
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        endpoints.chat.getThreads(userId)
      );

      let threadsData: Thread[] = [];

      if (response.data) {
        if (response.data.success && response.data.data) {
          threadsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          threadsData = response.data;
        } else if (
          response.data.threads &&
          Array.isArray(response.data.threads)
        ) {
          threadsData = response.data.threads;
        }
      }

      // If we have a selected thread, reset its unread count to 0
      // (the user is viewing it, so any messages are considered read)
      const currentSelectedId = selectedThreadIdRef.current;
      if (currentSelectedId) {
        threadsData = threadsData.map(thread =>
          thread.id === currentSelectedId
            ? { ...thread, unreadCount: 0 }
            : thread
        );
      }

      setThreads(threadsData);
      return threadsData;
    } catch (err: any) {
      console.error("Error fetching threads:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch threads";
      setError(errorMessage);
      toast.error("Failed to load chat threads");
      setThreads([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Listen for real-time thread updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewThread = (data: { thread: Thread }) => {
      setThreads((prev) => [data.thread, ...prev]);
      toast.success("New conversation started!");
    };

    const handleThreadUpdate = (data: {
      threadId: string;
      lastMessage: Message;
    }) => {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === data.threadId
            ? {
                ...thread,
                messages: [data.lastMessage],
                updatedAt: new Date().toISOString(),
              }
            : thread
        )
      );
    };

    // Listen for new messages to update thread's last message in the list
    const handleNewMessage = (message: Message) => {
      // If message is for the selected thread and from another user,
      // mark it as read in the database (debounced to avoid spam)
      if (
        message.threadId === selectedThreadId &&
        message.senderId !== userId
      ) {
        if (markReadTimeoutRef.current) {
          clearTimeout(markReadTimeoutRef.current);
        }
        markReadTimeoutRef.current = setTimeout(() => {
          axiosInstance.post(endpoints.chat.markThreadAsRead(message.threadId))
            .catch(() => {}); // Silently fail
        }, 500);
      }

      setThreads((prev) => {
        const threadIndex = prev.findIndex((t) => t.id === message.threadId);
        if (threadIndex === -1) return prev;

        const thread = prev[threadIndex];

        // Update the thread's messages array (used for lastMessage display)
        // Only increment unread count if:
        // 1. Message is from another user
        // 2. Thread is NOT currently being viewed
        const shouldIncrementUnread =
          message.senderId !== userId &&
          message.threadId !== selectedThreadId;
        const updatedThread = {
          ...thread,
          messages: [message],
          updatedAt: new Date().toISOString(),
          unreadCount: shouldIncrementUnread
            ? (thread.unreadCount || 0) + 1
            : thread.unreadCount,
        };

        // Move the updated thread to the top of the list
        return [
          updatedThread,
          ...prev.filter((t) => t.id !== message.threadId),
        ];
      });
    };

    // Handle unread count updates from server
    const handleUnreadCountUpdate = (data: {
      threadId: string;
      unreadCount: number;
    }) => {
      // Skip updates for the thread we're currently viewing
      if (data.threadId === selectedThreadId) return;

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === data.threadId
            ? { ...thread, unreadCount: data.unreadCount }
            : thread
        )
      );
    };

    // Handle thread marked as read
    const handleThreadMarkedRead = (data: { threadId: string }) => {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === data.threadId
            ? { ...thread, unreadCount: 0 }
            : thread
        )
      );
    };

    socket.on("new_thread", handleNewThread);
    socket.on("thread_updated", handleThreadUpdate);
    socket.on("new_message", handleNewMessage);
    socket.on("unread_count_update", handleUnreadCountUpdate);
    socket.on("thread_marked_read", handleThreadMarkedRead);

    return () => {
      socket.off("new_thread", handleNewThread);
      socket.off("thread_updated", handleThreadUpdate);
      socket.off("new_message", handleNewMessage);
      socket.off("unread_count_update", handleUnreadCountUpdate);
      socket.off("thread_marked_read", handleThreadMarkedRead);
      // Clear any pending markAsRead timeout
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current);
      }
    };
  }, [socket, isConnected, userId, selectedThreadId]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Join all thread rooms to receive real-time updates for all conversations
  useEffect(() => {
    if (!socket || !isConnected || threads.length === 0) return;

    // Get thread IDs to join
    const threadIds = threads.map((t) => t.id);

    // Join all thread rooms
    threadIds.forEach((threadId) => {
      socket.emit("join_thread", threadId);
    });

    console.log(`📥 [Socket] Joined ${threadIds.length} thread rooms for real-time updates`);

    return () => {
      threadIds.forEach((threadId) => {
        socket.emit("leave_thread", threadId);
      });
      console.log(`📤 [Socket] Left ${threadIds.length} thread rooms`);
    };
  }, [socket, isConnected, threads.length]); // Use threads.length to avoid re-running on every thread update

  // Function to update a thread's last message (for optimistic updates when sending)
  const updateThreadLastMessage = useCallback((threadId: string, message: Message) => {
    setThreads((prev) => {
      const threadExists = prev.some((t) => t.id === threadId);
      if (!threadExists) return prev;

      const thread = prev.find((t) => t.id === threadId)!;
      return [
        { ...thread, messages: [message], updatedAt: new Date().toISOString() },
        ...prev.filter((t) => t.id !== threadId),
      ];
    });
  }, []);

  // Function to add a thread optimistically (used when creating new chats)
  const addThreadOptimistically = useCallback((newThread: Thread) => {
    setThreads((prev) => {
      // Check if thread already exists (avoid duplicates)
      if (prev.some((t) => t.id === newThread.id)) {
        return prev;
      }
      // Add new thread at the beginning
      return [newThread, ...prev];
    });
  }, []);

  // Function to mark a thread as read
  const markThreadAsRead = useCallback(async (threadId: string) => {
    try {
      await axiosInstance.post(endpoints.chat.markThreadAsRead(threadId));
      // Optimistically update local state
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, unreadCount: 0 }
            : thread
        )
      );
    } catch (error) {
      console.error("Failed to mark thread as read:", error);
      // Silently fail - don't disrupt user experience
    }
  }, []);

  return {
    threads,
    loading,
    error,
    refetch: fetchThreads,
    updateThreadLastMessage,
    addThreadOptimistically,
    markThreadAsRead,
  };
}

export function useMessages(threadId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected, joinThread, leaveThread } = useSocket();
  const currentThreadRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        endpoints.chat.getMessages(threadId)
      );

      if (response.data) {
        if (response.data.success && response.data.data) {
          setMessages(
            Array.isArray(response.data.data) ? response.data.data : []
          );
        } else if (Array.isArray(response.data)) {
          setMessages(response.data);
        } else if (
          response.data.messages &&
          Array.isArray(response.data.messages)
        ) {
          setMessages(response.data.messages);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch messages";
      setError(errorMessage);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const sendMessage = useCallback(
    async (content: string, senderId: string, repliesToId?: string) => {
      if (!threadId) return;

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        threadId,
        senderId,
        content,
        createdAt: new Date().toISOString(),
        sender: {
          id: senderId,
          name: "You",
        },
      };

      // Optimistically add to UI
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const payload: any = {
          senderId,
          content,
        };
        
        if (repliesToId) {
          payload.repliesToId = repliesToId;
        }

        const response = await axiosInstance.post(
          endpoints.chat.sendMessage(threadId),
          payload
        );

        let newMessage = null;

        if (response.data) {
          if (response.data.success && response.data.data) {
            newMessage = response.data.data;
          } else if (response.data.message) {
            newMessage = response.data.message;
          } else if (response.data.id) {
            newMessage = response.data;
          }
        }

        if (newMessage) {
          // Don't replace immediately - the socket broadcast will handle it
          // This prevents race conditions and duplicate messages
          console.log('✅ Message sent successfully, waiting for socket broadcast');
          return newMessage;
        }
      } catch (err: any) {
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        
        console.error("Error sending message:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to send message";
        toast.error(errorMessage);
        throw err;
      }
    },
    [threadId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!threadId) return;

      // Store original messages for rollback
      const originalMessages = [...messages];

      try {
        // Optimistically update the UI first
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  content: "This message has been deleted",
                }
              : msg
          )
        );

        await axiosInstance.delete(
          endpoints.chat.deleteMessage(messageId)
        );

        toast.success("Message deleted successfully");
        return true;
      } catch (err: any) {
        // Rollback optimistic update on failure
        setMessages(originalMessages);

        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete message";
        toast.error(errorMessage);
        throw err;
      }
    },
    [threadId, messages]
  );

  // Socket event listeners for real-time messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: Message) => {
      console.log('🔔 [Socket] Received new_message event:', {
        messageId: message.id,
        threadId: message.threadId,
        currentThreadId: threadId,
        senderId: message.senderId,
        content: message.content?.substring(0, 50)
      });
      
      // Only add message if it belongs to current thread
      if (message.threadId === threadId) {
        // Check if message already exists (avoid duplicates)
        setMessages((prev) => {
          // Check if this exact message already exists
          const exists = prev.some(m => m.id === message.id);
          if (exists) {
            console.log('⚠️ [Socket] Message already exists, skipping duplicate:', message.id);
            return prev;
          }
          
          // Check if there's a temp message that should be replaced
          // This handles the case where we sent the message and got the real one back
          const hasTempMessage = prev.some(m => m.id.startsWith('temp-'));
          if (hasTempMessage) {
            console.log('🔄 [Socket] Found temp message, replacing with real message:', message.id);
            // Remove all temp messages and add the real one
            return [...prev.filter(m => !m.id.startsWith('temp-')), message];
          }
          
          console.log('✅ [Socket] Adding new message to state:', message.id);
          return [...prev, message];
        });
      } else {
        console.log('⏭️ [Socket] Message not for current thread, ignoring');
      }
    };

    const handleMessageDeleted = (data: { messageId: string; threadId: string }) => {
      console.log('🗑️ [Socket] Received message_deleted event:', data);
      
      if (data.threadId === threadId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  content: "This message has been deleted",
                }
              : msg
          )
        );
      }
    };

    const handleMessageSent = (data: {
      messageId: string;
      threadId: string;
    }) => {};

    const handleMessageRead = (data: {
      messageId: string;
      threadId: string;
      readerId: string;
      readerName: string;
    }) => {
      if (data.threadId === threadId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  readBy: [
                    ...(msg.readBy || []),
                    {
                      id: `${data.messageId}-${data.readerId}`,
                      userId: data.readerId,
                      messageId: data.messageId,
                      readAt: new Date().toISOString(),
                      user: {
                        id: data.readerId,
                        name: data.readerName,
                      },
                    },
                  ],
                }
              : msg
          )
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket, isConnected, threadId]);

  // Join/leave thread rooms
  useEffect(() => {
    if (!threadId || !isConnected) return;

    if (currentThreadRef.current && currentThreadRef.current !== threadId) {
      console.log('👋 [Socket] Leaving previous thread:', currentThreadRef.current);
      leaveThread(currentThreadRef.current);
    }

    console.log('🚪 [Socket] Joining thread room:', threadId);
    joinThread(threadId);
    currentThreadRef.current = threadId;

    return () => {
      if (threadId) {
        leaveThread(threadId);
        currentThreadRef.current = null;
      }
    };
  }, [threadId, isConnected, joinThread, leaveThread]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await axiosInstance.post(endpoints.chat.markAsRead(messageId));
    } catch {
      // Silently fail - read receipts shouldn't block user interaction
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
    deleteMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}

export function useTypingIndicator(threadId?: string, members?: ThreadMember[] | ChatParticipant[]) {
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: string; userName: string }>
  >([]);
  const { socket, isConnected, sendTyping } = useSocket();
  const { data: session } = useSession();
  const user = session?.user;
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clear typing timeout and reset state when thread changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = undefined;
      }
      // Reset typing users when leaving thread
      setTypingUsers([]);
    };
  }, [threadId]);

  useEffect(() => {
    if (!socket || !isConnected || !threadId) {
      return;
    }

    const handleTypingStatus = (data: {
      threadId: string;
      senderId: string;
      isTyping: boolean;
    }) => {
      if (data.threadId !== threadId) {
        return;
      }

      if (data.senderId === user?.id) {
        return;
      }

      setTypingUsers((prev) => {
        if (data.isTyping) {
          const exists = prev.some(
            (typingUser) => typingUser.userId === data.senderId
          );
          if (exists) {
            return prev;
          }

          // Get actual user name from thread members (supports both ChatParticipant and ThreadMember)
          const member = members?.find((m) => {
            // ChatParticipant has 'id', ThreadMember has 'userId'
            const memberId = 'userId' in m ? m.userId : m.id;
            return memberId === data.senderId;
          });
          
          // Handle both ChatParticipant (has 'name' directly) and ThreadMember (has 'user.name')
          const userName = member 
            ? ('user' in member ? (member.user?.name || member.user?.username) : (member.name || member.username))
            : "Someone";
          
          return [
            ...prev,
            { userId: data.senderId, userName: userName || "Someone" },
          ];
        } else {
          return prev.filter(
            (typingUser) => typingUser.userId !== data.senderId
          );
        }
      });
    };

    socket.on("typing_status", handleTypingStatus);

    return () => {
      socket.off("typing_status", handleTypingStatus);
    };
  }, [socket, isConnected, threadId, user?.id, members]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!threadId) {
        return;
      }

      sendTyping(threadId, isTyping);

      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(threadId, false);
        }, 3000);
      } else {
        // Clear timeout when explicitly stopping typing
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = undefined;
        }
      }
    },
    [threadId, sendTyping]
  );

  return {
    typingUsers,
    setTyping,
  };
}

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

      const response = await axiosInstance.get(
        endpoints.chat.getThreadMembers(threadId)
      );

      if (response.data) {
        if (response.data.success && response.data.data) {
          setMembers(
            Array.isArray(response.data.data) ? response.data.data : []
          );
        } else if (Array.isArray(response.data)) {
          setMembers(response.data);
        } else if (
          response.data.members &&
          Array.isArray(response.data.members)
        ) {
          setMembers(response.data.members);
        } else {
          setMembers([]);
        }
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      console.error("Error fetching thread members:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch thread members";
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

export function useCreateThread() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createThread = useCallback(
    async (data: {
      name?: string;
      isGroup: boolean;
      userIds: string[];
      createdBy: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.post(
          endpoints.chat.createThread,
          data
        );

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
            toast.success("Thread created successfully");
            return newThread;
          }
        }

        throw new Error("Failed to create thread");
      } catch (err: any) {
        console.error("Error creating thread:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create thread";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

      const response = await axiosInstance.get(
        endpoints.chat.getAvailableUsers(currentUserId)
      );

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

      const filteredUsers = usersData.filter(
        (user) => user.id !== currentUserId
      );
      setUsers(filteredUsers);
    } catch (err: any) {
      console.error("Error fetching available users:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch users";
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
