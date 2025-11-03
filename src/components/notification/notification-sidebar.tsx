"use client";

import React, { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconBell,
  IconCheck,
  IconCheckbox,
  IconRefresh,
  IconSettings,
  IconBellRinging,
  IconArchive,
  IconSearch,
  IconFilter,
  IconBellOff,
  IconDots,
} from "@tabler/icons-react";
import { useNotifications, type Notification, type NotificationType } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: "ADMIN_MESSAGE", label: "Admin Messages" },
  { value: "SEASON_INVITATION", label: "Season Invitations" },
  { value: "MATCH_REMINDER", label: "Match Reminders" },
  { value: "PAIR_REQUEST", label: "Pair Requests" },
  { value: "DIVISION_UPDATE", label: "Division Updates" },
  { value: "SYSTEM_ALERT", label: "System Alerts" },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ADMIN_MESSAGE":
      return <IconSettings className="h-3.5 w-3.5" />;
    case "SEASON_INVITATION":
      return <IconBellRinging className="h-3.5 w-3.5" />;
    case "MATCH_REMINDER":
      return <IconBell className="h-3.5 w-3.5" />;
    case "PAIR_REQUEST":
      return <IconBellRinging className="h-3.5 w-3.5" />;
    case "DIVISION_UPDATE":
      return <IconBell className="h-3.5 w-3.5" />;
    case "SYSTEM_ALERT":
      return <IconSettings className="h-3.5 w-3.5" />;
    default:
      return <IconBell className="h-3.5 w-3.5" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "ADMIN_MESSAGE":
      return "text-blue-600";
    case "SEASON_INVITATION":
      return "text-green-600";
    case "MATCH_REMINDER":
      return "text-orange-600";
    case "PAIR_REQUEST":
      return "text-purple-600";
    case "DIVISION_UPDATE":
      return "text-indigo-600";
    case "SYSTEM_ALERT":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// Minimalist notification item for sidebase style
const NotificationItem = React.memo(({ 
  notification, 
  onMarkAsRead, 
  onArchive 
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}) => {
  const iconColor = getNotificationColor(notification.type);

  const handleMarkAsRead = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);

  const handleArchive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive(notification.id);
  }, [notification.id, onArchive]);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer border-l-2 border-transparent",
        !notification.read && "bg-accent/30 border-l-primary"
      )}
    >
      {/* Icon with colored background */}
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center mt-0.5", iconColor)}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {notification.title && (
              <p className="text-sm font-medium text-foreground leading-5 truncate">
                {notification.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-4 line-clamp-2 mt-0.5">
              {notification.message}
            </p>
            
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-1.5">
              <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
              <IconDots className="h-2 w-2" />
              <span className="capitalize">{notification.type.replace('_', ' ').toLowerCase()}</span>
            </div>
          </div>

          {/* Unread indicator */}
          {!notification.read && (
            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
          )}
        </div>

        {/* Action buttons - show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleMarkAsRead}
            >
              <IconCheck className="h-3 w-3" />
            </Button>
          )}
          {/* <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleArchive}
          >
            <IconArchive className="h-3 w-3" />
          </Button> */}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";

export default function NotificationsSidebar({ open, onOpenChange }: NotificationsSidebarProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications.filter(n => !n.archive);

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.message.toLowerCase().includes(query) ||
        n.title?.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filter, typeFilter, searchQuery]);

  const unreadCountTotal = notifications.filter(n => !n.read && !n.archive).length;

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
    setFilter('all');
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-[400px] p-0 flex flex-col">
        {/* Header - Clean and minimal */}
        <div className="flex items-center justify-between p-12 border-b">
          <div className="flex items-center gap-2">
            <IconBell className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCountTotal > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-7 w-7 p-0"
                    >
                      <IconCheckbox className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Mark all as read</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="h-7 w-7 p-0"
            >
              <IconRefresh className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Compact filter section */}
        <div className="p-3 border-b bg-accent/20 space-y-2">
          {/* Quick filter buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant={filter === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-6 px-2 text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter('unread')}
              className="h-6 px-2 text-xs gap-1"
            >
              Unread
              {unreadCountTotal > 0 && (
                <Badge variant="secondary" className="text-[9px] h-3 px-1">
                  {unreadCountTotal}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search and type filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 text-xs pl-7"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | "all")}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {NOTIFICATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs">
                    {type.label.split(' ')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || typeFilter !== "all" || filter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters} 
              className="h-6 px-2 text-xs w-full"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="flex-1">
          <div className="relative">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-1/2" />
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
              <div className="text-center py-8 px-4">
                <IconBellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery || typeFilter !== "all" 
                    ? 'No matching notifications'
                    : filter === 'unread' 
                      ? 'All caught up!' 
                      : 'No notifications'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || typeFilter !== "all"
                    ? 'Try adjusting your filters.'
                    : filter === 'unread' 
                      ? 'You have no unread notifications.'
                      : 'Notifications will appear here.'
                  }
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Simple footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t bg-accent/10">
            <p className="text-xs text-center text-muted-foreground">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              {filter === 'unread' && unreadCountTotal > 0 && ` • ${unreadCountTotal} unread`}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}