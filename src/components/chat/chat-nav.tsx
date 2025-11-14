"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageSquarePlus,
} from "lucide-react";

// Types
import type {
  ChatNavProps,
  Conversation,
  UseCollapseNavReturn,
  UseBooleanReturn,
} from "../../constants/types/chat";

// Components
import ChatNavAccount from "./chat-nav-account";
import ChatNavItemSkeleton from "./chat-skeleton";
import ChatNavItem from "./chat-nav-item";
import NewChatModal from "./create-chat-modal";

// --- CUSTOM HOOKS ---
const useResponsive = (): boolean => {
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`);
    const handler = (e: MediaQueryListEvent) => setIsMatch(e.matches);
    mediaQuery.addEventListener("change", handler);
    handler(mediaQuery as any);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isMatch;
};

const useCollapseNav = (): UseCollapseNavReturn => {
  const [collapseDesktop, setCollapseDesktop] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  return {
    collapseDesktop,
    onCollapseDesktop: () => setCollapseDesktop((prev) => !prev),
    onCloseDesktop: () => setCollapseDesktop(false),
    openMobile,
    onOpenMobile: () => setOpenMobile(true),
    onCloseMobile: () => setOpenMobile(false),
  };
};

const useBoolean = (initialValue = false): UseBooleanReturn => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    onTrue: () => setValue(true),
    onFalse: () => setValue(false),
    onToggle: () => setValue((prev) => !prev),
  };
};

// --- CONSTANTS ---
const NAV_WIDTH = "w-[320px]";
const NAV_COLLAPSE_WIDTH = "w-[96px]";

export default function ChatNav({
  loading,
  user,
  conversations,
  selectedConversationId,
  onConversationSelect,
}: ChatNavProps) {
  const router = useRouter();
  const mdUp = useResponsive();
  const {
    collapseDesktop,
    onCollapseDesktop,
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  const {
    value: showNewChatModal,
    onTrue: openNewChatModal,
    onFalse: closeNewChatModal,
  } = useBoolean(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(conversations);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conversation: Conversation) => {
        const displayName = conversation.displayName || "";
        const participantNames =
          conversation.participants
            ?.map((p) => p.displayName || p.name || "")
            .join(" ") || "";

        const searchText = (displayName + " " + participantNames).toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  // Update filtered conversations when conversations change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchQuery]);

  // Event Handlers
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
    openNewChatModal();
  }, [mdUp, onCloseMobile, openNewChatModal]);

  const handleSearchChange = useCallback((inputValue: string) => {
    setSearchQuery(inputValue);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // const handleConversationClick = useCallback((conversationId: string) => {
  //   if (onConversationSelect) {
  //     onConversationSelect(conversationId);
  //   }

  //   if (!mdUp) {
  //     onCloseMobile();
  //   }
  // }, [onConversationSelect, mdUp, onCloseMobile]);

  const handleThreadCreated = useCallback(() => {
    closeNewChatModal();
    // Optionally trigger a refetch of conversations
    // if (onThreadCreated) onThreadCreated();
  }, [closeNewChatModal]);

  // Render Functions
  const renderToggleBtn = () => (
    <Button
      onClick={onOpenMobile}
      variant="ghost"
      className="fixed left-0 top-[84px] z-10 w-8 h-8 rounded-r-md bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 md:hidden"
      aria-label="Open chat navigation"
    >
      <Users className="w-4 h-4" />
    </Button>
  );

  const renderSkeleton = () => (
    <>
      {Array.from({ length: 8 }, (_, index) => (
        <ChatNavItemSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <MessageSquarePlus className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground mb-2">
        {searchQuery ? "No conversations found" : "No conversations yet"}
      </p>
      <p className="text-xs text-muted-foreground">
        {searchQuery
          ? "Try a different search term"
          : "Start a new conversation"}
      </p>
      {!searchQuery && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleClickCompose}
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      )}
    </div>
  );

  const renderConversationsList = () => (
    <>
      {filteredConversations.length > 0
        ? filteredConversations.map((conversation: Conversation) => (
            <ChatNavItem
              key={conversation.id}
              collapse={collapseDesktop}
              conversation={conversation}
              selected={conversation.id === selectedConversationId}
              onCloseMobile={onCloseMobile}
              // onClick={() => handleConversationClick(conversation.id)}
            />
          ))
        : renderEmptyState()}
    </>
  );

  const renderHeader = () => (
    <div className="flex flex-row items-center justify-between p-4 border-b">
      {!collapseDesktop && (
        <div className="flex-1">
          <ChatNavAccount user={user} />
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleNav}
        aria-label={
          collapseDesktop ? "Expand navigation" : "Collapse navigation"
        }
      >
        {collapseDesktop ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  const renderSearch = () => {
    if (collapseDesktop) return null;

    return (
      <div className="px-4 pb-4">
        <div className="relative py-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search conversations..."
            className="pl-10 pr-8"
            aria-label="Search conversations"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderComposeButton = () => {
    if (collapseDesktop) return null;

    return (
      <div className="p-4 border-t">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleClickCompose}
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>
    );
  };

  const renderContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      {renderHeader()}

      {/* Search */}
      {renderSearch()}

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 space-y-1">
            {loading ? renderSkeleton() : renderConversationsList()}
          </div>
        </ScrollArea>
      </div>

      {/* New Chat Button */}
      {renderComposeButton()}

      <NewChatModal
        open={showNewChatModal}
        onOpenChange={closeNewChatModal}
        currentUserId={user?.id}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );

  // Main Render
  return (
    <>
      {!mdUp && renderToggleBtn()}

      {mdUp ? (
        <div
          className={`h-full flex-shrink-0 border-r bg-background transition-[width] duration-200 flex flex-col
            ${collapseDesktop ? NAV_COLLAPSE_WIDTH : NAV_WIDTH}`}
        >
          {renderContent()}
        </div>
      ) : (
        <Sheet open={openMobile} onOpenChange={onCloseMobile}>
          <SheetContent side="left" className="p-0 border-r-0 w-[320px]">
            {renderContent()}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
