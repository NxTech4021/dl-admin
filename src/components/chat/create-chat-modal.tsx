'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, X, Users, MessageSquare, Loader2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AvailableUser, useAvailableUsers } from '@/app/chat/hooks/chat';
import { useCreateThread } from '@/app/chat/hooks/chat';
import { toast } from 'sonner';

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onThreadCreated?: () => void;
}

const UserSkeleton = () => (
  <div className="flex items-center gap-3 p-2">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export default function NewChatModal({
  open,
  onOpenChange,
  currentUserId,
  onThreadCreated,
}: NewChatModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<AvailableUser[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);

  const { users, loading: usersLoading, error: usersError, refetch } = useAvailableUsers(currentUserId);
  const { createThread, loading: creatingThread } = useCreateThread();

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

  const handleUserSelect = useCallback((user: AvailableUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      
      if (isSelected) {
        // Remove user
        const newSelection = prev.filter(u => u.id !== user.id);
        
        // Auto-disable group chat if only 1 or 0 users selected
        if (newSelection.length <= 1) {
          setIsGroupChat(false);
          setGroupName('');
        }
        
        return newSelection;
      } else {
        // Add user
        const newSelection = [...prev, user];
        
        // Auto-enable group chat if more than 1 user selected
        if (newSelection.length > 1) {
          setIsGroupChat(true);
        }
        
        return newSelection;
      }
    });
  }, []);

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = prev.filter(u => u.id !== userId);
      
      // Disable group chat if only 1 or 0 users selected
      if (newSelection.length <= 1) {
        setIsGroupChat(false);
        setGroupName('');
      }
      
      return newSelection;
    });
  }, []);

  const handleCreateChat = useCallback(async () => {
    if (!currentUserId || selectedUsers.length === 0) {
      toast.error('Please select at least one user to chat with');
      return;
    }

    if (isGroupChat && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const memberIds = [currentUserId, ...selectedUsers.map(u => u.id)];
      
      const threadData = {
        name: isGroupChat ? groupName.trim() : undefined,
        isGroup: isGroupChat,
        memberIds,
        createdBy: currentUserId,
      };

      console.log('Creating thread with data:', threadData);
      
      const newThread = await createThread(threadData);
      
      if (newThread) {
        // Close modal and reset state
        handleClose();
        
        // Navigate to the new thread
        router.push(`/chat?id=${newThread.id}`);
        
        // Notify parent component
        onThreadCreated?.();
        
        toast.success(
          isGroupChat ? 'Group chat created successfully!' : 'Chat started successfully!'
        );
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create chat. Please try again.');
    }
  }, [currentUserId, selectedUsers, isGroupChat, groupName, createThread, router, onThreadCreated]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setSelectedUsers([]);
    setGroupName('');
    setIsGroupChat(false);
    setSearchQuery('');
  }, [onOpenChange]);

  const isUserSelected = useCallback((userId: string) => {
    return selectedUsers.some(u => u.id === userId);
  }, [selectedUsers]);

  const canCreateChat = selectedUsers.length > 0 && 
    (!isGroupChat || (isGroupChat && groupName.trim().length > 0));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Select users to start a new conversation
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
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Selected ({selectedUsers.length})
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUsers([]);
                    setIsGroupChat(false);
                    setGroupName('');
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {/* Group Chat Options */}
              {selectedUsers.length > 1 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="group-chat"
                      checked={isGroupChat}
                      onCheckedChange={(checked) => {
                        setIsGroupChat(!!checked);
                        if (!checked) setGroupName('');
                      }}
                    />
                    <label htmlFor="group-chat" className="text-sm font-medium">
                      Create group chat
                    </label>
                  </div>
                  
                  {isGroupChat && (
                    <Input
                      placeholder="Enter group name..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
              )}

              <Separator />
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-hidden">
            <label className="text-sm font-medium mb-2 block">Available Users</label>
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
                    const selected = isUserSelected(user.id);
                    
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                          "hover:bg-muted/50",
                          selected && "bg-muted border border-primary/20"
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.username ? `@${user.username}` : user.email}
                          </p>
                        </div>
                        
                        {selected && (
                          <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
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

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateChat}
            disabled={!canCreateChat || creatingThread}
            className="min-w-[100px]"
          >
            {creatingThread ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {isGroupChat ? 'Create Group' : 'Start Chat'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}