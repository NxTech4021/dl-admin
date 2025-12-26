

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

// UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Users,
  SquarePen,
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
// Width is now controlled by parent container in the main chat page

export default function ChatNav({
  loading,
  user,
  conversations,
  selectedConversationId,
  onConversationSelect,
  onThreadCreated,
}: ChatNavProps & { onThreadCreated?: () => Promise<void> | void }) {
  const navigate = useNavigate();
  const mdUp = useResponsive();
  const {
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

  const handleThreadCreated = useCallback(async () => {
    // Trigger a refetch of conversations and wait for completion
    // Don't close modal here - let the caller handle it after navigation
    await onThreadCreated?.();
  }, [onThreadCreated]);

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <MessageSquarePlus className="w-6 h-6 text-muted-foreground/60" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        {searchQuery ? "No conversations found" : "No conversations yet"}
      </p>
      <p className="text-xs text-muted-foreground/70">
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
    </motion.div>
  );

  const renderConversationsList = () => (
    <>
      {filteredConversations.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {filteredConversations.map((conversation: Conversation) => (
            <motion.div
              key={conversation.id}
              variants={{
                hidden: { opacity: 0, x: -8 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <ChatNavItem
                conversation={conversation}
                selected={conversation.id === selectedConversationId}
                onCloseMobile={onCloseMobile}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        renderEmptyState()
      )}
    </>
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 min-h-[68px] border-b">
      <ChatNavAccount user={user} />
      <Button
        size="icon"
        variant="ghost"
        onClick={handleClickCompose}
        className="rounded-full h-9 w-9"
      >
        <SquarePen className="h-5 w-5" />
      </Button>
    </div>
  );

  const renderSearch = () => (
    <div className="px-3 py-2">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search"
          className="pl-10 h-9 rounded-full bg-muted/50 border-0 focus-visible:ring-0 text-sm"
          aria-label="Search conversations"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-full"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ×
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="h-full flex flex-col">
      {/* Header with compose icon */}
      {renderHeader()}

      {/* Pill-shaped search */}
      {renderSearch()}

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {loading ? renderSkeleton() : renderConversationsList()}
        </ScrollArea>
      </div>

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
        <div className="h-full w-full flex flex-col">
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
