"use client";

import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatMessageInputProps {
  selectedConversationId?: string;
  disabled?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
}

export default function ChatMessageInput({
  selectedConversationId,
  disabled = false,
  onSendMessage,
}: ChatMessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (!message.trim() || !onSendMessage || isSending) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [message, onSendMessage, isSending]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const isDisabled = disabled || !selectedConversationId || isSending;

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          disabled={isDisabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedConversationId 
                ? "Type a message..." 
                : "Select a conversation to start messaging"
            }
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none pr-12",
              "border-border focus:border-primary"
            )}
            disabled={isDisabled}
            rows={1}
          />
          
          {/* Emoji Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={isDisabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isDisabled || !message.trim()}
          size="icon"
          className="h-9 w-9 flex-shrink-0"
        >
          <Send className={cn(
            "h-4 w-4 transition-transform",
            isSending && "animate-pulse"
          )} />
        </Button>
      </div>
    </div>
  );
}
