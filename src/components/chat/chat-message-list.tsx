'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import ChatMessageItem from './chat-message-item';

interface ChatMessageListProps {
  messages: any[];
  participants: any[];
  loading?: boolean;
}

export default function ChatMessageList({ messages, participants, loading }: ChatMessageListProps) {
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              participants={participants}
              onOpenLightbox={handleOpenLightbox}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
