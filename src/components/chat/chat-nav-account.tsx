'use client';

import { useState, useCallback } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { 
  USER_STATUS_OPTIONS, 
  getStatusColor, 
  getStatusLabel,
  DEFAULTS,
  ANIMATIONS,
  CHAT_UI,
  type UserStatus 
} from './constants';

import { ChatNavAccountProps } from '../../constants/types/chat';
import { logger } from "@/lib/logger";



export default function ChatNavAccount({ 
  user,
  onStatusChange,
  onSettingsClick,
  onLogoutClick,
  collapsed = false
}: ChatNavAccountProps) {
  const [status, setStatus] = useState<UserStatus>(DEFAULTS.USER_STATUS);
  const [isOpen, setIsOpen] = useState(false);

  // User data with fallbacks
  const userName = user?.name || user?.displayName || DEFAULTS.UNKNOWN_USER;
  const userEmail = user?.email || '';
  const userImage = user?.image || user?.photoURL || '';
  const userInitial = userName.charAt(0).toUpperCase() || DEFAULTS.AVATAR_FALLBACK;

  // Handle status change
  const handleStatusChange = useCallback((newStatus: UserStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
    logger.debug('User status changed to:', newStatus);
  }, [onStatusChange]);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    setIsOpen(false);
    onSettingsClick?.();
  }, [onSettingsClick]);

  // Handle logout click
  const handleLogoutClick = useCallback(() => {
    setIsOpen(false);
    onLogoutClick?.();
  }, [onLogoutClick]);

  // Collapsed version (just avatar with status)
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center p-3">
              <div className="relative">
                <Avatar className={CHAT_UI.AVATAR_SIZES.MEDIUM}>
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="text-sm font-medium">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {/* Status indicator */}
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(status)}`}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="text-center">
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {getStatusLabel(status)}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full version
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors ${ANIMATIONS.FADE_IN}`}>
                {/* Avatar with status */}
                <div className="relative">
                  <Avatar className={CHAT_UI.AVATAR_SIZES.MEDIUM}>
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback className="text-sm font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator */}
                  <span 
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(status)} ${status === 'online' ? ANIMATIONS.PULSE : ''}`}
                  />
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {userName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 ${getStatusColor(status, 'text')} border-current`}
                    >
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className={`w-80 p-0 ${ANIMATIONS.FADE_IN}`} align="start">
        {/* User Header */}
        <div className="flex items-center gap-3 p-4 bg-muted/50">
          <Avatar className={CHAT_UI.AVATAR_SIZES.LARGE}>
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="text-lg font-medium">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base truncate">{userName}</div>
            <div className="text-sm text-muted-foreground truncate">{userEmail}</div>
            {user?.username && (
              <div className="text-xs text-muted-foreground">@{user.username}</div>
            )}
          </div>
        </div>

        <Separator />

        {/* Status Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <span 
              className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
            />
          </div>
          
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span 
                    className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
                  />
                  <span className="capitalize">{getStatusLabel(status)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {USER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`h-2 w-2 rounded-full ${getStatusColor(option)}`}
                    />
                    <span className="capitalize">{getStatusLabel(option)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}