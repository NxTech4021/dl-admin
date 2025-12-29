import { useMemo } from 'react';
import { getUserNameColor, isAdminRole } from '@/lib/user-colors';

export default function useGetMessage({ message, participants, currentUserId }: any) {
  const memoizedValue = useMemo(() => {
    const senderDetails = participants.find((p: any) => p.id === message.senderId) || {
      firstName: 'Unknown',
      avatarUrl: '',
    };

    const me = message.senderId === currentUserId;
    const hasImage = message.contentType === 'image';

    // Generate deterministic color for sender based on their ID
    const senderId = message.senderId || senderDetails.id || '';
    const isAdmin = isAdminRole(senderDetails.role);
    const senderColor = getUserNameColor(senderId, isAdmin);

    return {
      me,
      senderDetails: {
        firstName: senderDetails.displayName?.split(' ')[0] || senderDetails.firstName,
        avatarUrl: senderDetails.photoURL || senderDetails.avatarUrl,
        color: senderColor,
      },
      hasImage,
    };
  }, [message, participants, currentUserId]);

  return memoizedValue;
}