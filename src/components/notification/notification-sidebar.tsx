"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  IconBellRinging,
  IconSearch,
  IconBellOff,
  IconTrash,
  IconCircleFilled,
  IconUsers,
  IconTrophy,
  IconMessage,
  IconCreditCard,
  IconShield,
  IconCalendar,
  IconExternalLink,
  IconLoader2,
  IconSquare,
  IconSquareCheck,
  IconX,
  IconSelectAll,
} from "@tabler/icons-react";
import { useNotifications, getNotificationUrl, type Notification, type NotificationCategory } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Updated to match your backend categories
const NOTIFICATION_CATEGORIES: { value: NotificationCategory; label: string; icon: React.ReactNode }[] = [
  { 
    value: "DIVISION", 
    label: "Division", 
    icon: <IconUsers className="h-3.5 w-3.5" />
  },
  { 
    value: "LEAGUE", 
    label: "League", 
    icon: <IconTrophy className="h-3.5 w-3.5" />
  },
  { 
    value: "CHAT", 
    label: "Chat", 
    icon: <IconMessage className="h-3.5 w-3.5" />
  },
  { 
    value: "MATCH", 
    label: "Match", 
    icon: <IconBellRinging className="h-3.5 w-3.5" />
  },
  { 
    value: "SEASON", 
    label: "Season", 
    icon: <IconCalendar className="h-3.5 w-3.5" />
  },
  { 
    value: "PAYMENT", 
    label: "Payment", 
    icon: <IconCreditCard className="h-3.5 w-3.5" />
  },
  { 
    value: "ADMIN", 
    label: "Admin", 
    icon: <IconShield className="h-3.5 w-3.5" />
  },
  { 
    value: "GENERAL", 
    label: "General", 
    icon: <IconBell className="h-3.5 w-3.5" />
  },
];

const getNotificationIcon = (category: NotificationCategory) => {
  const categoryConfig = NOTIFICATION_CATEGORIES.find(cat => cat.value === category);
  return categoryConfig?.icon || <IconBell className="h-3.5 w-3.5" />;
};

const getNotificationColor = (category: NotificationCategory) => {
  const colorMap: Record<NotificationCategory, string> = {
    DIVISION: "text-blue-600",
    LEAGUE: "text-green-600", 
    CHAT: "text-purple-600",
    MATCH: "text-orange-600",
    SEASON: "text-indigo-600",
    PAYMENT: "text-yellow-600",
    ADMIN: "text-red-600",
    GENERAL: "text-gray-600",
  };
  return colorMap[category] || "text-gray-600";
};

