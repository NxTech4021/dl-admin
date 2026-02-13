"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useSocket } from "@/contexts/socket-context";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { logger } from "@/lib/logger";

interface Thread {
  id: string;
  unreadCount?: number;
}

export function useChatUnreadCount(activeThreadId?: string | null) {
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Remember the last viewed thread to exclude it from counts even after navigating away
  const lastViewedThreadRef = useRef<string | null>(null);

  // Update ref when activeThreadId changes (only when it has a value)
  useEffect(() => {
    if (activeThreadId) {
      lastViewedThreadRef.current = activeThreadId;
    }
  }, [activeThreadId]);

  // Use activeThreadId if available, otherwise fall back to last viewed
  const threadToExclude = activeThreadId || lastViewedThreadRef.current;

  // Fetch initial total unread count from threads
  const fetchTotalUnread = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        endpoints.chat.getThreads(userId)
      );

      let threads: Thread[] = [];
      if (response.data?.success && response.data.data) {
        threads = response.data.data;
      } else if (Array.isArray(response.data)) {
        threads = response.data;
      } else if (response.data?.threads && Array.isArray(response.data.threads)) {
        threads = response.data.threads;
      }

      // Sum unread counts EXCLUDING the thread we're viewing (or last viewed)
      const total = threads.reduce(
        (sum: number, thread: Thread) => {
          if (thread.id === threadToExclude) return sum; // Skip excluded thread
          return sum + (thread.unreadCount || 0);
        },
        0
      );
      setTotalUnread(total);
    } catch (error) {
      logger.error("Failed to fetch chat unread count:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, threadToExclude]);

  // Initial fetch
  useEffect(() => {
    fetchTotalUnread();
  }, [fetchTotalUnread]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle unread count updates from server
    const handleUnreadUpdate = (data: {
      threadId: string;
      unreadCount: number;
      previousUnreadCount?: number;
    }) => {
      // Skip updates for the thread we're viewing (or last viewed)
      if (data.threadId === threadToExclude) return;

      // If we have previous count info, calculate the diff
      if (data.previousUnreadCount !== undefined) {
        const diff = data.unreadCount - data.previousUnreadCount;
        setTotalUnread((prev) => Math.max(0, prev + diff));
      } else {
        // Otherwise, refetch to get accurate count
        fetchTotalUnread();
      }
    };

    // Handle thread marked as read - subtract the unread count
    const handleThreadMarkedRead = (data: {
      threadId: string;
      previousUnreadCount?: number;
    }) => {
      if (data.previousUnreadCount !== undefined) {
        const count = data.previousUnreadCount;
        setTotalUnread((prev) => Math.max(0, prev - count));
      } else {
        // Refetch to get accurate count
        fetchTotalUnread();
      }
    };

    // Handle new message - increment if from another user AND not for the excluded thread
    const handleNewMessage = (message: { senderId: string; threadId?: string }) => {
      if (message.senderId !== userId && message.threadId !== threadToExclude) {
        setTotalUnread((prev) => prev + 1);
      }
    };

    socket.on("unread_count_update", handleUnreadUpdate);
    socket.on("thread_marked_read", handleThreadMarkedRead);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("unread_count_update", handleUnreadUpdate);
      socket.off("thread_marked_read", handleThreadMarkedRead);
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, isConnected, userId, threadToExclude, fetchTotalUnread]);

  return {
    totalUnread,
    loading,
    refetch: fetchTotalUnread,
  };
}
