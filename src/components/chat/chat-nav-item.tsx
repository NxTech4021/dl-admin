import { useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/router';

import { Avatar} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// import { paths } from 'src/routes/paths';
// import { useResponsive } from 'src/hooks/use-responsive';
// import { useMockedUser } from 'src/hooks/use-mocked-user';
// import { clickConversation } from 'src/api/chat';

import { useMockedUser } from '@/app/chat/hooks/use-mocked-user';
import { useGetNavItem } from '../../app/chat/hooks';
import { clickConversation } from '@/app/chat/hooks/chat';

interface ChatNavItemProps {
  selected?: boolean;
  collapse?: boolean;
  conversation: any;
  onCloseMobile?: () => void;
}

export default function ChatNavItem({
  selected,
  collapse,
  conversation,
  onCloseMobile,
}: ChatNavItemProps) {
  const { user } = useMockedUser();
  const mdUp = useResponsive('up', 'md');
  const router = useRouter();

  const { group, displayName, displayText, participants, lastActivity, hasOnlineInGroup } =
    useGetNavItem({
      conversation,
      currentUserId: `${user?.id}`,
    });

  const singleParticipant = participants[0];
  const { name, avatarUrl, status } = singleParticipant;

  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp && onCloseMobile) onCloseMobile();
      await clickConversation(conversation.id);
      router.push(`${paths.dashboard.chat}?id=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  }, [conversation.id, mdUp, onCloseMobile, router]);

  const renderGroup = (
    <Badge
      variant={hasOnlineInGroup ? 'dot' : 'ghost'}
      className="relative"
    >
     
        {participants.slice(0, 2).map((participant) => (
          <Avatar key={participant.id} src={participant.avatarUrl} alt={participant.name} className="w-12 h-12" />
        ))}
    </Badge>
  );

  const renderSingle = (
    <Badge
      variant={status === 'online' ? 'dot' : 'ghost'}
      className="relative"
    >
      <Avatar src={avatarUrl} alt={name} className="w-12 h-12" />
    </Badge>
  );

  return (
    <Card
      onClick={handleClickConversation}
      className={`flex items-center p-3 cursor-pointer ${
        selected ? 'bg-accent/10' : 'hover:bg-accent/5'
      }`}
    >
      {/* Avatar with Badge */}
      <div className="relative">
        <Badge content={collapse ? conversation.unreadCount : 0} variant="dot">
          {group ? renderGroup : renderSingle}
        </Badge>
      </div>

      {/* Text content */}
      {!collapse && (
        <div className="flex flex-1 justify-between items-center ml-3">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{displayText}</span>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNowStrict(new Date(lastActivity), { addSuffix: false })}
            </span>
            {conversation.unreadCount > 0 && (
              <div className="w-2 h-2 rounded-full bg-info" />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