// Enhanced notification item with better UX
const NotificationItem = React.memo(({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (url: string) => void;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) => {
  const iconColor = getNotificationColor(notification.category);
  const notificationUrl = getNotificationUrl(notification);

  const handleMarkAsRead = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  }, [notification.id, onDelete]);

  const handleClick = useCallback(() => {
    if (selectMode) {
      onToggleSelect(notification.id);
      return;
    }
    // Mark as read when clicking
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Navigate if URL exists
    if (notificationUrl) {
      onNavigate(notificationUrl);
    }
  }, [notification.id, notification.read, notificationUrl, onMarkAsRead, onNavigate, selectMode, onToggleSelect]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(notification.id);
  }, [notification.id, onToggleSelect]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer border-l-2 border-transparent",
        !notification.read && "bg-accent/30 border-l-primary",
        notificationUrl && !selectMode && "hover:bg-accent/70",
        isSelected && "bg-primary/10 border-l-primary"
      )}
    >
      {/* Checkbox for select mode */}
      {selectMode && (
        <button
          onClick={handleCheckboxClick}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-1.5"
        >
          {isSelected ? (
            <IconSquareCheck className="h-4 w-4 text-primary" />
          ) : (
            <IconSquare className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      )}

      {/* Icon with colored background */}
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center mt-0.5", iconColor)}>
        {getNotificationIcon(notification.category)}
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
              {/* Status indicator with color based on read status */}
              {!notification.read ? (
                <IconCircleFilled className="h-1.5 w-1.5 text-red-500" />
              ) : (
                <div className="h-1.5 w-1.5 bg-current rounded-full opacity-50" />
              )}
              <span className="capitalize">{notification.category.toLowerCase()}</span>
              {notification.type && (
                <>
                  <div className="h-1 w-1 bg-current rounded-full opacity-50" />
                  <span className="capitalize">{notification.type.replace('_', ' ').toLowerCase()}</span>
                </>
              )}
              {notificationUrl && (
                <IconExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-60" />
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - always visible on the right */}
        <div className="flex items-center justify-end gap-1 mt-2">
          {!notification.read && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground border-muted-foreground/20"
                    onClick={handleMarkAsRead}
                  >
                    <IconCheck className="h-3 w-3" />
                    <span>Mark read</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <IconTrash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete notification</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";

export default function NotificationsSidebar({ open, onOpenChange }: NotificationsSidebarProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    pagination,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMany,
    clearAll,
    loadMore,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleNavigate = useCallback((url: string) => {
    router.push(url);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Note: selectAll uses notifications directly, not filteredNotifications
  // to avoid dependency issues - will be called after filteredNotifications is computed
  const selectAllFiltered = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    await deleteMany(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds, deleteMany]);

  const handleClearAll = useCallback(async () => {
    await clearAll();
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [clearAll]);


  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications.filter(n => !n.archive);

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(n => n.category === categoryFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.message.toLowerCase().includes(query) ||
        n.title?.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query) ||
        n.type?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filter, categoryFilter, searchQuery]);

  const unreadCountTotal = notifications.filter(n => !n.read && !n.archive).length;

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setFilter('all');
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-[400px] p-0 flex flex-col">
        {/* Header - Clean and minimal with proper spacing */}
        <div className="flex items-center justify-between p-4 pr-12 border-b">
          <DialogTitle asChild>
            <div className="flex items-center gap-2">
              <IconBell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </DialogTitle>

          <div className="flex items-center gap-1">
            {/* Select mode toggle */}
            {filteredNotifications.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectMode ? "default" : "ghost"}
                      size="sm"
                      onClick={toggleSelectMode}
                      className="h-7 w-7 p-0"
                    >
                      {selectMode ? (
                        <IconX className="h-3.5 w-3.5" />
                      ) : (
                        <IconSelectAll className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{selectMode ? "Cancel selection" : "Select multiple"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {!selectMode && unreadCountTotal > 0 && (
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

            {!selectMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="h-7 w-7 p-0"
              >
                <IconRefresh className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              </Button>
            )}
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
                <Badge variant="secondary" className="text-[9px] h-3 px-1 bg-red-500 text-white">
                  {unreadCountTotal}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search and category filter */}
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
            
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as NotificationCategory | "all")}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {NOTIFICATION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-xs">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || categoryFilter !== "all" || filter !== 'all') && (
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
              <>
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNavigate}
                    selectMode={selectMode}
                    isSelected={selectedIds.has(notification.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
                {pagination.hasMore && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full h-8 text-xs"
                    >
                      {loadingMore ? (
                        <>
                          <IconLoader2 className="h-3 w-3 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load more (${pagination.total - notifications.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 px-4">
                <IconBellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery || categoryFilter !== "all" 
                    ? 'No matching notifications'
                    : filter === 'unread' 
                      ? 'All caught up!' 
                      : 'No notifications'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || categoryFilter !== "all"
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

        {/* Footer - shows bulk actions in select mode, otherwise simple count */}
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t bg-accent/10">
            {selectMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllFiltered(filteredNotifications.map(n => n.id))}
                      className="h-6 px-2 text-xs"
                      disabled={selectedIds.size === filteredNotifications.length}
                    >
                      Select all
                    </Button>
                    {selectedIds.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAll}
                        className="h-6 px-2 text-xs"
                      >
                        Deselect
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="flex-1 h-7 text-xs"
                  >
                    <IconTrash className="h-3 w-3 mr-1" />
                    Delete selected ({selectedIds.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                {filter === 'unread' && unreadCountTotal > 0 && ` • ${unreadCountTotal} unread`}
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}