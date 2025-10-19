'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessageItem from './chat-message-item';

interface ChatMessageListProps {
  messages: any[];
  participants: any[];
}

export default function ChatMessageList({ messages, participants }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpenLightbox = (url: string) => {
    // Handle image lightbox opening
    console.log('Open lightbox for:', url);
  };

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            participants={participants}
            onOpenLightbox={handleOpenLightbox}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
