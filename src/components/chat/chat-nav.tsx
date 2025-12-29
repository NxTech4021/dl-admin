

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

// UI components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  SquarePen,
  MessageSquarePlus,
  User,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

// Chat filter type
type ChatFilter = "all" | "personal" | "division";

export default function ChatNav({
  loading,
  user,
  conversations,
  selectedConversationId,
  onConversationSelect,
  onThreadCreated,
  forceMobileList = false,
  addThreadOptimistically,
}: ChatNavProps & {
  onThreadCreated?: () => Promise<void> | void;
  forceMobileList?: boolean;
  addThreadOptimistically?: (thread: any) => void;
}) {
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
  const [chatFilter, setChatFilter] = useState<ChatFilter>("all");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Reset season filter when switching away from division tab
  useEffect(() => {
    if (chatFilter !== "division") {
      setSelectedSeasonId(null);
    }
  }, [chatFilter]);

  // Reset scroll position when filter changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [chatFilter, selectedSeasonId]);

  // Calculate counts for each filter
  const filterCounts = useMemo(() => {
    const personal = conversations.filter((c) => c.type === "direct").length;
    const division = conversations.filter((c) => c.type === "group").length;
    return {
      all: conversations.length,
      personal,
      division,
    };
  }, [conversations]);

  // Extract unique seasons from division conversations for the dropdown
  const availableSeasons = useMemo(() => {
    const divisionConversations = conversations.filter((c) => c.type === "group");
    const seasonMap = new Map<string, { id: string; name: string; count: number }>();

    divisionConversations.forEach((conv) => {
      const seasonId = conv.division?.season?.id;
      const seasonName = conv.division?.season?.name;
      if (seasonId && seasonName) {
        const existing = seasonMap.get(seasonId);
        if (existing) {
          existing.count += 1;
        } else {
          seasonMap.set(seasonId, { id: seasonId, name: seasonName, count: 1 });
        }
      }
    });

    return Array.from(seasonMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [conversations]);

  // Filter conversations by type and search query
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by chat type
    if (chatFilter === "personal") {
      filtered = filtered.filter((c) => c.type === "direct");
    } else if (chatFilter === "division") {
      filtered = filtered.filter((c) => c.type === "group");

      // Filter by selected season
      if (selectedSeasonId) {
        filtered = filtered.filter((c) => c.division?.season?.id === selectedSeasonId);
      }

      // Sort division chats alphabetically by name
      filtered = [...filtered].sort((a, b) =>
        (a.displayName || "").localeCompare(b.displayName || "")
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((conversation: Conversation) => {
        const displayName = conversation.displayName || "";
        const participantNames =
          conversation.participants
            ?.map((p) => p.displayName || p.name || "")
            .join(" ") || "";

        const searchText = (displayName + " " + participantNames).toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  }, [conversations, chatFilter, searchQuery, selectedSeasonId]);

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
      className="fixed left-0 top-[68px] md:top-[84px] z-50 h-11 w-11 rounded-r-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 md:hidden transition-all"
      aria-label="Open chat navigation"
    >
      <Users className="w-5 h-5" />
    </Button>
  );

  const renderSkeleton = () => (
    <div className="space-y-0">
      {Array.from({ length: 8 }, (_, index) => (
        <ChatNavItemSkeleton key={`skeleton-${index}`} index={index} />
      ))}
    </div>
  );

  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      if (searchQuery) return "No conversations found";
      if (chatFilter === "personal") return "No personal chats";
      if (chatFilter === "division") {
        if (selectedSeasonId) {
          const seasonName = availableSeasons.find(s => s.id === selectedSeasonId)?.name;
          return `No chats in ${seasonName || "this season"}`;
        }
        return "No division chats";
      }
      return "No conversations yet";
    };

    const getEmptySubMessage = () => {
      if (searchQuery) return "Try a different search term";
      if (chatFilter === "division" && selectedSeasonId) {
        return "Try selecting a different season or 'All Seasons'";
      }
      if (chatFilter !== "all") return "Try selecting a different filter";
      return "Start a new conversation";
    };

    return (
      <motion.div
        key="empty-state"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center justify-center py-8 text-center px-4"
      >
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          {chatFilter === "personal" ? (
            <User className="w-6 h-6 text-muted-foreground/60" />
          ) : chatFilter === "division" ? (
            <UsersRound className="w-6 h-6 text-muted-foreground/60" />
          ) : (
            <MessageSquarePlus className="w-6 h-6 text-muted-foreground/60" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {getEmptyMessage()}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {getEmptySubMessage()}
        </p>
        {!searchQuery && chatFilter === "all" && (
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
  };

  // Group conversations by season for division tab when "All Seasons" is selected
  const groupedConversations = useMemo(() => {
    // Only group when in division tab with "All Seasons" selected
    if (chatFilter !== "division" || selectedSeasonId) {
      return null;
    }

    const groups = new Map<string, { seasonName: string; conversations: Conversation[] }>();
    const noSeasonGroup: Conversation[] = [];

    filteredConversations.forEach((conv) => {
      const seasonId = conv.division?.season?.id;
      const seasonName = conv.division?.season?.name;

      if (seasonId && seasonName) {
        const existing = groups.get(seasonId);
        if (existing) {
          existing.conversations.push(conv);
        } else {
          groups.set(seasonId, { seasonName, conversations: [conv] });
        }
      } else {
        noSeasonGroup.push(conv);
      }
    });

    // Sort groups by season name, then sort conversations within each group
    const sortedGroups = Array.from(groups.entries())
      .sort(([, a], [, b]) => a.seasonName.localeCompare(b.seasonName))
      .map(([id, group]) => ({
        id,
        seasonName: group.seasonName,
        conversations: group.conversations.sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || "")
        ),
      }));

    // Add "Other" group at the end if there are chats without seasons
    if (noSeasonGroup.length > 0) {
      sortedGroups.push({
        id: "no-season",
        seasonName: "Other",
        conversations: noSeasonGroup.sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || "")
        ),
      });
    }

    return sortedGroups;
  }, [chatFilter, selectedSeasonId, filteredConversations]);

  const renderConversationsList = () => (
    <AnimatePresence mode="popLayout" initial={false}>
      {filteredConversations.length > 0 ? (
        <motion.div
          key={`list-${chatFilter}-${selectedSeasonId || "all"}`}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {/* Grouped view for Division tab with "All Seasons" */}
          {groupedConversations ? (
            groupedConversations.map((group) => (
              <div key={group.id}>
                {/* Season header */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                  }}
                  className="sticky top-0 z-10 px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {group.seasonName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      ({group.conversations.length})
                    </span>
                  </div>
                </motion.div>
                {/* Conversations in this season */}
                {group.conversations.map((conversation: Conversation) => (
                  <motion.div
                    key={conversation.id}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChatNavItem
                      conversation={conversation}
                      selected={conversation.id === selectedConversationId}
                      onCloseMobile={forceMobileList ? undefined : onCloseMobile}
                      hideContextBadge
                    />
                  </motion.div>
                ))}
              </div>
            ))
          ) : (
            /* Flat list for other tabs or when a specific season is selected */
            filteredConversations.map((conversation: Conversation) => (
              <motion.div
                key={conversation.id}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
                transition={{ duration: 0.15 }}
              >
                <ChatNavItem
                  conversation={conversation}
                  selected={conversation.id === selectedConversationId}
                  onCloseMobile={forceMobileList ? undefined : onCloseMobile}
                  hideContextBadge={chatFilter === "division"}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      ) : (
        renderEmptyState()
      )}
    </AnimatePresence>
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

  const renderFilterTabs = () => (
    <div className="px-3 pb-2">
      <div className="inline-flex items-center w-full rounded-lg bg-muted/60 p-1">
        <button
          onClick={() => setChatFilter("all")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            chatFilter === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
          {filterCounts.all > 0 && (
            <span className={cn(
              "text-[10px]",
              chatFilter === "all" ? "text-muted-foreground" : "text-muted-foreground/60"
            )}>
              {filterCounts.all}
            </span>
          )}
        </button>
        <button
          onClick={() => setChatFilter("personal")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            chatFilter === "personal"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-3 w-3" />
          Personal
          {filterCounts.personal > 0 && (
            <span className={cn(
              "text-[10px]",
              chatFilter === "personal" ? "text-muted-foreground" : "text-muted-foreground/60"
            )}>
              {filterCounts.personal}
            </span>
          )}
        </button>
        <button
          onClick={() => setChatFilter("division")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            chatFilter === "division"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UsersRound className="h-3 w-3" />
          Division
          {filterCounts.division > 0 && (
            <span className={cn(
              "text-[10px]",
              chatFilter === "division" ? "text-muted-foreground" : "text-muted-foreground/60"
            )}>
              {filterCounts.division}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderSeasonFilter = () => {
    if (chatFilter !== "division" || availableSeasons.length === 0) return null;

    const selectedSeason = selectedSeasonId
      ? availableSeasons.find(s => s.id === selectedSeasonId)
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="px-3 pb-2"
      >
        <Select
          value={selectedSeasonId || "all"}
          onValueChange={(value) => setSelectedSeasonId(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full h-9 text-xs bg-muted/40 border-muted-foreground/20 hover:bg-muted/60 transition-colors">
            <div className="flex items-center gap-2 w-full">
              <span className="truncate font-medium">
                {selectedSeason ? selectedSeason.name : "All Seasons"}
              </span>
              <span className="ml-auto shrink-0 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium">
                {selectedSeason ? selectedSeason.count : filterCounts.division}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent align="start" className="w-[var(--radix-select-trigger-width)]">
            <SelectItem value="all" className="cursor-pointer">
              <div className="flex items-center justify-between w-full gap-3">
                <span className="font-medium">All Seasons</span>
                <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {filterCounts.division}
                </span>
              </div>
            </SelectItem>
            {availableSeasons.map((season) => (
              <SelectItem key={season.id} value={season.id} className="cursor-pointer">
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="truncate">{season.name}</span>
                  <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {season.count}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
    );
  };

  const renderContent = () => (
    <div className="h-full flex flex-col">
      {/* Header with compose icon */}
      {renderHeader()}

      {/* Pill-shaped search */}
      {renderSearch()}

      {/* Filter tabs */}
      {renderFilterTabs()}

      {/* Season filter dropdown - only shows for Division tab */}
      <AnimatePresence>
        {renderSeasonFilter()}
      </AnimatePresence>

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden" ref={scrollAreaRef}>
        <ScrollArea className="h-full">
          {loading ? renderSkeleton() : renderConversationsList()}
        </ScrollArea>
      </div>

      <NewChatModal
        open={showNewChatModal}
        onOpenChange={closeNewChatModal}
        currentUserId={user?.id}
        onThreadCreated={handleThreadCreated}
        addThreadOptimistically={addThreadOptimistically}
      />
    </div>
  );

  // Main Render
  return (
    <>
      {!mdUp && !forceMobileList && renderToggleBtn()}

      {mdUp || forceMobileList ? (
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
