"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { Reply, Smile, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useGetMessage } from "@/app/chat/hooks";

interface ChatMessageItemProps {
  message: any;
  participants: any[];
  onOpenLightbox?: (url: string) => void;
}

export default function ChatMessageItem({ 
  message, 
  participants, 
  onOpenLightbox 
}: ChatMessageItemProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const { me, senderDetails, hasImage } = useGetMessage({
    message,
    participants,
    currentUserId: user?.id || '',
  });

  const { firstName, avatarUrl } = senderDetails;
  const messageContent = message.content || message.body || '';
  const createdAt = message.createdAt;

  const renderSenderName = !me && (
    <div className="mb-1">
      <p className="text-xs text-muted-foreground font-medium">
        {firstName}
      </p>
    </div>
  );

  const renderBody = (
    <div
      className={`
        relative rounded-lg px-3 py-2 max-w-xs lg:max-w-md
        ${hasImage ? "p-0 bg-transparent" : ""} 
        ${me 
          ? "bg-brand-light text-white ml-auto" 
          : "bg-muted text-foreground mr-auto"
        }
      `}
    >
      {hasImage ? (
        <img
          src={messageContent}
          alt="attachment"
          className="min-h-[220px] w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onOpenLightbox?.(messageContent)}
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap break-words">
          {messageContent}
        </p>
      )}
    </div>
  );

  const renderTimestampAndActions = (
    <div
      className={`
        flex items-center gap-2 mt-1
        ${me ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      {/* Timestamp */}
      <p className="text-xs text-muted-foreground">
        {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
      </p>

      {/* Actions */}
      <div
        className={`
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          flex items-center gap-1
        `}
      >
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-muted">
          <Reply className="h-3 w-3" />
        </Button>
        
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-muted">
          <Smile className="h-3 w-3" />
        </Button>
        
        {me && (
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-muted">
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
        
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-muted">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`group flex gap-3 px-4 py-2 hover:bg-muted/50 ${me ? 'flex-row-reverse' : 'flex-row'}`}>
      {!me && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={firstName} />
          <AvatarFallback>
            {firstName?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col flex-1 ${me ? 'items-end' : 'items-start'}`}>
        {renderSenderName}
        {renderBody}
        {renderTimestampAndActions}
      </div>
    </div>
  );
}
