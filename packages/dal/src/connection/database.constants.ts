/**
 * Database constants used across the DAL.
 * Keep all MongoDB collection names and configuration constants here
 * so they remain the single source of truth.
 */

export const DB_COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages',
  OTPS: 'otps',
} as const;

export type DbCollection = (typeof DB_COLLECTIONS)[keyof typeof DB_COLLECTIONS];
