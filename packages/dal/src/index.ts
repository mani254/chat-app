// @org/dal — Public API
//
// This is the ONLY import path for database operations.
//
// What is exported:
//   - Repositories  (UserRepository, ChatRepository, MessageRepository)
//   - Entities      (UserEntity, ChatEntity, MessageEntity)
//   - Connection    (connectDatabase, disconnectDatabase)
//
// What is NOT exported:
//   - Mongoose Models, schemas, or raw document types
//   - DB input/output types  → import from '@org/shared' instead
//   - Internal helpers
//
// Correct usage:
//   import { UserRepository, UserEntity } from '@org/dal';
//   import { CreateUserInput }            from '@org/shared';

// ─── Connection ───────────────────────────────────────────────────────────────
export {
  connectDatabase,
  disconnectDatabase,
  DB_COLLECTIONS,
} from './connection/index.js';
export type { DbCollection } from './connection/index.js';

// ─── Users ────────────────────────────────────────────────────────────────────
export { UserEntity, UserRepository } from './users/index.js';

// ─── Chats ────────────────────────────────────────────────────────────────────
export type { ChatEntity } from './chats/index.js';
export { ChatRepository } from './chats/index.js';

// ─── Messages ─────────────────────────────────────────────────────────────────
export type { MessageEntity } from './messages/index.js';
export { MessageRepository } from './messages/index.js';
