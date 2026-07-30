// ─── Socket.IO Event Constants & Payload Types ────────────────────────────────
//
// Shared between backend (NestJS) and frontend (React/Vue/etc.).
// Import only types from this file — no runtime side effects.

// ─── Presence Events ──────────────────────────────────────────────────────────

export const WS_EVENTS = {
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PRESENCE_PING: 'presence:ping',
  PRESENCE_PONG: 'presence:pong',
  PRESENCE_GET_ONLINE: 'presence:get_online',
  PRESENCE_ONLINE_LIST: 'presence:online_list',

  // Chat Room
  CHAT_JOIN_ROOM: 'chat:join_room',
  CHAT_JOINED_ROOM: 'chat:joined_room',
  CHAT_LEAVE_ROOM: 'chat:leave_room',
  CHAT_LEFT_ROOM: 'chat:left_room',
  CHAT_UPDATED: 'chat:updated',

  // Messaging
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_READ: 'message:read',
  MESSAGE_READ_ACK: 'message:read_ack',

  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Errors
  WS_ERROR: 'error',
} as const;

// ─── Client → Server Payloads ─────────────────────────────────────────────────

export interface WsJoinRoomPayload {
  chatId: string;
}

export interface WsLeaveRoomPayload {
  chatId: string;
}

export interface WsSendMessagePayload {
  chatId: string;
  content: string;
  messageType?: 'text' | 'media' | 'note';
  /** Pre-uploaded file URLs from /messages/upload */
  mediaLinks?: string[];
  replyToId?: string;
}

export interface WsTypingPayload {
  chatId: string;
}

export interface WsMarkReadPayload {
  chatId: string;
}

// ─── Server → Client Payloads ─────────────────────────────────────────────────

export interface WsPresencePayload {
  userId: string;
  name: string;
  email: string;
  timestamp: string;
}

export interface WsOfflinePayload {
  userId: string;
  email: string;
  timestamp: string;
}

export interface WsOnlineListPayload {
  onlineUserIds: string[];
}

export interface WsTypingEventPayload {
  chatId: string;
  userId: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface WsTypingStopPayload {
  chatId: string;
  userId: string;
}

export interface WsReadReceiptPayload {
  chatId: string;
  userId: string;
  readAt: string;
}
