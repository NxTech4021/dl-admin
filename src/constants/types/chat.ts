/* eslint-disable @typescript-eslint/no-empty-object-type */
import { UserStatus } from "@/components/chat/constants";

// Base User Interface
export interface ChatUser {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
}

// Extended User for Participants
export interface ChatParticipant extends ChatUser {
  displayName: string;
  photoURL?: string;
  status: "online" | "offline" | "away" | "busy";
  role?: string;
  isCurrentUser?: boolean;
}

// Available User for Chat Creation
export interface AvailableUser {
  id: string;
  name: string;
  username?: string;
  image?: string;
  email?: string;
  isOnline?: boolean;
  lastActiveAt?: string;
}

// Thread Member
export interface ThreadMember {
  userId: string;
  role?: string;
  user: ChatUser;
}

// Match Participant for match messages
export interface MatchParticipant {
  id: string;
  odId?: string;
  userId: string;
  name?: string;
  username?: string;
  image?: string;
  invitationStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  team?: string;
  role?: 'CREATOR' | 'OPPONENT' | 'PARTNER' | 'INVITED';
}

// Match Data embedded in match messages
export interface MatchData {
  matchId: string;
  matchType: 'SINGLES' | 'DOUBLES';
  sportType: 'PICKLEBALL' | 'TENNIS' | 'PADEL';
  date: string;
  time: string;
  duration: number;
  numberOfPlayers?: string;
  location: string;
  fee: 'FREE' | 'SPLIT' | 'FIXED';
  feeAmount?: string;
  courtBooked?: boolean;
  leagueName?: string;
  description?: string;
  isFriendly?: boolean;
  isFriendlyRequest?: boolean;
  requestStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  requestExpiresAt?: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'VOID';
  participants?: MatchParticipant[];
}

// Message Interface
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
  repliesTo?: Message;
  readBy?: MessageRead[];
  // Match message fields
  messageType?: 'TEXT' | 'MATCH' | 'SYSTEM';
  matchId?: string;
  matchData?: MatchData;
}

// Message Read Status
export interface MessageRead {
  id: string;
  userId: string;
  messageId: string;
  readAt: string;
  user: {
    id: string;
    name: string;
  };
}

// Division info for threads
export interface ThreadDivision {
  id: string;
  name: string;
  seasonId: string;
  leagueId: string;
  season?: {
    id: string;
    name: string;
  };
  league?: {
    id: string;
    name: string;
    sportType: 'TENNIS' | 'PICKLEBALL' | 'PADEL';
  };
}

// Thread/Conversation Interface
export interface Thread {
  id: string;
  name?: string;
  avatarUrl?: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  members: ThreadMember[];
  messages: Message[];
  unreadCount?: number;
  _count: {
    messages: number;
  };
  // Division context for group chats
  divisionId?: string;
  division?: ThreadDivision;
}

// Simplified division info for conversation display
export interface ConversationDivision {
  name: string;
  season?: { id: string; name: string };
  league?: { name: string; sportType: 'TENNIS' | 'PICKLEBALL' | 'PADEL' };
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  displayName: string;
  name?: string;
  photoURL?: string;
  avatarUrl?: string;
  isGroup?: boolean;
  participants: ChatParticipant[];
  messages: never[];
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId?: string;
    sender: {
      id?: string;
      name: string;
      image?: string;
    };
    // Match message fields for smart preview
    messageType?: 'TEXT' | 'MATCH' | 'SYSTEM';
    matchData?: MatchData;
  } | null;
  unreadCount: number;
  // Division context for group chats
  divisionId?: string;
  division?: ConversationDivision;
}

// Attachment Interface
export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  preview?: string;
  size: number;
  type: string;
  createdAt: string;
}

// Typing Indicator
export interface TypingUser {
  userId: string;
  userName: string;
}

