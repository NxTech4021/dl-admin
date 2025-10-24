
import { format } from 'date-fns';

// ----------------------------------------------------------------------

export const _mock = {
  id: (index) => `mock_id_${index}`,
  email: (index) => `user${index}@example.com`,
  displayName: (index) => ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams'][index % 4],
  photoURL: (index) => `/assets/images/avatars/avatar_${index + 1}.jpg`,
  online: (index) => index % 2 === 0, // Mock online status
  status: (index) => ['online', 'offline', 'away'][index % 3], // Mock status
};

// ----------------------------------------------------------------------

export const _mockUser = {
  id: 'mock_user_1',
  displayName: 'Current User',
  email: 'current.user@example.com',
  photoURL: '/assets/images/avatars/avatar_25.jpg',
  phoneNumber: '+14155552654',
  role: 'admin',
};

// ----------------------------------------------------------------------

export const _mockContacts = [...Array(10)].map((_, index) => ({
  id: _mock.id(index),
  email: _mock.email(index),
  displayName: _mock.displayName(index),
  photoURL: _mock.photoURL(index),
  online: _mock.online(index),
  status: _mock.status(index),
}));

// ----------------------------------------------------------------------

export const _mockConversations = [...Array(5)].map((_, index) => {
  const isGroup = index === 0;
  return {
    id: `conversation_${index + 1}`,
    type: isGroup ? 'group' : 'one-to-one',
    unreadCount: index % 3,
    participants: isGroup
      ? [_mockUser, _mockContacts[1], _mockContacts[2], _mockContacts[3]]
      : [_mockUser, _mockContacts[index]],
    messages: [
      {
        id: `message_${index + 1}_1`,
        body: `Hi, how are you?`,
        senderId: isGroup ? _mockContacts[1].id : _mockContacts[index].id,
        contentType: 'text',
        createdAt: new Date().setMinutes(new Date().getMinutes() - 30),
      },
      {
        id: `message_${index + 1}_2`,
        body: 'I am good, thanks for asking!',
        senderId: _mockUser.id,
        contentType: 'text',
        createdAt: new Date().setMinutes(new Date().getMinutes() - 25),
      },
    ],
    lastMessage: {
      id: `last_message_${index + 1}`,
      body: 'I am good, thanks for asking!',
      senderId: _mockUser.id,
      createdAt: new Date().setMinutes(new Date().getMinutes() - 25),
    },
    displayName: isGroup ? 'Project Team' : _mockContacts[index].displayName,
    photoURL: isGroup ? null : _mockContacts[index].photoURL,
  };
});

// ----------------------------------------------------------------------

export const _mockConversation = {
  id: 'conversation_1',
  type: 'one-to-one',
  unreadCount: 0,
  participants: [_mockUser, _mockContacts[0]],
  messages: [...Array(5)].map((_, index) => ({
    id: `message_1_${index + 1}`,
    body: index % 2 === 0 ? 'Hello, how can I help you?' : 'I need some assistance with the new feature.',
    senderId: index % 2 === 0 ? _mockContacts[0].id : _mockUser.id,
    contentType: 'text',
    createdAt: new Date().setMinutes(new Date().getMinutes() - (5 - index)),
  })),
  lastMessage: {
    id: 'last_message_1',
    body: 'I need some assistance with the new feature.',
    senderId: _mockUser.id,
    createdAt: new Date().setMinutes(new Date().getMinutes() - 1),
  },
  displayName: _mockContacts[0].displayName,
  photoURL: _mockContacts[0].photoURL,
};