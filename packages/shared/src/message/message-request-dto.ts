// ─── Message Request DTOs ─────────────────────────────────────────────────────

export interface SendMessageRequest {
  chatId: string;
  content: string;
  messageType?: 'text' | 'media' | 'note';
  /** Pre-uploaded file URLs (from /messages/upload endpoint) */
  mediaLinks?: string[];
  replyToId?: string;
}

export interface GetMessagesQuery {
  /** Cursor: the `_id` of the oldest message fetched so far */
  cursor?: string;
  limit?: number;
}

export interface MarkReadRequest {
  /** If omitted, marks all messages in the chat as read */
  messageIds?: string[];
}