// Socket Events
export interface SocketTypingData {
  threadId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface SocketTypingStatusData {
  threadId: string;
  senderId: string;
  isTyping: boolean;
}

export interface SocketMessageData {
  messageId: string;
  threadId: string;
}

export interface SocketMessageReadData {
  messageId: string;
  threadId: string;
  readerId: string;
  readerName: string;
}

export interface SocketNewThreadData {
  thread: Thread;
}

export interface SocketThreadUpdateData {
  threadId: string;
  lastMessage: Message;
}

export interface UseChatDataReturn {
  threads: Thread[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (
    content: string,
    senderId: string
  ) => Promise<Message | undefined>;
  markAsRead: (messageId: string) => Promise<void>;
  refetch: () => void;
}

export interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  setTyping: (isTyping: boolean) => void;
}

export interface UseThreadMembersReturn {
  members: ThreadMember[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCreateThreadReturn {
  createThread: (data: CreateThreadData) => Promise<Thread>;
  loading: boolean;
  error: string | null;
}

export interface UseAvailableUsersReturn {
  users: AvailableUser[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface CreateThreadData {
  name?: string;
  isGroup: boolean;
  userIds: string[];
  createdBy: string;
}

export interface SendMessageData {
  senderId: string;
  content: string;
}

export interface ChatNavProps {
  loading: boolean;
  user: ChatUser;
  conversations: Conversation[];
  selectedConversationId: string;
  onConversationSelect?: (conversationId: string) => void;
}

export interface ChatNavItemProps {
  selected?: boolean;
  collapse?: boolean;
  conversation: Conversation;
  onCloseMobile?: () => void;
  onClick?: () => void;
}

export interface ChatNavAccountProps {
  user?: ChatUser & {
    photoURL?: string;
    displayName?: string;
  };
  onStatusChange?: (status: UserStatus) => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  collapsed?: boolean;
}

export interface ChatMessageInputProps {
  selectedConversationId?: string;
  disabled?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
}

export interface ChatMessageListProps {
  messages: Message[];
  participants: ChatParticipant[];
  loading?: boolean;
  threadId?: string;
}

export interface ChatMessageItemProps {
  message: Message;
  participants: ChatParticipant[];
}

export interface ChatHeaderDetailProps {
  participants: ChatParticipant[];
  conversation: Conversation;
}

export interface ChatRoomProps {
  participants: ChatParticipant[];
  conversation: Conversation;
}

export interface ChatRoomSingleProps {
  participant?: ChatParticipant;
  conversation: Conversation;
}

export interface ChatRoomGroupProps {
  participants: ChatParticipant[];
  conversation: Conversation;
}

export interface ChatRoomAttachmentsProps {
  attachments: ChatAttachment[];
}

export interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onThreadCreated?: () => void;
}

export interface ChatHeaderComposeProps {
  contacts: AvailableUser[];
  onAddRecipients: (recipients: AvailableUser[]) => void;
}

export interface TypingIndicatorProps {
  threadId?: string;
}

// Socket Context
export interface SocketContextType {
  socket: import("socket.io-client").Socket | null;
  isConnected: boolean;
  joinThread: (threadId: string) => void;
  leaveThread: (threadId: string) => void;
  sendTyping: (threadId: string, isTyping: boolean) => void;
}

// Navigation Hook
export interface UseCollapseNavReturn {
  collapseDesktop: boolean;
  onCollapseDesktop: () => void;
  onCloseDesktop: () => void;
  openMobile: boolean;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
}

// Utility Hook
export interface UseBooleanReturn {
  value: boolean;
  onTrue: () => void;
  onFalse: () => void;
  onToggle: () => void;
}

// API Response Types
export interface ChatApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ThreadsApiResponse extends ChatApiResponse<Thread[]> {}
export interface MessagesApiResponse extends ChatApiResponse<Message[]> {}
export interface UsersApiResponse extends ChatApiResponse<AvailableUser[]> {}
export interface CreateThreadApiResponse extends ChatApiResponse<Thread> {}
export interface SendMessageApiResponse extends ChatApiResponse<Message> {}

export enum ThreadMemberRole {
  ADMIN = "admin",
  MEMBER = "player",
}
