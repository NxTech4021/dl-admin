'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


// Icons from lucide-react
import { Search, ChevronLeft, ChevronRight, Users, MessageSquarePlus, Plus } from 'lucide-react';

// Components
import ChatNavAccount from './chat-nav-account';
import ChatNavItemSkeleton from './chat-skeleton';
import ChatNavItem from './chat-nav-item';
import NewChatModal from './create-chat-modal';

// --- MOCK HOOKS & UTILITIES ---
const useResponsive = () => {
  const [isMatch, setIsMatch] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`);
    const handler = (e: MediaQueryListEvent) => setIsMatch(e.matches);
    mediaQuery.addEventListener('change', handler);
    handler(mediaQuery as any);
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

// --- CONSTANTS ---
const NAV_WIDTH = 'w-[320px]';
const NAV_COLLAPSE_WIDTH = 'w-[96px]';

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  displayName: string;
  photoURL?: string;
  participants?: any[];
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: { name: string };
  };
  unreadCount: number;
}

interface ChatNavProps {
  loading: boolean;
  user: any;
  conversations: Conversation[];
  selectedConversationId: string;
}

export default function ChatNav({ 
  loading, 
  user, 
  conversations, 
  selectedConversationId 
}: ChatNavProps) {
  const router = useRouter();
  const mdUp = useResponsive();
  const { collapseDesktop, onCollapseDesktop, openMobile, onOpenMobile, onCloseMobile } = useCollapseNav();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conversation: any) => {
        const displayName = conversation.displayName || '';
        const participantNames = conversation.participants
          ?.map((p: any) => p.displayName || p.name || '')
          .join(' ') || '';
        
        const searchText = (displayName + ' ' + participantNames).toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const handleClickCompose = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    router.push('/chat'); // TO DO - UPDATE Path
  }, [mdUp, onCloseMobile, router]);

  const handleSearchChange = useCallback((inputValue: string) => {
    setSearchQuery(inputValue);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Mobile toggle button
  const renderToggleBtn = (
    <Button
      onClick={onOpenMobile}
      variant="ghost"
      className="fixed left-0 top-[84px] z-10 w-8 h-8 rounded-r-md bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 md:hidden"
    >
      <Users className="w-4 h-4" />
    </Button>
  );

  // Loading skeleton
  const renderSkeleton = (
    <>
      {[...Array(8)].map((_, index) => (
        <ChatNavItemSkeleton key={index} />
      ))}
    </>
  );

  // Conversations list
  const renderList = (
    <>
      {filteredConversations.length > 0 ? (
        filteredConversations.map((conversation: any) => (
          <ChatNavItem
            key={conversation.id}
            collapse={collapseDesktop}
            conversation={conversation}
            selected={conversation.id === selectedConversationId}
            onCloseMobile={onCloseMobile}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquarePlus className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </p>
          <p className="text-xs text-muted-foreground">
            {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
          </p>
        </div>
      )}
    </>
  );

  // Main content
  const renderContent = (
    <>
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-4">
        {!collapseDesktop && (
          <div className="flex-1">
            <ChatNavAccount user={user} />
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={handleToggleNav}>
          {collapseDesktop ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Search */}
      {!collapseDesktop && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search conversations..."
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleClearSearch}
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          {loading ? renderSkeleton : renderList}
        </div>
      </ScrollArea>

      {/* Compose Button */}
      {!collapseDesktop && (
        <div className="p-4 border-t">
           <Button 
            className="w-full"
            variant="outline"
            onClick={() => setShowNewChatModal(true)}
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            New Message
          </Button>

        </div>
      )}

      <NewChatModal
        open={showNewChatModal}
        onOpenChange={setShowNewChatModal}
        currentUserId={user?.id}
        // onThreadCreated={onThreadCreated}
      />
    </>
  );

  return (
    <>
      {!mdUp && renderToggleBtn}

      {mdUp ? (
        <div
          className={`h-full flex-shrink-0 border-r bg-background transition-[width] duration-200 flex flex-col
            ${collapseDesktop ? NAV_COLLAPSE_WIDTH : NAV_WIDTH}`}
        >
          {renderContent}
        </div>
      ) : (
        <Sheet open={openMobile} onOpenChange={onCloseMobile}>
          <SheetContent side="left" className="p-0 border-r-0 w-[320px]">
            {renderContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
