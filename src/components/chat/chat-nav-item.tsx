"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Display name logic
  const displayName = isGroup
    ? conversation?.displayName || conversation?.name || "Group Chat"
    : otherParticipants[0]?.name ||
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
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
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
      router.push(`${paths.dashboard.chat}?id=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  }, [conversation.id, mdUp, onCloseMobile, router]);

  const renderGroup = (
    <div className="relative">
      <Avatar
        className={collapse ? CHAT_UI.AVATAR_SIZES.SMALL : CHAT_UI.AVATAR_SIZES.MEDIUM}
      >
        <AvatarImage
          src={conversation.avatarUrl || conversation.photoURL}
          alt={displayName || "Group Chat"}
        />
        <AvatarFallback className="text-sm  bg-gradient-to-br from-brand-dark to-brand-light text-white text-primary-foreground font-semibold">
          {getGroupInitials(displayName || conversation.name || "Group")}
        </AvatarFallback>
      </Avatar>
      {hasOnlineInGroup && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getStatusColor(
            "online"
          )} ring-2 ring-background`}
        />
      )}
    </div>
  );

  const renderSingle = (
    <div className="relative">
      <Avatar
        className={collapse ? CHAT_UI.AVATAR_SIZES.SMALL : CHAT_UI.AVATAR_SIZES.MEDIUM}
      >
        <AvatarImage
          src={photoURL || singleParticipant?.photoURL}
          alt={displayName || "User"}
        />
        <AvatarFallback className="text-sm bg-muted">
          {getInitials(displayName || "User")}
        </AvatarFallback>
      </Avatar>
      {status === "online" && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getStatusColor(
            "online"
          )} ring-2 ring-background`}
        />
      )}
    </div>
  );

  return (
    <div
      onClick={handleClickConversation}
      className={`flex items-center p-3 cursor-pointer rounded-lg mb-1
        ${selected
          ? "bg-primary/10 border border-primary/20"
          : `hover:bg-accent/50`
        }
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {group ? renderGroup : renderSingle}
        {conversation.unreadCount > 0 && collapse && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-medium">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Text content */}
      {!collapse && (
        <div className="flex flex-1 justify-between items-center ml-3 min-w-0">
          <div className="flex flex-col overflow-hidden flex-1 max-w-[65%]">
            <span className="text-sm font-semibold truncate">
              {displayName || DEFAULTS.UNKNOWN_USER}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {displayText || DEFAULTS.EMPTY_MESSAGES}
            </span>
          </div>

          <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0 min-w-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {lastActivity
                ? formatDistanceToNowStrict(new Date(lastActivity), {
                    addSuffix: false,
                  })
                : ""}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-destructive text-xs text-destructive-foreground font-medium">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatNavItem;
