export default function useGetMessage({ message, participants, currentUserId }) {
  const sender = participants.find((participant) => participant.id === message.senderId);

  const senderDetails =
    message.senderId === currentUserId
      ? {
          type: 'me',
        }
      : {
          avatarUrl: sender?.avatarUrl ?? null,
          firstName: sender?.name ? sender.name.split(' ')[0] : 'Unknown',
        };

  const me = senderDetails.type === 'me';

  const hasImage = message.contentType === 'image';

  return {
    hasImage,
    me,
    senderDetails,
  };
}
