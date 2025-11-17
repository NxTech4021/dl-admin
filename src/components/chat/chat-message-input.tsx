"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useTypingIndicator } from "@/app/chat/hooks/chat";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-80 h-96 flex items-center justify-center">Loading...</div>
  ),
});

interface ChatMessageInputProps {
  selectedConversationId?: string;
  disabled?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  replyingTo?: any;
  onCancelReply?: () => void;
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { setTyping } = useTypingIndicator(selectedConversationId);

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

    try {
      await onSendMessage(messageToSend);
      // Reply will be cleared in the parent component after successful send
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [message, onSendMessage, isSending, setTyping]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
      // ESC to cancel reply
      if (event.key === "Escape" && replyingTo && onCancelReply) {
        event.preventDefault();
        onCancelReply();
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
    if (!replyingTo) return null;

    return (
      <div className="border-t bg-muted/30 px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Reply indicator line */}
          <div className="w-1 bg-primary rounded-full h-12 flex-shrink-0 mt-1"></div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-primary">
                Replying to {replyingTo.sender?.name || "User"}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelReply}
                className="h-6 w-6 p-0 flex-shrink-0 hover:bg-muted-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-background/50 rounded-lg px-3 py-2 border">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {replyingTo.content || "Message"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background">
      {/* Reply Preview */}
      {renderReplyPreview()}

      {/* Message Input */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.sender?.name || "message"}...`
                  : selectedConversationId
                  ? "Type a message..."
                  : "Select a conversation to start messaging"
              }
              className={cn(
                "min-h-[40px] max-h-[120px] resize-none pr-12 py-2.5",
                "border-border focus:border-primary"
              )}
              disabled={isDisabled}
              rows={1}
            />

            {/* Emoji Button */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled={isDisabled}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-none shadow-lg"
                side="top"
                align="end"
                sideOffset={5}
              >
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
              </PopoverContent>
            </Popover>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={isDisabled || !message.trim()}
            size="icon"
            className={cn(
              "h-10 w-10 flex-shrink-0 bg-brand-light text-white",
              "hover:bg-brand-dark transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "disabled:hover:bg-brand-light"
            )}
          >
            <Send
              className={cn(
                "h-4 w-4 transition-transform",
                isSending && "animate-pulse"
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
