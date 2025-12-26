import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTypingIndicator } from "@/app/chat/hooks/chat";
import { motion, AnimatePresence } from "framer-motion";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface ChatMessageInputProps {
  selectedConversationId?: string;
  disabled?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  replyingTo?: any;
  onCancelReply?: () => void;
}

// Store drafts in a module-level Map so they persist across component remounts
const draftsMap = new Map<string, string>();

export default function ChatMessageInput({
  selectedConversationId,
  disabled = false,
  onSendMessage,
  replyingTo,
  onCancelReply,
}: ChatMessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousConversationIdRef = useRef<string | undefined>(undefined);

  const { setTyping } = useTypingIndicator(selectedConversationId);

  // Save and restore drafts when switching conversations
  useEffect(() => {
    const prevId = previousConversationIdRef.current;

    // Save current draft to the previous conversation (if there was one and message exists)
    if (prevId && prevId !== selectedConversationId) {
      if (message.trim()) {
        draftsMap.set(prevId, message);
      } else {
        // Clear draft if message is empty
        draftsMap.delete(prevId);
      }
    }

    // Restore draft for the new conversation (or clear if none exists)
    if (selectedConversationId && selectedConversationId !== prevId) {
      const savedDraft = draftsMap.get(selectedConversationId) || "";
      setMessage(savedDraft);

      // Adjust textarea height after setting draft
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      }, 0);
    }

    // Update the ref to track current conversation
    previousConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Also save draft when message changes (for cases like page refresh)
  useEffect(() => {
    if (selectedConversationId && message.trim()) {
      draftsMap.set(selectedConversationId, message);
    } else if (selectedConversationId && !message.trim()) {
      draftsMap.delete(selectedConversationId);
    }
  }, [message, selectedConversationId]);

  // Auto-focus when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || !onSendMessage || isSending) return;

    const messageToSend = message.trim();
    setMessage("");
    setIsSending(true);
    setTyping(false);

    // Clear draft on send attempt
    if (selectedConversationId) {
      draftsMap.delete(selectedConversationId);
    }

    try {
      await onSendMessage(messageToSend);
      // Reply will be cleared in the parent component after successful send
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageToSend);
      // Restore draft if send failed
      if (selectedConversationId) {
        draftsMap.set(selectedConversationId, messageToSend);
      }
    } finally {
      setIsSending(false);
    }
  }, [message, onSendMessage, isSending, setTyping, selectedConversationId]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isMod = event.metaKey || event.ctrlKey;

      // Explicitly handle CMD/CTRL + A to select all text in textarea
      if (isMod && (event.key === "a" || event.key === "A")) {
        // Stop propagation to prevent any parent handlers from interfering
        event.stopPropagation();
        // Programmatically select all text in the textarea
        const textarea = event.currentTarget;
        textarea.setSelectionRange(0, textarea.value.length);
        event.preventDefault(); // Prevent any other handlers
        return;
      }

      // Allow all other standard text editing shortcuts (Cmd/Ctrl + C, V, X, Z)
      if (isMod) {
        // Stop propagation but don't prevent default - let native behavior work
        event.stopPropagation();
        return;
      }

      // Enter to send (without Shift for new line)
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
        return;
      }

      // ESC to cancel reply
      if (event.key === "Escape" && replyingTo && onCancelReply) {
        event.preventDefault();
        onCancelReply();
        return;
      }
    },
    [handleSend, replyingTo, onCancelReply]
  );

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setMessage(newValue);
      adjustTextareaHeight();

      // Handle typing indicator
      if (newValue.trim() && selectedConversationId) {
        setTyping(true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 1000);
      } else {
        setTyping(false);
      }
    },
    [adjustTextareaHeight, selectedConversationId, setTyping]
  );

  const handleEmojiClick = useCallback(
    (emojiData: any) => {
      const emoji = emojiData.emoji;
      const textarea = textareaRef.current;

      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.slice(0, start) + emoji + message.slice(end);

        setMessage(newMessage);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + emoji.length,
            start + emoji.length
          );
        }, 0);
      } else {
        setMessage((prev) => prev + emoji);
      }

      setShowEmojiPicker(false);
      adjustTextareaHeight();
    },
    [message, adjustTextareaHeight]
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(false);
    };
  }, [selectedConversationId, setTyping]);

  const isDisabled = disabled || !selectedConversationId || isSending;

  // Reply Preview Component
  const renderReplyPreview = () => {
    return (
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="border-t bg-muted/20 px-4 py-3 overflow-hidden"
          >
            <div className="flex items-start gap-3">
              {/* Reply indicator line */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="w-1 bg-primary rounded-full h-12 flex-shrink-0 mt-1 origin-top"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-primary">
                    Replying to {replyingTo.sender?.name || "User"}
                  </p>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onCancelReply}
                      className="h-6 w-6 p-0 flex-shrink-0 hover:bg-muted-foreground/20 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>

                <div className="bg-background/60 rounded-xl px-3 py-2 border border-border/50">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {replyingTo.content || "Message"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-background">
      {/* Reply Preview */}
      {renderReplyPreview()}

      {/* Message Input - pill style */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Input container - pill shaped */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.sender?.name || "message"}...`
                  : selectedConversationId
                  ? "Message"
                  : "Select a conversation"
              }
              className={cn(
                "min-h-[44px] max-h-[120px] py-3 px-4 pr-12",
                "resize-none rounded-[22px]",
                "bg-muted/50 border-0 focus:bg-muted",
                "transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              disabled={isDisabled}
              rows={1}
            />

            {/* Emoji inside input */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bottom-1.5 h-8 w-8 rounded-full hover:bg-background/50"
                  disabled={isDisabled}
                >
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-none shadow-lg"
                side="top"
                align="end"
                sideOffset={8}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Suspense fallback={<div className="w-80 h-96 flex items-center justify-center">Loading...</div>}>
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      autoFocusSearch={false}
                      height={400}
                      width={350}
                      previewConfig={{
                        showPreview: false,
                      }}
                      skinTonesDisabled
                      searchDisabled={false}
                    />
                  </Suspense>
                </motion.div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Circular send button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSend}
              disabled={isDisabled || !message.trim()}
              size="icon"
              className={cn(
                "h-11 w-11 rounded-full flex-shrink-0",
                "bg-brand-light hover:bg-brand-light/90 text-white",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
