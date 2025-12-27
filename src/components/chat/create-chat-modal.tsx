import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAvailableUsers, useCreateThread } from '@/app/chat/hooks/chat';
import type { AvailableUser } from '@/constants/types/chat';
import { toast } from 'sonner';

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onThreadCreated?: () => Promise<void> | void;
  addThreadOptimistically?: (thread: any) => void;
}

// Helper function to format last active time
const formatLastActive = (lastActiveAt?: string, isOnline?: boolean): string => {
  if (isOnline) return 'Active now';
  if (!lastActiveAt) return '';

  try {
    const date = new Date(lastActiveAt);
    return `Active ${formatDistanceToNow(date)} ago`;
  } catch {
    return '';
  }
};

const UserSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <div className="relative">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="absolute bottom-0 right-0 h-3 w-3 rounded-full" />
    </div>
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  </div>
);

export default function NewChatModal({
  open,
  onOpenChange,
  currentUserId,
  onThreadCreated,
  addThreadOptimistically,
}: NewChatModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingChatWithUser, setCreatingChatWithUser] = useState<string | null>(null);

  const { users, loading: usersLoading, error: usersError, refetch } = useAvailableUsers(currentUserId);
  const { createThread } = useCreateThread();

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleUserSelect = async (user: AvailableUser) => {
    if (!currentUserId || creatingChatWithUser) return;

    try {
      setCreatingChatWithUser(user.id);

      const threadData = {
        name: undefined,
        isGroup: false,
        userIds: [currentUserId, user.id],
        createdBy: currentUserId,
      };

      const newThread = await createThread(threadData);

      if (newThread) {
        // Add thread to state optimistically FIRST
        // This ensures the conversation appears in the list immediately
        if (addThreadOptimistically) {
          addThreadOptimistically(newThread);
        }

        // Close modal and reset state
        setCreatingChatWithUser(null);
        onOpenChange(false);
        setSearchQuery('');

        // Navigate immediately - the thread is now in state
        navigate({ to: '/chat', search: { id: newThread.id } });

        // Background refetch to sync with server (non-blocking)
        onThreadCreated?.();

        toast.success(`Chat with ${user.name} started!`);
      }
    } catch {
      toast.error('Failed to start chat. Please try again.');
      setCreatingChatWithUser(null);
    }
  };

  const handleClose = () => {
    if (creatingChatWithUser) return; // Prevent closing while creating
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Click on a user to start chatting
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4 flex-1 flex flex-col overflow-hidden">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={!!creatingChatWithUser}
            />
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {usersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <UserSkeleton key={index} />
                  ))}
                </div>
              ) : usersError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-sm mb-2">Failed to load users</p>
                  <p className="text-xs mb-3">{usersError}</p>
                  <Button size="sm" variant="outline" onClick={refetch}>
                    Try Again
                  </Button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">
                    {searchQuery ? '🔍' : '👥'}
                  </div>
                  <p className="text-sm mb-1">
                    {searchQuery ? 'No users found' : 'No available users'}
                  </p>
                  <p className="text-xs">
                    {searchQuery 
                      ? 'Try a different search term' 
                      : 'All users already have conversations with you'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => {
                    const isCreating = creatingChatWithUser === user.id;
                    const lastActiveText = formatLastActive(user.lastActiveAt, user.isOnline);

                    return (
                      <div
                        key={user.id}
                        onClick={() => !creatingChatWithUser && handleUserSelect(user)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md transition-colors",
                          !creatingChatWithUser && "cursor-pointer hover:bg-muted/50",
                          creatingChatWithUser && creatingChatWithUser !== user.id && "opacity-50",
                          isCreating && "bg-muted border border-brand-light/20"
                        )}
                      >
                        {/* Avatar with Online Status Indicator */}
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Online Status Dot */}
                          <div
                            className={cn(
                              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                              user.isOnline ? "bg-green-500" : "bg-gray-400"
                            )}
                            aria-label={user.isOnline ? "Online" : "Offline"}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* User Name */}
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>

                          {/* Username/Email and Last Active */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="truncate">
                              {user.username ? `@${user.username}` : user.email}
                            </span>

                            {/* Show status text if available */}
                            {lastActiveText && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                <span className={cn(
                                  "flex-shrink-0",
                                  user.isOnline ? "text-green-600 dark:text-green-500" : "text-muted-foreground/70"
                                )}>
                                  {lastActiveText}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {isCreating && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating chat...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={!!creatingChatWithUser}
          >
            {creatingChatWithUser ? 'Creating...' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}