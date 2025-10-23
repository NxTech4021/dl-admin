"use client";

import { formatDistanceToNow } from 'date-fns';
import { Phone, Video, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  photoURL?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastActivity?: string | Date;
}

interface ChatHeaderDetailProps {
  participants: Participant[];
}

export default function ChatHeaderDetail({ participants = [] }: ChatHeaderDetailProps) {
  const group = participants.length > 1;
  const singleParticipant = participants[0];

  const getParticipantName = (participant: Participant) => 
    participant?.displayName || participant?.name || 'Unknown';

  const getParticipantAvatar = (participant: Participant) => 
    participant?.photoURL || participant?.avatarUrl || "Test ";

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const formatLastActivity = (lastActivity?: string | Date) => {
    if (!lastActivity) return 'Last seen recently';
    return `Last seen ${formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}`;
  };

  const renderGroup = (
    <div className="flex items-center gap-3">
      {/* Avatar Group */}
      <div className="flex -space-x-2">
        {participants.slice(0, 3).map((participant, index) => (
          <Avatar 
            key={participant.id} 
            className={cn(
              "h-8 w-8 border-2 border-background",
              index > 0 && "relative"
            )}
            style={{ zIndex: participants.length - index }}
          >
            <AvatarImage 
              src={getParticipantAvatar(participant)} 
              alt={getParticipantName(participant)} 
            />
            <AvatarFallback className="text-xs">
              {getParticipantName(participant).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {participants.length > 3 && (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
            +{participants.length - 3}
          </div>
        )}
      </div>
      
      {/* Group Info */}
      <div className="flex-1">
        <h3 className="text-sm font-medium">
          Group Chat ({participants.length} members)
        </h3>
        <p className="text-xs text-muted-foreground">
          {participants.map(p => getParticipantName(p)).join(', ')}
        </p>
      </div>
    </div>
  );

  const renderSingle = (
    <div className="flex items-center gap-3 flex-1">
      {/* Avatar with Status Badge */}
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={getParticipantAvatar(singleParticipant)} 
            alt={getParticipantName(singleParticipant)} 
          />
          <AvatarFallback>
            {getParticipantName(singleParticipant).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Status Indicator */}
        <div className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
          getStatusColor(singleParticipant?.status)
        )} />
      </div>

      {/* Participant Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">
          {getParticipantName(singleParticipant)}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {singleParticipant?.status === 'offline' 
            ? formatLastActivity(singleParticipant.lastActivity)
            : (
              <span className="capitalize">
                {singleParticipant?.status || 'online'}
              </span>
            )
          }
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 w-full">
      {group ? renderGroup : renderSingle}

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
