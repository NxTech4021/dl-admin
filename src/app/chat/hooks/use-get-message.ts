import { useMemo } from 'react';

export default function useGetMessage({ message, participants, currentUserId }: any) {
  const memoizedValue = useMemo(() => {
    const senderDetails = participants.find((p: any) => p.id === message.senderId) || {
      firstName: 'Unknown',
      avatarUrl: '',
    };

    const me = message.senderId === currentUserId;
    const hasImage = message.contentType === 'image';

    return {
      me,
      senderDetails: {
        firstName: senderDetails.displayName?.split(' ')[0] || senderDetails.firstName,
        avatarUrl: senderDetails.photoURL || senderDetails.avatarUrl,
      },
      hasImage,
    };
  }, [message, participants, currentUserId]);

  return memoizedValue;
}