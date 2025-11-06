// User Status Options
export const USER_STATUS_OPTIONS = [
  'online',
  'away', 
  'busy',
  'offline'
] as const;

export type UserStatus = typeof USER_STATUS_OPTIONS[number];

// Status Colors Mapping
export const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500', 
  busy: 'bg-red-500',
  offline: 'bg-gray-500',
} as const;

// Status Colors with Variants (for different use cases)
export const STATUS_COLOR_VARIANTS = {
  background: {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500', 
    offline: 'bg-gray-500',
  },
  text: {
    online: 'text-green-600',
    away: 'text-yellow-600',
    busy: 'text-red-600',
    offline: 'text-gray-600',
  },
  border: {
    online: 'border-green-500',
    away: 'border-yellow-500',
    busy: 'border-red-500',
    offline: 'border-gray-500',
  },
  ring: {
    online: 'ring-green-500',
    away: 'ring-yellow-500', 
    busy: 'ring-red-500',
    offline: 'ring-gray-500',
  }
} as const;

// Chat Navigation Constants
export const CHAT_NAV = {
  WIDTH: 'w-[320px]',
  COLLAPSE_WIDTH: 'w-[96px]',
  MOBILE_BREAKPOINT: 768,
  ANIMATION_DURATION: 'duration-200',
} as const;

// Chat Message Constants
export const CHAT_MESSAGE = {
  MAX_LENGTH: 2000,
  TYPING_TIMEOUT: 3000,
  AUTO_TYPING_STOP: 1000,
  ATTACHMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  EMOJI_PICKER: {
    HEIGHT: 400,
    WIDTH: 350,
  },
} as const;

// Chat UI Constants
export const CHAT_UI = {
  AVATAR_SIZES: {
    SMALL: 'w-8 h-8',
    MEDIUM: 'w-10 h-10', 
    LARGE: 'w-12 h-12',
  },
  MAX_PARTICIPANTS_DISPLAY: 3,
  SCROLL_THRESHOLD: 100,
  MESSAGE_TIME_FORMAT: 'HH:mm',
  DATE_FORMAT: 'MMM d, yyyy',
} as const;

// Socket Events Constants
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_USER_ROOM: 'join_user_room',
  JOIN_THREAD: 'join_thread',
  LEAVE_THREAD: 'leave_thread',
  
  // Typing
  TYPING: 'typing',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  TYPING_STATUS: 'typing_status',
  
  // Messages
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  
  // Threads
  NEW_THREAD: 'new_thread',
  THREAD_UPDATED: 'thread_updated',
  
  // Status
  USER_STATUS_CHANGE: 'user_status_change',
} as const;

// Message Types
// export const MESSAGE_TYPES = {
//   TEXT: 'text',
//   IMAGE: 'image',
//   FILE: 'file',
//   AUDIO: 'audio',
//   VIDEO: 'video',
//   SYSTEM: 'system',
// } as const;

// export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

// Thread Types
export const THREAD_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const;

export type ThreadType = typeof THREAD_TYPES[keyof typeof THREAD_TYPES];

// Utility Functions
export const getStatusColor = (status: UserStatus, variant: keyof typeof STATUS_COLOR_VARIANTS = 'background'): string => {
  return STATUS_COLOR_VARIANTS[variant][status] || STATUS_COLOR_VARIANTS[variant].offline;
};

export const getStatusLabel = (status: UserStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Animation Classes
export const ANIMATIONS = {
  FADE_IN: 'animate-in fade-in-0 duration-200',
  FADE_OUT: 'animate-out fade-out-0 duration-200',
  SLIDE_IN_RIGHT: 'animate-in slide-in-from-right-2 duration-200',
  SLIDE_OUT_RIGHT: 'animate-out slide-out-to-right-2 duration-200',
  SLIDE_IN_LEFT: 'animate-in slide-in-from-left-2 duration-200',
  SLIDE_OUT_LEFT: 'animate-out slide-out-to-left-2 duration-200',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse',
  SPIN: 'animate-spin',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FAILED_TO_SEND: 'Failed to send message. Please try again.',
  FAILED_TO_LOAD_CONVERSATIONS: 'Failed to load conversations.',
  FAILED_TO_LOAD_MESSAGES: 'Failed to load messages.',
  FAILED_TO_CREATE_THREAD: 'Failed to create conversation.',
  CONNECTION_LOST: 'Connection lost. Trying to reconnect...',
  RECONNECTED: 'Connected to chat server.',
  SELECT_CONVERSATION: 'Please select a conversation.',
  NO_PARTICIPANTS: 'No participants selected.',
} as const;

// Success Messages  
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully.',
  THREAD_CREATED: 'Conversation created successfully.',
  CONNECTED: 'Connected to chat server.',
  PARTICIPANT_ADDED: 'Participant added successfully.',
  PARTICIPANT_REMOVED: 'Participant removed successfully.',
} as const;

// Default Values
export const DEFAULTS = {
  USER_STATUS: 'online' as UserStatus,
  AVATAR_FALLBACK: '?',
  THREAD_NAME: 'Unnamed Group',
  UNKNOWN_USER: 'Unknown User',
  LOADING_TEXT: 'Loading...',
  EMPTY_CONVERSATION: 'No conversations yet',
  EMPTY_MESSAGES: 'No messages yet',
} as const;