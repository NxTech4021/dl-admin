

import { format } from "date-fns";
import { Reply, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGetMessage } from "@/app/chat/hooks";
import { useState, memo, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import MatchMessageCard from "./match-message-card";
import type { MatchData } from "@/constants/types/chat";

// Reaction type for local state
interface Reaction {
  emoji: string;
  count: number;
  isSelected: boolean;
}

interface ChatMessageItemProps {
  message: any;
  participants: any[];
  showAvatar?: boolean;
  onOpenLightbox?: (url: string) => void;
  onReply?: (message: any) => void;
  onDelete?: (messageId: string) => void;
}

function ChatMessageItem({
  message,
  participants,
  showAvatar = true,
  onOpenLightbox,
  onReply,
  onDelete,
}: ChatMessageItemProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(
    message.reactions || []
  );
  const [showActions, setShowActions] = useState(false);

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: user?.id || "",
  });

  const { firstName, avatarUrl, color: senderColor } = senderDetails;
  const messageContent = message.content || message.body || "";
  const createdAt = message.createdAt;
  const isDeleted = message.isDeleted || false;

  // Check if this is a match message
  const matchData = useMemo((): MatchData | null => {
    // Check for explicit match message type
    if (message.messageType === "MATCH" && message.matchData) {
      // Parse matchData if it's a string
      if (typeof message.matchData === "string") {
        try {
          return JSON.parse(message.matchData);
        } catch {
          return null;
        }
      }
      return message.matchData;
    }
    // Check for matchData object even without explicit messageType
    if (message.matchData && typeof message.matchData === "object") {
      return message.matchData;
    }
    return null;
  }, [message.messageType, message.matchData]);

  const isMatchMessage = matchData !== null;

  // Determine if message is short (inline timestamp) or long (timestamp below)
  const isShortMessage = useMemo(() => {
    const content = messageContent || '';
    return content.length <= 20 && !content.includes('\n');
  }, [messageContent]);

  // Format timestamp as HH:mm
  const formattedTime = useMemo(() => {
    return format(new Date(createdAt), 'HH:mm');
  }, [createdAt]);

  // Render match message card if this is a match message
  if (isMatchMessage && !isDeleted) {
    return (
      <MatchMessageCard
        message={{ ...message, matchData }}
        senderDetails={senderDetails}
      />
    );
  }

  const handleReply = () => {
    if (onReply && !isDeleted) {
      onReply(message);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowDeleteDialog(false);
  };

  const handleReaction = (emoji: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        if (existing.isSelected) {
          // Remove reaction
          if (existing.count === 1) {
            return prev.filter((r) => r.emoji !== emoji);
          }
          return prev.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count - 1, isSelected: false }
              : r
          );
        } else {
          // Add to existing reaction
          return prev.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, isSelected: true }
              : r
          );
        }
      }
      // New reaction
      return [...prev, { emoji, count: 1, isSelected: true }];
    });
  };

  const isReplyMine = message.repliesTo?.sender?.id === user?.id;
  const replyDisplayName = isReplyMine
    ? "You"
    : message.repliesTo?.sender?.name || "User";

  const renderReplyPreview = message.repliesTo && (
    <div
      className={cn(
        "mb-2 pb-2 text-xs border-b",
        me ? "border-white/20" : "border-border"
      )}
    >
      <span
        className={cn(
          "font-medium",
          me ? "text-white/80" : "text-foreground/70"
        )}
      >
        {replyDisplayName}
      </span>
      <p
        className={cn(
          "line-clamp-2 mt-0.5",
          me ? "text-white/60" : "text-muted-foreground"
        )}
      >
        {message.repliesTo.isDeleted ? (
          <span className="italic flex items-center gap-1">
            <Trash2 className="h-3 w-3" />
            Message deleted
          </span>
        ) : (
          message.repliesTo.content
        )}
      </p>
    </div>
  );

  const renderSenderName = !me && showAvatar && (
    <div className="mb-1">
      <p className="text-xs font-medium" style={{ color: senderColor }}>{firstName}</p>
    </div>
  );

  const renderBody = isDeleted ? (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 italic text-sm",
        // iMessage tail for deleted messages
        me
          ? "rounded-[20px] rounded-br-[6px] bg-brand-light/40 text-white/70"
          : "rounded-[20px] rounded-bl-[6px] bg-muted/40 text-muted-foreground"
      )}
    >
      <Trash2 className="h-3 w-3" />
      <span>Message deleted</span>
    </div>
  ) : (
    <div
      className={cn(
        "relative w-fit max-w-full transition-all duration-200",
        hasImage ? "p-0 bg-transparent rounded-2xl overflow-hidden" : "px-4 py-2.5",
        // iMessage-style bubble with tail
        me
          ? [
              "rounded-[20px] rounded-br-[6px]",
              "bg-brand-light text-white",
            ]
          : [
              "rounded-[20px] rounded-bl-[6px]",
              "bg-muted text-foreground",
            ]
      )}
    >
      {/* Reply preview only when message is NOT deleted */}
      {renderReplyPreview}

      {hasImage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={messageContent}
            alt="attachment"
            width={400}
            height={220}
            className="min-h-[220px] w-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onOpenLightbox?.(messageContent)}
          />
          <span className={cn(
            "text-[10px] block text-right mt-1.5 px-2",
            me ? "text-white/60" : "text-muted-foreground/60"
          )}>
            {formattedTime}
          </span>
        </motion.div>
      ) : isShortMessage ? (
        // Short message: inline timestamp
        <div className="flex items-end gap-2">
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {messageContent}
          </p>
          <span className={cn(
            "text-[10px] whitespace-nowrap flex-shrink-0 -mb-0.5",
            me ? "text-white/60" : "text-muted-foreground/60"
          )}>
            {formattedTime}
          </span>
        </div>
      ) : (
        // Long message: timestamp below
        <div>
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {messageContent}
          </p>
          <span className={cn(
            "text-[10px] block text-right mt-1",
            me ? "text-white/60" : "text-muted-foreground/60"
          )}>
            {formattedTime}
          </span>
        </div>
      )}

      {/* Reactions display - inline with bubble */}
      <AnimatePresence>
        {reactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex flex-wrap gap-1 mt-1.5 -mb-0.5"
          >
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReaction(reaction.emoji)}
                className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors duration-150",
                  me
                    ? "bg-white/15 hover:bg-white/25"
                    : "bg-muted-foreground/10 hover:bg-muted-foreground/20",
                  reaction.isSelected && "ring-1 ring-current/30"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );


  const renderFloatingActions = (
    <AnimatePresence>
      {showActions && !isDeleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "absolute -top-8 z-10 flex items-center gap-0.5",
            "bg-background/95 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-md border",
            me ? "right-0" : "left-0"
          )}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-muted rounded-full"
            onClick={handleReply}
            title="Reply to message"
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>
          {me && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
              onClick={handleDelete}
              title="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        className={cn(
          "group flex gap-2 py-1 px-4 md:px-6",
          me ? "flex-row-reverse" : "flex-row",
          isDeleted && "opacity-50"
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar only for received messages, positioned at bottom */}
        {!me && showAvatar && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-auto mb-1">
            <AvatarImage src={avatarUrl} alt={firstName} />
            <AvatarFallback
              className="text-xs font-medium text-white"
              style={{ backgroundColor: senderColor }}
            >
              {firstName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}
        {!me && !showAvatar && (
          <div className="w-8 flex-shrink-0" />
        )}

        {/* Message content column */}
        <div
          className={cn(
            "flex flex-col flex-1 min-w-0 max-w-[75%]",
            me ? "items-end" : "items-start"
          )}
        >
          {renderSenderName}
          <div className="relative">
            {renderFloatingActions}
            {renderBody}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ChatMessageItem);
