// ─── Message Response DTOs ────────────────────────────────────────────────────

import type { UserSummary } from '../chat/chat-response-dto.js';

export type { UserSummary } from '../chat/chat-response-dto.js';

export interface MessageResponse {
  _id: string;
  chatId: string;
  sender: UserSummary;
  content: string;
  messageType: 'text' | 'media' | 'note';
  /** Array of file URLs for media/note messages */
  mediaLinks: string[];
  /** Populated replied-to message (one level deep) */
  replyTo?: MessageReplyResponse;
  /** IDs of users who have read this message */
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageReplyResponse {
  _id: string;
  content: string;
  messageType: 'text' | 'media' | 'note';
  sender: UserSummary;
  createdAt: string;
}

export interface MessageListResponse {
  items: MessageResponse[];
  /** Cursor for next page — `_id` of oldest message in current page */
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface UploadResponse {
  mediaLinks: string[];
  messageType: 'media' | 'note';
}
