import type { RawOtpDocument } from './otp.schema.js';

/**
 * OtpEntity — the application-facing OTP type.
 *
 * Mirrors the schema exactly. The only difference from RawOtpDocument:
 *   - `_id` → string (was ObjectId)
 *
 * Field names are unchanged — the underscore convention is preserved.
 */
export type OtpEntity = Omit<RawOtpDocument, '_id'> & {
  _id: string;
};

export function toOtpEntity(doc: RawOtpDocument): OtpEntity {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

export function isOtpExpired(otp: OtpEntity): boolean {
  return new Date() > new Date(otp.expiresAt);
}
