import type { RawChatDocument } from './chat.schema.js';

/**
 * ChatEntity — the application-facing Chat type.
 *
 * Mirrors the schema exactly. The only difference from RawChatDocument:
 *   - `_id`            → string  (was ObjectId)
 *   - `_users`         → string[] (was ObjectId[])
 *   - `_groupAdmin`    → string | undefined  (was ObjectId | undefined)
 *   - `_latestMessage` → string | undefined  (was ObjectId | undefined)
 *
 * Field names are unchanged — the underscore convention is preserved.
 */
export type ChatEntity = Omit<
  RawChatDocument,
  '_id' | '_users' | '_groupAdmin' | '_latestMessage'
> & {
  _id: string;
  _users: string[];
  _groupAdmin?: string;
  _latestMessage?: string;
};
