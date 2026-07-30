import type { RawUserDocument } from './user.schema.js';

/**
 * UserEntity — the application-facing User type.
 *
 * Mirrors the schema exactly. The only difference from RawUserDocument:
 *   - `_id` → string (was ObjectId)
 *
 * Field names are unchanged — the underscore convention is preserved.
 */
export type UserEntity = Omit<RawUserDocument, '_id'> & {
  _id: string;
};

export function toUserEntity(doc: RawUserDocument): UserEntity {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}
