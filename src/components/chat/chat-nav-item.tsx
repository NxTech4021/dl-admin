

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
    <motion.div
      onClick={handleClickConversation}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
        selected ? "bg-muted" : "hover:bg-muted/50"
      )}
    >
      {/* Avatar with status */}
      {group ? renderGroup : renderSingle}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[15px] truncate">
            {displayName || DEFAULTS.UNKNOWN_USER}
          </span>
          <span className="text-xs text-muted-foreground/70 flex-shrink-0 ml-2">
            {lastActivity
              ? formatDistanceToNowStrict(new Date(lastActivity), {
                  addSuffix: false,
                })
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm text-muted-foreground truncate">
            {displayText || DEFAULTS.EMPTY_MESSAGES}
          </span>
          <AnimatePresence>
            {conversation.unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="h-5 min-w-5 px-1.5 rounded-full bg-brand-light text-white text-xs font-medium flex items-center justify-center flex-shrink-0 ml-2"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatNavItem;
