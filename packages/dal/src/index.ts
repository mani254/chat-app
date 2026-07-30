// @org/dal — Public API
//
// This is the ONLY import path for database operations.
//
// What is exported:
//   - Repositories  (UserRepository, ChatRepository, MessageRepository, OtpRepository)
//   - Entities      (UserEntity, ChatEntity, MessageEntity, OtpEntity)
//   - Connection    (connectDatabase, disconnectDatabase)

// ─── Connection ───────────────────────────────────────────────────────────────
export {
  connectDatabase,
  disconnectDatabase,
  DB_COLLECTIONS,
} from './connection/index.js';
export type { DbCollection } from './connection/index.js';

// ─── Users ────────────────────────────────────────────────────────────────────
export type { UserEntity } from './users/index.js';
export { UserRepository, toUserEntity, generateAccessibleColor } from './users/index.js';

// ─── OTP ──────────────────────────────────────────────────────────────────────
export type { OtpEntity } from './otp/index.js';
export { OtpRepository, toOtpEntity, isOtpExpired } from './otp/index.js';

// ─── Chats ────────────────────────────────────────────────────────────────────
export type { ChatEntity } from './chats/index.js';
export { ChatRepository } from './chats/index.js';

// ─── Messages ─────────────────────────────────────────────────────────────────
export type { MessageEntity } from './messages/index.js';
export { MessageRepository } from './messages/index.js';
