// ─── Chat Request DTOs ────────────────────────────────────────────────────────

export interface CreateChatRequest {
  /** For DM chats: the ID of the other user */
  recipientId?: string;
  /** true = group chat, false = direct message */
  isGroupChat: boolean;
  /** Required only when isGroupChat = true */
  name?: string;
  description?: string;
  /** Array of participant user IDs (used for group chats) */
  userIds?: string[];
  avatar?: string;
}

export interface UpdateGroupChatRequest {
  name?: string;
  description?: string;
  avatar?: string;
}

export interface AddGroupMemberRequest {
  userId: string;
}

export interface RemoveGroupMemberRequest {
  userId: string;
}

export interface GetChatsQuery {
  /** Cursor: last chat's updatedAt ISO string for pagination */
  cursor?: string;
  limit?: number;
  /** Filter by chat type. Defaults to 'all' */
  type?: 'all' | 'group' | 'direct';
}
