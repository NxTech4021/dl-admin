

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Import constants
import {
  getStatusColor,
  DEFAULTS,
  CHAT_UI,
} from "./constants";

// Import badge components
import ChatMatchBadge from "./chat-match-badge";
import ChatContextBadge from "./chat-context-badge";

const useResponsive = (query: any, start: any) => {
  const [isMatch, setIsMatch] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: 768px)`);
    const handler = (e: any) => setIsMatch(e.matches);
    mediaQuery.addEventListener("change", handler);
    handler(mediaQuery);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  return isMatch;
};

const getPreviewText = (text?: string, maxWords = 6) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

const useGetNavItem = ({ conversation, currentUserId }: any) => {
  const isGroup = conversation?.type === "group";

  const otherParticipants = isGroup
    ? conversation?.participants || []
    : conversation?.participants?.filter((p: any) => p.id !== currentUserId) ||
      [];

  // Display name logic - use conversation.displayName as primary fallback for direct chats
  const displayName = isGroup
    ? conversation?.displayName || conversation?.name || "Group Chat"
    : conversation?.displayName ||
      otherParticipants[0]?.name ||
      otherParticipants[0]?.displayName ||
      DEFAULTS.UNKNOWN_USER;

  const rawDisplayText = conversation?.lastMessage?.content || "";
  const displayText = getPreviewText(rawDisplayText, 6);

  const lastActivity = conversation?.lastMessage?.createdAt;
  const hasOnlineInGroup =
    isGroup &&
    conversation?.participants?.some((p: any) => p.status === "online");

  // Extract division/season context for group chats
  const seasonName = conversation?.division?.season?.name;
  const sportType = conversation?.division?.league?.sportType;
  const hasDivisionContext = isGroup && (seasonName || sportType);

  // Extract match message info for smart preview
  const lastMessage = conversation?.lastMessage;
  const isScheduledMatch =
    lastMessage?.messageType === "MATCH" &&
    lastMessage?.matchData?.status === "SCHEDULED";
  const matchData = isScheduledMatch ? lastMessage?.matchData : null;

  // Get sender info for group chats - use senderId for reliable matching
  const senderId = lastMessage?.senderId || lastMessage?.sender?.id;

  // Find sender from participants using ID (more reliable than name matching)
  const senderParticipant = senderId
    ? conversation?.participants?.find((p: any) => p.id === senderId)
    : null;

  // Fallback to message sender data if participant not found
  const senderName = senderParticipant?.name || lastMessage?.sender?.name || "";
  const senderFirstName = senderName.split(" ")[0] || "";
  const senderAvatar = senderParticipant?.image || senderParticipant?.photoURL || lastMessage?.sender?.image;

  return {
    group: isGroup,
    displayName,
    displayText,
    participants: otherParticipants,
    lastActivity,
    hasOnlineInGroup,
    // New fields for badges
    seasonName,
    sportType,
    hasDivisionContext,
    isScheduledMatch,
    matchData,
    // Sender info for group chats
    senderFirstName,
    senderAvatar,
  };
};

// --- CONSTANTS ---
const paths = {
  dashboard: {
    chat: "/chat",
  },
};

const getInitials = (name: string) => {
  if (!name) return DEFAULTS.AVATAR_FALLBACK;
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getGroupInitials = (groupName: string) => {
  if (!groupName) return "G";

  const words = groupName.trim().split(" ");
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  } else {
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }
};

// --- CHAT NAV ITEM COMPONENT ---
interface ChatNavItemProps {
  selected?: boolean;
  conversation: any;
  onCloseMobile?: () => void;
}

const ChatNavItem = ({
  selected,
  conversation,
  onCloseMobile,
}: ChatNavItemProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const navigate = useNavigate();
  const mdUp = useResponsive("up", "md");

  const {
    group,
    displayName,
    displayText,
    participants,
    lastActivity,
    hasOnlineInGroup,
    // Badge data
    seasonName,
    sportType,
    hasDivisionContext,
    isScheduledMatch,
    matchData,
    // Sender info
    senderFirstName,
    senderAvatar,
  } = useGetNavItem({
    conversation,
    currentUserId: user?.id,
  });

  const singleParticipant = participants[0];
  const { name, photoURL, status } = singleParticipant || {};

  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp && onCloseMobile) onCloseMobile();
      navigate({ to: `${paths.dashboard.chat}?id=${conversation.id}` });
    } catch (error) {
      console.error(error);
    }
  }, [conversation.id, mdUp, onCloseMobile, navigate]);

  const renderGroup = (
    <div className="relative flex-shrink-0">
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={conversation.avatarUrl || conversation.photoURL}
          alt={displayName || "Group Chat"}
        />
        <AvatarFallback className="text-sm bg-gradient-to-br from-brand-dark to-brand-light text-white font-semibold">
          {getGroupInitials(displayName || conversation.name || "Group")}
        </AvatarFallback>
      </Avatar>
      {hasOnlineInGroup && (
        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
      )}
    </div>
  );

  const renderSingle = (
    <div className="relative flex-shrink-0">
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={photoURL || singleParticipant?.photoURL}
          alt={displayName || "User"}
        />
        <AvatarFallback className="text-sm bg-muted font-medium">
          {getInitials(displayName || "User")}
        </AvatarFallback>
      </Avatar>
      {status === "online" && (
        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
      )}
    </div>
  );

  return (
    <div
      onClick={handleClickConversation}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors",
        selected ? "bg-muted" : "hover:bg-muted/50"
      )}
    >
      {/* Avatar with status */}
      {group ? renderGroup : renderSingle}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row: Name + Season Badge + Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-[15px] truncate">
              {displayName || DEFAULTS.UNKNOWN_USER}
            </span>
            {hasDivisionContext && (
              <ChatContextBadge seasonName={seasonName} sportType={sportType} />
            )}
          </div>
          <span className="text-xs text-muted-foreground/70 flex-shrink-0">
            {lastActivity
              ? formatDistanceToNowStrict(new Date(lastActivity), {
                  addSuffix: false,
                })
              : ""}
          </span>
        </div>

        {/* Message preview row: Smart preview + Unread count */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Sender avatar for group chats - always show with fallback */}
            {group && senderFirstName && (
              <Avatar className="h-4 w-4 flex-shrink-0">
                <AvatarImage src={senderAvatar} alt={senderFirstName} />
                <AvatarFallback className="text-[8px] bg-muted">
                  {senderFirstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            {isScheduledMatch && matchData ? (
              <div className="flex items-center gap-1.5 min-w-0">
                {group && senderFirstName && (
                  <span className="text-sm text-foreground font-medium flex-shrink-0">
                    {senderFirstName}:
                  </span>
                )}
                <ChatMatchBadge matchData={matchData} />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground truncate">
                {group && senderFirstName ? (
                  <>
                    <span className="font-medium text-foreground">{senderFirstName}:</span>
                    {" "}
                    {displayText || DEFAULTS.EMPTY_MESSAGES}
                  </>
                ) : (
                  displayText || DEFAULTS.EMPTY_MESSAGES
                )}
              </span>
            )}
          </div>
          <AnimatePresence>
            {conversation.unreadCount > 0 && !selected && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="h-5 min-w-5 px-1.5 rounded-full bg-destructive text-white text-xs font-medium flex items-center justify-center flex-shrink-0 ml-2"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatNavItem;
