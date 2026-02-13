"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useSocket } from "@/contexts/socket-context";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

// Updated types to match your backend
export type NotificationCategory =
  | "DIVISION"
  | "LEAGUE"
  | "CHAT"
  | "MATCH"
  | "SEASON"
  | "PAYMENT"
  | "ADMIN"
  | "GENERAL";

export interface Notification {
  id: string;
  title?: string;
  message: string;
  category: NotificationCategory;
  type?: string;
  read: boolean;
  archive: boolean;
  createdAt: string | Date;
  readAt?: string | Date;
  metadata?: Record<string, string>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byCategory: Record<NotificationCategory, number>;
  byType: Record<string, number>;
}

// Helper to get navigation URL from notification metadata
export function getNotificationUrl(notification: Notification): string | null {
  const { category, metadata } = notification;

  // Check for explicit URL in metadata
  if (metadata?.url) return metadata.url;

  // Generate URL based on category and metadata IDs
  switch (category) {
    case "MATCH":
      if (metadata?.matchId) return `/matches/${metadata.matchId}`;
      break;
    case "LEAGUE":
      if (metadata?.leagueId) return `/league/${metadata.leagueId}`;
      break;
    case "SEASON":
      if (metadata?.seasonId) return `/seasons/${metadata.seasonId}`;
      break;
    case "DIVISION":
      if (metadata?.divisionId) return `/divisions/${metadata.divisionId}`;
      break;
    case "PAYMENT":
      if (metadata?.paymentId) return `/payments/${metadata.paymentId}`;
      if (metadata?.userId) return `/players/${metadata.userId}`;
      break;
    case "CHAT":
      if (metadata?.threadId) return `/chat?id=${metadata.threadId}`;
      break;
    case "ADMIN":
      // Admin notifications might link to specific resources
      if (metadata?.disputeId) return `/disputes/${metadata.disputeId}`;
      if (metadata?.reportId) return `/reports/${metadata.reportId}`;
      break;
  }

  return null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (
      options: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        archived?: boolean;
        category?: NotificationCategory;
        categories?: NotificationCategory[];
        append?: boolean; // For pagination - append to existing notifications
      } = {}
    ) => {
      if (!session?.user?.id) return;

      try {
        if (options.append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();

        if (options.page) params.append("page", options.page.toString());
        if (options.limit) params.append("limit", options.limit.toString());
        if (options.unreadOnly) params.append("unreadOnly", "true");
        if (options.archived !== undefined)
          params.append("archived", options.archived.toString());

        const response = await axiosInstance.get(
          `${endpoints.notifications.getAll}?${params}`
        );

        if (response.data?.success) {
          // Handle both interceptor-flattened and raw envelope shapes
          const payload = response.data.data;
          const newNotifications = Array.isArray(payload) ? payload : (payload?.notifications || payload?.data || []);
          const paginationData = response.data.pagination || payload?.pagination;

          if (options.append) {
            // Append to existing notifications (for load more)
            setNotifications((prev) => [...prev, ...newNotifications]);
          } else {
            // Replace notifications (for initial load or refresh)
            setNotifications(newNotifications);
          }

          // Update pagination state
          if (paginationData) {
            setPagination({
              page: paginationData.page || 1,
              limit: paginationData.limit || 20,
              total: paginationData.total || 0,
              totalPages: paginationData.totalPages || 0,
              hasMore: paginationData.hasMore || false,
            });
          }
        }
      } catch (error) {
        logger.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [session?.user?.id]
  );

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (loadingMore || !pagination.hasMore) return;

    await fetchNotifications({
      page: pagination.page + 1,
      limit: pagination.limit,
      append: true,
    });
  }, [fetchNotifications, loadingMore, pagination.hasMore, pagination.page, pagination.limit]);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await axiosInstance.get(
        endpoints.notifications.unreadCount
      );
      if (response.data?.success) {
        const countPayload = response.data.data;
        setUnreadCount(countPayload?.unreadCount ?? (typeof countPayload === "number" ? countPayload : 0));
      }
    } catch (error) {
      logger.error("Failed to fetch unread count:", error);
    }
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!session?.user?.id) return;

      try {
        await axiosInstance.put(
          endpoints.notifications.markRead(notificationId)
        );

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, read: true, readAt: new Date().toISOString() }
              : n
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        logger.error("Error marking notification as read:", error);
      }
    },
    [session?.user?.id]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await axiosInstance.put(
        endpoints.notifications.markAllRead
      );

      if (response.data?.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      logger.error("Error archiving notification:", error);
    }
  }, [session?.user?.id]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!session?.user?.id) return;

      try {
        const notification = notifications.find((n) => n.id === notificationId);

        await axiosInstance.delete(
          endpoints.notifications.delete(notificationId)
        );

        // Update local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update unread count if notification was unread
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        toast.success("Notification deleted");
      } catch (error) {
        logger.error("Error deleting notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [session?.user?.id, notifications]
  );

  // Delete multiple notifications
  const deleteMany = useCallback(
    async (notificationIds: string[]) => {
      if (!session?.user?.id || notificationIds.length === 0) return;

      try {
        // Count unread notifications being deleted
        const unreadBeingDeleted = notifications.filter(
          (n) => notificationIds.includes(n.id) && !n.read
        ).length;

        await axiosInstance.post(endpoints.notifications.deleteMany, {
          ids: notificationIds,
        });

        // Update local state
        setNotifications((prev) =>
          prev.filter((n) => !notificationIds.includes(n.id))
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - unreadBeingDeleted));

        toast.success(`${notificationIds.length} notification${notificationIds.length > 1 ? 's' : ''} deleted`);
      } catch (error) {
        logger.error("Error deleting notifications:", error);
        toast.error("Failed to delete notifications");
      }
    },
    [session?.user?.id, notifications]
  );

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      await axiosInstance.delete(endpoints.notifications.clearAll);

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      setPagination((prev) => ({ ...prev, total: 0, hasMore: false }));

      toast.success("All notifications cleared");
    } catch (error) {
      logger.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  }, [session?.user?.id]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initialize and set up socket listeners
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [session?.user?.id, fetchNotifications, fetchUnreadCount]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.id) return;

    logger.debug("🔔 [Notifications] Setting up socket listeners for user:", session.user.id);

    const handleNewNotification = (notification: Notification) => {
      logger.debug("🔔 [Notifications] Received new_notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleNotificationRead = (data: { notificationId: string }) => {
      logger.debug("🔔 [Notifications] Received notification_read:", data);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      logger.debug("🔔 [Notifications] Received all_notifications_read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("notification_read", handleNotificationRead);
    socket.on("all_notifications_read", handleAllNotificationsRead);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification_read", handleNotificationRead);
      socket.off("all_notifications_read", handleAllNotificationsRead);
    };
  }, [socket, isConnected, session?.user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    pagination,

    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMany,
    clearAll,
    loadMore,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
};
