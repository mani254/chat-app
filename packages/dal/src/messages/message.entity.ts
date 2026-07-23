import type { RawMessageDocument } from './message.schema.js';

/**
 * MessageEntity — the application-facing Message type.
 *
 * Mirrors the schema exactly. The only difference from RawMessageDocument:
 *   - `_id`      → string  (was ObjectId)
 *   - `_chat`    → string  (was ObjectId)
 *   - `_sender`  → string  (was ObjectId)
 *   - `_readBy`  → string[] (was ObjectId[])
 *   - `_replyTo` → string | undefined  (was ObjectId | undefined)
 *
 * Field names are unchanged — the underscore convention is preserved.
 */
export type MessageEntity = Omit<
  RawMessageDocument,
  '_id' | '_chat' | '_sender' | '_readBy' | '_replyTo'
> & {
  _id: string;
  _chat: string;
  _sender: string;
  _readBy: string[];
  _replyTo?: string;
};
