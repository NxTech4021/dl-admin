"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/socket-context";
import { useSession } from "@/lib/auth-client";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

export type NotificationType = 
  | "ADMIN_MESSAGE"
  | "SEASON_INVITATION"
  | "MATCH_REMINDER"
  | "PAIR_REQUEST"
  | "DIVISION_UPDATE"
  | "SYSTEM_ALERT";

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
  read: boolean;
  archive: boolean;
  createdAt: string | Date;
  readAt?: string | Date;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byType: Record<NotificationType, number>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  
  const { socket } = useSocket();
  const { data: session } = useSession();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    archived?: boolean;
  } = {}) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.archived !== undefined) params.append('archived', options.archived.toString());

      const response = await axiosInstance.get(`${endpoints.notifications.getAll}?${params}`);
      
      if (response.data?.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await axiosInstance.get(endpoints.notifications.unreadCount);
      if (response.data?.success) {
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [session?.user?.id]);

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await axiosInstance.get(endpoints.notifications.stats);
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axiosInstance.put(endpoints.notifications.markRead(notificationId));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark as read');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axiosInstance.put(endpoints.notifications.markAllRead);
      
      if (response.data?.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      await axiosInstance.put(endpoints.notifications.archive(notificationId));
      
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      toast.success('Notification archived');
    } catch (error) {
      console.error('Failed to archive notification:', error);
      toast.error('Failed to archive notification');
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.title || notification.message, {
        description: notification.title ? notification.message : undefined,
      });
    };

    const handleNotificationRead = ({ notificationId }: { notificationId: string }) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
    };

    const handleAllNotificationsRead = () => {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_read', handleNotificationRead);
    socket.on('all_notifications_read', handleAllNotificationsRead);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_read', handleNotificationRead);
      socket.off('all_notifications_read', handleAllNotificationsRead);
    };
  }, [socket]);

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      fetchUnreadCount();
      fetchStats();
    }
  }, [session?.user?.id, fetchNotifications, fetchUnreadCount, fetchStats]);

  return {
    notifications,
    unreadCount,
    loading,
    stats,
    fetchNotifications,
    fetchUnreadCount,
    fetchStats,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
      fetchStats();
    },
  };
};