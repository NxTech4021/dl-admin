"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  IconBell,
  IconCheck,
  IconCheckbox,
  IconTrash,
  IconRefresh,
  IconFilter,
  IconSettings,
  IconBellRinging,
  IconArchive,
} from "@tabler/icons-react";
import { useNotifications, type Notification, type NotificationType } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ADMIN_MESSAGE":
      return <IconSettings className="h-4 w-4" />;
    case "SEASON_INVITATION":
      return <IconBellRinging className="h-4 w-4" />;
    case "MATCH_REMINDER":
      return <IconBell className="h-4 w-4" />;
    case "PAIR_REQUEST":
      return <IconBellRinging className="h-4 w-4" />;
    case "DIVISION_UPDATE":
      return <IconBell className="h-4 w-4" />;
    case "SYSTEM_ALERT":
      return <IconSettings className="h-4 w-4" />;
    default:
      return <IconBell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "ADMIN_MESSAGE":
      return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "SEASON_INVITATION":
      return "bg-green-500/10 text-green-600 border-green-200";
    case "MATCH_REMINDER":
      return "bg-orange-500/10 text-orange-600 border-orange-200";
    case "PAIR_REQUEST":
      return "bg-purple-500/10 text-purple-600 border-purple-200";
    case "DIVISION_UPDATE":
      return "bg-indigo-500/10 text-indigo-600 border-indigo-200";
    case "SYSTEM_ALERT":
      return "bg-red-500/10 text-red-600 border-red-200";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-200";
  }
};

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onArchive 
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}) => {
  const iconColorClass = getNotificationColor(notification.type);

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50",
        !notification.read && "bg-primary/5 border-primary/20"
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", iconColorClass)}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className="text-sm font-medium text-foreground mb-1 truncate">
                {notification.title}
              </h4>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {notification.message}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {notification.type.replace('_', ' ').toLowerCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onMarkAsRead(notification.id)}
                title="Mark as read"
              >
                <IconCheck className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onArchive(notification.id)}
              title="Archive"
            >
              <IconArchive className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NotificationsSidebar({ open, onOpenChange }: NotificationsSidebarProps) {
  const {
    notifications,
    unreadCount,
    loading,
    stats,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBell className="h-5 w-5" />
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <IconRefresh className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
          <SheetDescription>
            Stay updated with the latest activities and announcements.
          </SheetDescription>
        </SheetHeader>

        {/* Filter and Actions */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-7 text-xs"
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="h-7 text-xs"
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-xs"
              >
                <IconCheckbox className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg border animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onArchive={archiveNotification}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <IconBell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'unread' 
                      ? 'All caught up! You have no unread notifications.'
                      : 'You\'ll see notifications here when you receive them.'
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Stats Footer */}
        {stats && (
          <div className="px-6 py-3 border-t bg-muted/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{stats.unread}</div>
                <div className="text-xs text-muted-foreground">Unread</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-muted-foreground">{stats.archived}</div>
                <div className="text-xs text-muted-foreground">Archived</div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}