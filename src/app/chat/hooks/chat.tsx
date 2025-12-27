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
} from "@/constants/types/chat";

export function useChatData(userId?: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();

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
      setThreads((prev) => {
        const threadIndex = prev.findIndex((t) => t.id === message.threadId);
        if (threadIndex === -1) return prev;

        const updatedThreads = [...prev];
        const thread = updatedThreads[threadIndex];

        // Update the thread's messages array (used for lastMessage display)
        updatedThreads[threadIndex] = {
          ...thread,
          messages: [message],
          updatedAt: new Date().toISOString(),
        };

        // Move the updated thread to the top of the list
        updatedThreads.splice(threadIndex, 1);
        updatedThreads.unshift(updatedThreads[threadIndex] ? thread : updatedThreads[threadIndex]);

        return [
          { ...thread, messages: [message], updatedAt: new Date().toISOString() },
          ...prev.filter((t) => t.id !== message.threadId),
        ];
      });
    };

    socket.on("new_thread", handleNewThread);
    socket.on("thread_updated", handleThreadUpdate);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_thread", handleNewThread);
      socket.off("thread_updated", handleThreadUpdate);
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

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

  return {
    threads,
    loading,
    error,
    refetch: fetchThreads,
    updateThreadLastMessage,
    addThreadOptimistically,
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
          // Add message to local state immediately for instant UI feedback
          setMessages((prev) => [...prev, newMessage]);
          return newMessage;
        }
      } catch (err: any) {
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
      // Only add message if it belongs to current thread
      if (message.threadId === threadId) {
        // Prevent duplicate if we already added it optimistically
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    const handleMessageDeleted = (data: { messageId: string; threadId: string }) => {
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
      leaveThread(currentThreadRef.current);
    }

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

export function useTypingIndicator(threadId?: string) {
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

          // TODO: use actual User name from participants
          return [
            ...prev,
            { userId: data.senderId, userName: "Someone" },
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
  }, [socket, isConnected, threadId, user?.id]);

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
