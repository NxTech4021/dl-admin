"use client";

import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Users, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Participant {
  id: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  photoURL?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastActivity?: string | Date;
  isCurrentUser?: boolean;
}

interface Conversation {
  id: string;
  type: 'group' | 'direct';
  displayName: string;
  name?: string;
  photoURL?: string;
  avatarUrl?: string;
  participants: Participant[];
}

interface ChatHeaderDetailProps {
  participants: Participant[];
  conversation?: Conversation;
  onDetailsClick?: () => void;
  onBack?: () => void;
}

export default function ChatHeaderDetail({
  participants = [],
  conversation,
  onDetailsClick,
  onBack
}: ChatHeaderDetailProps) {
  const isGroup = conversation?.type === 'group';
  
  // For single chats, find the other participant (not current user)
  const otherParticipant = participants.find(p => !p.isCurrentUser);

  const getGroupInitials = (groupName: string) => {
    if (!groupName) return 'G';
    
    const words = groupName.trim().split(' ');
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    } else {
      return words.slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const formatLastActivity = (lastActivity?: string | Date) => {
    if (!lastActivity) return 'Last seen recently';
    return `Last seen ${formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}`;
  };

  // Get total member count for groups (all participants including current user)
  const totalMembers = conversation?.participants?.length || participants.length;
  const onlineMembers = (conversation?.participants || participants).filter(p => p.status === 'online').length;

  const renderGroup = (
    <div className="flex items-center gap-3 flex-1">
      {/* Group Avatar */}
      <div className="relative">
        <Avatar className="h-9 w-9 md:h-10 md:w-10">
          <AvatarImage
            src={conversation?.photoURL || conversation?.avatarUrl}
            alt={conversation?.displayName || 'Group Chat'}
          />
          <AvatarFallback className="text-sm bg-gradient-to-br from-brand-dark to-brand-light text-white font-semibold">
            {getGroupInitials(conversation?.displayName || conversation?.name || 'Group')}
          </AvatarFallback>
        </Avatar>

        {/* Online members indicator */}
        {onlineMembers > 0 && (
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Group Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm md:text-[15px] font-semibold truncate">
          {conversation?.displayName || conversation?.name || 'Group Chat'}
        </h3>
        <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>
            {totalMembers} members
            {onlineMembers > 0 && (
              <span className="ml-1">
                • {onlineMembers} online
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Chevron indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
    </div>
  );

  const renderSingle = (
    <div className="flex items-center gap-3 flex-1">
      {/* Avatar with Status Badge */}
      <div className="relative">
        <Avatar className="h-9 w-9 md:h-10 md:w-10">
          <AvatarImage
            src={otherParticipant?.photoURL || otherParticipant?.avatarUrl || conversation?.photoURL}
            alt={otherParticipant?.name || otherParticipant?.displayName || conversation?.displayName || 'User'}
          />
          <AvatarFallback>
            {(otherParticipant?.name || otherParticipant?.displayName || conversation?.displayName || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Status Indicator */}
        <div className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
          getStatusColor(otherParticipant?.status)
        )} />
      </div>

      {/* Participant Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm md:text-[15px] font-semibold truncate">
          {otherParticipant?.name || otherParticipant?.displayName || conversation?.displayName || 'Unknown User'}
        </h3>
        <p className="text-[10px] md:text-xs text-muted-foreground truncate">
          {otherParticipant?.status === 'offline'
            ? formatLastActivity(otherParticipant.lastActivity)
            : (
              <span className="capitalize">
                {otherParticipant?.status || 'online'}
              </span>
            )
          }
        </p>
      </div>

      {/* Chevron indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
    </div>
  );

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Mobile Back Button */}
      {onBack && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="h-11 w-11 rounded-full flex-shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
      
      {/* Main Content */}
      <div
        className={cn(
          "flex items-center gap-2 md:gap-3 flex-1 py-1 px-2 -mx-2 rounded-xl transition-colors",
          onDetailsClick && "cursor-pointer hover:bg-muted/50 active:bg-muted/70"
        )}
        onClick={onDetailsClick}
        role={onDetailsClick ? "button" : undefined}
        tabIndex={onDetailsClick ? 0 : undefined}
        onKeyDown={onDetailsClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onDetailsClick();
          }
        } : undefined}
      >
        {isGroup ? renderGroup : renderSingle}
      </div>
    </div>
  );
}
