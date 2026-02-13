import { useMemo } from 'react';
import { getUserNameColor, isAdminRole } from '@/lib/user-colors';
import type { Message, ChatParticipant } from '@/constants/types/chat';

interface UseGetMessageParams {
  message: Message;
  participants: ChatParticipant[];
  currentUserId?: string;
}

/** Fallback shape when the sender is not found among participants */
interface FallbackSender {
  id?: undefined;
  displayName?: undefined;
  photoURL?: undefined;
  role?: undefined;
  firstName: string;
  avatarUrl: string;
}

export default function useGetMessage({ message, participants, currentUserId }: UseGetMessageParams) {
  const memoizedValue = useMemo(() => {
    const senderDetails: ChatParticipant | FallbackSender =
      participants.find((p) => p.id === message.senderId) || {
        firstName: 'Unknown',
        avatarUrl: '',
      };

    const me = message.senderId === currentUserId;
    const hasImage = message.messageType === 'MATCH'; // closest semantic equivalent

    // Generate deterministic color for sender based on their ID
    const senderId = message.senderId || senderDetails.id || '';
    const isAdmin = isAdminRole(senderDetails.role);
    const senderColor = getUserNameColor(senderId, isAdmin);

    const firstName =
      ('displayName' in senderDetails && senderDetails.displayName)
        ? senderDetails.displayName.split(' ')[0]
        : ('firstName' in senderDetails ? senderDetails.firstName : 'Unknown');

    const avatarUrl =
      ('photoURL' in senderDetails && senderDetails.photoURL)
        ? senderDetails.photoURL
        : ('avatarUrl' in senderDetails ? senderDetails.avatarUrl : '');

    return {
      me,
      senderDetails: {
        firstName,
        avatarUrl,
        color: senderColor,
      },
      hasImage,
    };
  }, [message, participants, currentUserId]);

  return memoizedValue;
}
