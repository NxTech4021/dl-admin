

import React, { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
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
        "group relative flex items-start gap-2.5 p-2.5 hover:bg-accent/40 transition-colors cursor-pointer border-l border-transparent",
        !notification.read && "bg-primary/5 border-l-primary/60",
        notificationUrl && !selectMode && "hover:bg-accent/50",
        isSelected && "bg-primary/10 border-l-primary"
      )}
    >
      {/* Checkbox for select mode */}
      {selectMode && (
        <button
          onClick={handleCheckboxClick}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-1.5 cursor-pointer"
        >
          {isSelected ? (
            <IconSquareCheck className="h-3.5 w-3.5 text-primary" />
          ) : (
            <IconSquare className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      )}

      {/* Icon with colored background */}
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center mt-0.5", iconColor)}>
        <span className="[&>svg]:h-3 [&>svg]:w-3">
          {getNotificationIcon(notification.category)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1 pr-16">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {notification.title && (
              <p className="text-sm font-medium text-foreground leading-tight truncate">
                {notification.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5">
              {notification.message}
            </p>

            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70 mt-1.5">
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
      </div>

      {/* Action buttons - hover-only on desktop, always visible on touch */}
      <div
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "flex items-center gap-0.5",
          "bg-background/95 backdrop-blur-sm rounded-md p-0.5 shadow-sm border",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "focus-within:opacity-100",
          "touch-device:opacity-100"
        )}
      >
        {!notification.read && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleMarkAsRead}
                  className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <IconCheck className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Mark as read</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";

export default function NotificationsSidebar({ open, onOpenChange }: NotificationsSidebarProps) {
  const navigate = useNavigate();
  const {
    notifications,
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
    navigate({ to: url });
    onOpenChange(false);
  }, [navigate, onOpenChange]);

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
      <SheetContent side="right" className="w-full max-w-[400px] p-0 flex flex-col h-full overflow-hidden [&>button]:hidden">
        {/* Header + Filters (consolidated) */}
        <div className="px-3 pt-3 pb-2.5 space-y-2.5">
          {/* Title row with actions */}
          <div className="flex items-center justify-between">
            <DialogTitle asChild>
              <div className="flex items-center gap-2">
                <IconBell className="h-4 w-4 text-foreground/80" />
                <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                {unreadCountTotal > 0 && (
                  <span className="text-[11px] text-foreground/70 font-medium">
                    ({unreadCountTotal} unread)
                  </span>
                )}
              </div>
            </DialogTitle>

            <div className="flex items-center gap-1">
              {!selectMode && unreadCountTotal > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={markAllAsRead}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors border border-border/50 cursor-pointer"
                      >
                        <IconCheckbox className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Mark all read</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {filteredNotifications.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleSelectMode}
                        className={cn(
                          "inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors border cursor-pointer",
                          selectMode
                            ? "bg-primary text-primary-foreground border-primary/50"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted/70 border-border/50"
                        )}
                      >
                        {selectMode ? (
                          <IconX className="h-4 w-4" />
                        ) : (
                          <IconSelectAll className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{selectMode ? "Cancel" : "Select"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {!selectMode && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={refresh}
                        disabled={loading}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border/50 cursor-pointer"
                      >
                        <IconRefresh className={cn("h-4 w-4", loading && "animate-spin")} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Refresh</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors border border-border/50 cursor-pointer"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Search input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm pl-9 pr-9 bg-background border border-border/60 rounded-md focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:border-ring text-foreground placeholder:text-foreground/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border border-border/50 cursor-pointer"
              >
                <IconX className="h-3 w-3 text-foreground/70" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-1.5">
            {/* Tab-style filter buttons */}
            <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5 flex-1 border border-border/50">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "flex-1 inline-flex items-center justify-center rounded px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  filter === 'all'
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                All
                <span className={cn(
                  "ml-1.5 text-[10px] font-medium",
                  filter === 'all' ? "text-foreground/70" : "text-foreground/50"
                )}>
                  {notifications.filter(n => !n.archive).length}
                </span>
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  "flex-1 inline-flex items-center justify-center rounded px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  filter === 'unread'
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                Unread
                {unreadCountTotal > 0 && (
                  <span className={cn(
                    "ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1.5 text-[10px] font-semibold rounded-full",
                    filter === 'unread'
                      ? "bg-red-600 text-white"
                      : "bg-red-500/20 text-red-700 dark:text-red-400"
                  )}>
                    {unreadCountTotal}
                  </span>
                )}
              </button>
            </div>

            {/* Category filter dropdown */}
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as NotificationCategory | "all")}>
              <SelectTrigger className={cn(
                "w-auto h-9 text-xs gap-1.5 rounded-md px-2.5 transition-colors border cursor-pointer",
                categoryFilter !== "all"
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "bg-background border-border/60 text-foreground/80 hover:text-foreground hover:border-border"
              )}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all" className="text-xs text-foreground">All categories</SelectItem>
                {NOTIFICATION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-xs text-foreground">
                    <span className="flex items-center gap-1.5">
                      {category.icon}
                      {category.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters summary */}
          {(searchQuery || categoryFilter !== "all") && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-foreground/80 font-medium">
                {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''}
                {searchQuery && <span className="ml-1">for &ldquo;{searchQuery}&rdquo;</span>}
                {categoryFilter !== "all" && <span className="ml-1">in {categoryFilter.toLowerCase()}</span>}
              </span>
              <button
                onClick={clearFilters}
                className="text-foreground/70 hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/70 transition-colors border border-border/50 cursor-pointer"
              >
                <IconX className="h-3 w-3" />
                Clear
              </button>
            </div>
          )}
        </div>
        <Separator />

        {/* Notification list */}
        <ScrollArea className="flex-1 min-h-0">
          <div>
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2.5 p-2.5 animate-pulse">
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
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      onNavigate={handleNavigate}
                      selectMode={selectMode}
                      isSelected={selectedIds.has(notification.id)}
                      onToggleSelect={toggleSelect}
                    />
                    {index < filteredNotifications.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
                {pagination.hasMore && (
                  <>
                    <Separator />
                    <div className="p-3">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full inline-flex items-center justify-center gap-2 h-8 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {loadingMore ? (
                          <>
                            <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Load more
                            <span className="text-muted-foreground/60">
                              ({pagination.total - notifications.length} remaining)
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-6 px-4">
                <IconBellOff className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground mb-0.5">
                  {searchQuery || categoryFilter !== "all"
                    ? 'No matching notifications'
                    : filter === 'unread'
                      ? 'All caught up!'
                      : 'No notifications'
                  }
                </p>
                <p className="text-[11px] text-muted-foreground">
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
          <>
            <Separator />
            <div className="px-3 py-2">
              {selectMode ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {selectedIds.size} of {filteredNotifications.length} selected
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => selectAllFiltered(filteredNotifications.map(n => n.id))}
                        disabled={selectedIds.size === filteredNotifications.length}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        Select all
                      </button>
                      {selectedIds.size > 0 && (
                        <button
                          onClick={deselectAll}
                          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedIds.size === 0}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                      Delete ({selectedIds.size})
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-center text-muted-foreground">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                  {filter === 'unread' && unreadCountTotal > 0 && ` • ${unreadCountTotal} unread`}
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}