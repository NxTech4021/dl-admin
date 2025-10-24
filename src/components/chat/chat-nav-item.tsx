'use client';

import { useState, useEffect, useCallback, Key } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { _mockUser } from '@/app/chat/hooks/_mockData';

// Icons from lucide-react
import { Search, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react';

const useResponsive = (query :any, start : any) => {
  const [isMatch, setIsMatch] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`);
    const handler = (e : any) => setIsMatch(e.matches);
    mediaQuery.addEventListener('change', handler);
    handler(mediaQuery);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return isMatch;
};

const useCollapseNav = () => {
  const [collapseDesktop, setCollapseDesktop] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  return {
    collapseDesktop,
    onCollapseDesktop: () => setCollapseDesktop(prev => !prev),
    openMobile,
    onOpenMobile: () => setOpenMobile(true),
    onCloseMobile: () => setOpenMobile(false),
  };
};

const useGetNavItem = ({ conversation, currentUserId } : any) => {
    const isGroup = conversation?.type === 'group';
    const otherParticipants = isGroup ? conversation?.participants.filter(p => p.id !== currentUserId) : [conversation?.participants[0]];
    const displayName = isGroup ? conversation?.displayName : otherParticipants[0]?.name;
    const displayText = conversation?.lastMessage?.body || conversation?.lastMessage?.content || '';
    const lastActivity = conversation?.lastMessage?.createdAt;
    const hasOnlineInGroup = isGroup && conversation?.participants?.some(p => p.status === 'online');

    return {
        group: isGroup,
        displayName,
        displayText,
        participants: otherParticipants,
        lastActivity,
        hasOnlineInGroup,
    };
};

// --- CONSTANTS ---
const NAV_WIDTH = 'w-[320px]';
const NAV_COLLAPSE_WIDTH = 'w-[96px]';
const paths = {
  dashboard: {
    chat: '/chat',
  },
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

// --- CHAT NAV ITEM COMPONENT ---
interface ChatNavItemProps {
  selected?: boolean;
  collapse?: boolean;
  conversation: any;
  onCloseMobile?: () => void;
}

const ChatNavItem = ({
  selected,
  collapse,
  conversation,
  onCloseMobile,
}: ChatNavItemProps) => {
  const user = _mockUser;
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');

  const { group, displayName, displayText, participants, lastActivity, hasOnlineInGroup } =
    useGetNavItem({
      conversation,
      currentUserId: `${user?.id}`,
    });

  const singleParticipant = participants[0];
  const { name, avatarUrl, status } = singleParticipant || {};

  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp && onCloseMobile) onCloseMobile();
      router.push(`${paths.dashboard.chat}?id=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  }, [conversation.id, mdUp, onCloseMobile, router]);

  const renderGroup = (
    <div className="relative">
      <Avatar className="w-12 h-12">
        {/* For group chats, check if there's an avatarUrl, otherwise use group name fallback */}
        <AvatarImage 
          src={conversation.avatarUrl || conversation.photoURL} 
          alt={displayName || 'Group Chat'} 
        />
        <AvatarFallback className="text-sm bg-gradient-to-br from-gray-500 to-blue-600 text-white font-semibold">
          {getGroupInitials(displayName || conversation.name || 'Group')}
        </AvatarFallback>
      </Avatar>
      {hasOnlineInGroup && (
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
      )}
    </div>
  );

  const renderSingle = (
    <div className="relative">
      <Avatar className="w-12 h-12">
        <AvatarImage 
          src={avatarUrl || conversation.photoURL} 
          alt={name || displayName || 'User'} 
        />
        <AvatarFallback className="text-sm bg-muted">
          {getInitials(name || displayName || 'User')}
        </AvatarFallback>
      </Avatar>
      {status === 'online' && (
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
      )}
    </div>
  );

  return (
    <div
      onClick={handleClickConversation}
      className={`flex items-center p-3 cursor-pointer rounded-lg mb-1 transition-colors
        ${selected ? 'bg-accent/10' : 'hover:bg-accent/5'}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {group ? renderGroup : renderSingle}
        {conversation.unreadCount > 0 && collapse && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Text content */}
      {!collapse && (
        <div className="flex flex-1 justify-between items-center ml-3 min-w-0">
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-sm font-semibold truncate">
              {displayName || 'Unknown Chat'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {displayText || 'No messages yet'}
            </span>
          </div>

          <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {lastActivity ? formatDistanceToNowStrict(new Date(lastActivity), { addSuffix: false }) : ''}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs text-white font-medium">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatNavItem;