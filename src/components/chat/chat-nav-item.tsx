'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import { useMockedUser } from '@/app/chat/hooks/use-mocked-user';
// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { _mockUser } from '@/app/chat/hooks/_mockData';

// Icons from lucide-react
import { Search, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react';

// Placeholders for other components
import ChatNavAccount from './chat-nav-account';
import ChatNavSearchResults from './chat-nav-search-results';
import ChatNavItemSkeleton from './chat-skeleton';

// --- MOCK HOOKS & UTILITIES ---
// NOTE: In a real project, these would likely be defined in separate files.
const useResponsive = (query, start) => {
  const [isMatch, setIsMatch] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`); // Corresponds to mdUp
    const handler = (e) => setIsMatch(e.matches);
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



const useGetNavItem = ({ conversation, currentUserId }) => {
    const isGroup = conversation?.type === 'group';
    const otherParticipants = isGroup ? conversation?.participants.filter(p => p.id !== currentUserId) : [conversation?.participants[0]];
    const displayName = isGroup ? conversation?.displayName : otherParticipants[0]?.name;
    const displayText = conversation?.lastMessage?.body || '';
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

// --- CHAT NAV ITEM COMPONENT ---
interface ChatNavItemProps {
  selected?: boolean;
  collapse?: boolean;
  conversation: any;
  onCloseMobile?: () => void;
}

const getInitials = (displayName: string) =>
  displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

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
  const { name, avatarUrl, status } = singleParticipant;
  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp && onCloseMobile) onCloseMobile();
      router.push(`${paths.dashboard.chat}?id=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  }, [conversation.id, mdUp, onCloseMobile, router]);

  console.log("group participant")
  const renderGroup = (
    <div className="relative">
      {participants.slice(0, 2)?.map((participant) => (
        <>
          {/* <Avatar key={participant.id} src={participant.avatarUrl} alt={participant.name} className="w-12 h-12" /> */}
          <Avatar className="w-12 h-12">
            <AvatarImage key={participant.id} src={participant.avatarUrl} alt={participant.name} /> 
            <AvatarFallback className="text-xs">
          
            </AvatarFallback>
          </Avatar>
       
        </>
      
      ))}
      {hasOnlineInGroup && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
      )}
    </div>
  );

  const renderSingle = (
    <div className="relative">
       <Avatar className="w-12 h-12">
            <AvatarImage  src={avatarUrl} alt={name} /> 
            <AvatarFallback className="text-xs">
              {/* {getInitials(participant.name)} */}
            </AvatarFallback>
          </Avatar>
      {/* {status === 'online' && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
      )} */}
    </div>
  );

  return (
    <div
      onClick={handleClickConversation}
      className={`flex items-center p-3 cursor-pointer rounded-lg mb-1
        ${selected ? 'bg-accent/10' : 'hover:bg-accent/5'}
      `}
    >
      {/* Avatar */}
      <div className="relative">
        {group ? renderGroup : renderSingle}
        {conversation.unreadCount > 0 && !collapse && (
           <span className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-xs text-white">
             {conversation.unreadCount}
           </span>
        )}
      </div>

      {/* Text content */}
      {!collapse && (
        <div className="flex flex-1 justify-between items-center ml-3">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{displayText}</span>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span className="text-xs text-muted-foreground">
              {lastActivity ? formatDistanceToNowStrict(new Date(lastActivity), { addSuffix: false }) : ''}
            </span>
            {conversation.unreadCount > 0 && (
              <div className="w-2 h-2 rounded-full bg-info" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default ChatNavItem;