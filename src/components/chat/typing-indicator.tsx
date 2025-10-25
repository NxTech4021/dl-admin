"use client";

import { useTypingIndicator } from '@/app/chat/hooks/chat';
import { useSession } from '@/lib/auth-client';

interface TypingIndicatorProps {
  threadId?: string;
}

export default function TypingIndicator({ threadId }: TypingIndicatorProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const { typingUsers } = useTypingIndicator(threadId);

  const otherTypingUsers = typingUsers.filter(typingUser => typingUser.userId !== user?.id);

  if (otherTypingUsers.length === 0) return null;

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].userName} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers[1].userName} are typing...`;
    } else {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{getTypingText()}</span>
      </div>
    </div>
  );
}