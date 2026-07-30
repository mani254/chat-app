// ─── Chat Response DTOs ───────────────────────────────────────────────────────

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  color?: string;
  isOnline: boolean;
}

export interface MessageSummary {
  _id: string;
  content: string;
  messageType: 'text' | 'media' | 'note';
  sender: UserSummary;
  createdAt: string;
}

export interface ChatResponse {
  _id: string;
  name?: string;
  description?: string;
  isGroupChat: boolean;
  users: UserSummary[];
  groupAdmin?: UserSummary;
  latestMessage?: MessageSummary;
  avatar?: string;
  /** Count of unread messages for the requesting user */
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatListResponse {
  items: ChatResponse[];
  nextCursor?: string;
  hasMore: boolean;
}
