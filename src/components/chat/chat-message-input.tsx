"use client";

import { useState, useRef, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { 
    ssr: false,
    loading: () => <div className="w-80 h-96 flex items-center justify-center">Loading...</div>
  }
);

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const handleEmojiClick = useCallback((emojiData: any) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      
      setMessage(newMessage);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setMessage(prev => prev + emoji);
    }
    
    // Close emoji picker after selection
    setShowEmojiPicker(false);
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  const isDisabled = disabled || !selectedConversationId || isSending;

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Attachment Button */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          disabled={isDisabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button> */}

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
                  showPreview: false
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
          <Send className={cn(
            "h-4 w-4 transition-transform",
            isSending && "animate-pulse"
          )} />
        </Button>
      </div>
    </div>
  );
}
