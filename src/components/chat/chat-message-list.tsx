"use client";

import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { isToday, isYesterday, format } from 'date-fns';
import ChatMessageItem from './chat-message-item';
import TypingIndicator from './typing-indicator';
import { Message } from '../../constants/types/chat';
import { Loader2, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// interface Message {
//   id: string;
//   threadId: string;
//   senderId: string;
//   content: string;
//   createdAt: string;
//   sender: {
//     id: string;
//     name: string;
//     image?: string;
//   };
//   replyTo?: any;
//   isDeleted?: boolean;
// }

interface ChatMessageListProps {
  messages: Message[];
  participants: any[];
  loading?: boolean;
  threadId?: string;
  onReply?: (message: any) => void;
  onDelete?: (messageId: string) => void;
}

const MessageSkeleton = () => (
  <div className="flex gap-3 px-4 py-2">
    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-48" />
    </div>
  </div>
);

const DateDivider = ({ date }: { date: string }) => {
  const messageDate = new Date(date);

  const getDateLabel = () => {
    if (isToday(messageDate)) return 'Today';
    if (isYesterday(messageDate)) return 'Yesterday';
    return format(messageDate, 'MMMM d, yyyy');
  };

  return (
    <div className="flex items-center justify-center py-3">
      <span className="px-3 py-1 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground">
        {getDateLabel()}
      </span>
    </div>
  );
};

export default function ChatMessageList({ 
  messages = [], 
  participants = [],
  loading = false,
  threadId,
  onReply,
  onDelete,
}: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  useEffect(() => {
    if (isAtBottom && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isAtBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsAtBottom(isNearBottom);
    setShowScrollButton(!isNearBottom && messages.length > 10);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <MessageSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground/80 mb-2">
            Start a conversation
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Send a message to begin chatting
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full"
        onScrollCapture={handleScroll}
      >
        <div className="min-h-full flex flex-col justify-end py-2">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <DateDivider date={dateMessages[0].createdAt} />
              <AnimatePresence mode="popLayout">
                {dateMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.25,
                      delay: index < 3 ? index * 0.05 : 0,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    layout
                  >
                    <ChatMessageItem
                      message={message}
                      participants={participants}
                      onReply={onReply}
                      onDelete={onDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}

          {/* Typing Indicator */}
          <TypingIndicator threadId={threadId} members={participants} />

          {/* Sending indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center py-4"
              >
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Sending...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Scroll to bottom"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
