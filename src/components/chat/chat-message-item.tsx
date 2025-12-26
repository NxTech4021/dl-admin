

import { formatDistanceToNowStrict } from "date-fns";
import { Reply, Smile, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGetMessage } from "@/app/chat/hooks";
import { useState, memo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Quick reactions for the reaction picker
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];

// Reaction type for local state
interface Reaction {
  emoji: string;
  count: number;
  isSelected: boolean;
}

interface ChatMessageItemProps {
  message: any;
  participants: any[];
  onOpenLightbox?: (url: string) => void;
  onReply?: (message: any) => void;
  onDelete?: (messageId: string) => void;
}

function ChatMessageItem({
  message,
  participants,
  onOpenLightbox,
  onReply,
  onDelete,
}: ChatMessageItemProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>(
    message.reactions || []
  );
  const [showActions, setShowActions] = useState(false);

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: user?.id || "",
  });

  const { firstName, avatarUrl } = senderDetails;
  const messageContent = message.content || message.body || "";
  const createdAt = message.createdAt;
  const isDeleted = message.isDeleted || false;

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
    setShowReactionPicker(false);
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

  const renderSenderName = !me && (
    <div className="mb-1">
      <p className="text-xs text-muted-foreground font-medium">{firstName}</p>
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
        </motion.div>
      ) : (
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {messageContent}
        </p>
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


  const renderTimestampAndActions = (
    <div
      className={cn(
        "flex items-center gap-1.5 mt-1",
        me ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Timestamp - smaller, closer to bubble */}
      <span className="text-[10px] text-muted-foreground/60 px-1">
        {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
      </span>

      {/* Actions - only show if not deleted */}
      {!isDeleted && (
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex items-center gap-0.5"
            >
              {/* Reply Button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted rounded-full"
                onClick={handleReply}
                title="Reply to message"
              >
                <Reply className="h-3.5 w-3.5" />
              </Button>

              {/* React Button with Popover */}
              <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:bg-muted rounded-full"
                    title="React to message"
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="center"
                  className="p-0 border-none bg-transparent shadow-none w-auto"
                  sideOffset={8}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="flex gap-1 p-1.5 bg-popover rounded-full shadow-lg border"
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction(emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full text-lg transition-colors"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                </PopoverContent>
              </Popover>

              {/* Delete Button - only for own messages */}
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

              {/* More Options */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted rounded-full"
                title="More options"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
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
        onMouseLeave={() => {
          setShowActions(false);
          setShowReactionPicker(false);
        }}
      >
        {/* Avatar only for received messages, positioned at bottom */}
        {!me && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-auto mb-1">
            <AvatarImage src={avatarUrl} alt={firstName} />
            <AvatarFallback className="text-xs bg-muted font-medium">
              {firstName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message content column */}
        <div
          className={cn(
            "flex flex-col flex-1 min-w-0 max-w-[75%]",
            me ? "items-end" : "items-start"
          )}
        >
          {renderSenderName}
          {renderBody}
          {renderTimestampAndActions}
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
