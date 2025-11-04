"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useSocket } from "@/context/socket-context";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";


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
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byCategory: Record<NotificationCategory, number>;
  byType: Record<string, number>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { data: session } = useSession();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    archived?: boolean;
    category?: NotificationCategory;
    categories?: NotificationCategory[];
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
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);


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


  
  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.user?.id) return;

    try {
      await axiosInstance.put(endpoints.notifications.markRead(notificationId));
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [session?.user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

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
      console.error('Error archiving notification:', error);
    }
  }, [session?.user?.id, notifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initialize and set up socket listeners
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, fetchNotifications]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications(prev => 
        prev.map(n => 
          n.id === data.notificationId 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
    };
  }, [socket, session?.user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
  
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
};