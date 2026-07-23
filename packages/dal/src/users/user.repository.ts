import type { UpdateQuery } from 'mongoose';

import type { CreateUserInput, UpdateUserInput } from '@org/shared';
import { UserEntity } from './user.entity.js';
import { type RawUserDocument, UserModel } from './user.schema.js';

/**
 * UserRepository — the only way to interact with the User collection.
 *
 * Consumers MUST use this class. Direct access to UserModel, userSchema,
 * or the MongoDB users collection is strictly forbidden outside the DAL.
 *
 * All methods return UserEntity objects (or null / arrays of them).
 * Raw Mongoose documents never leave this class.
 */
export class UserRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id).lean<RawUserDocument>().exec();
    return doc ? UserEntity.fromDocument(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .lean<RawUserDocument>()
      .exec();
    return doc ? UserEntity.fromDocument(doc) : null;
  }

  /**
   * Used for OAuth login flows — looks up by provider + providerId pair.
   */
  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<UserEntity | null> {
    const doc = await UserModel.findOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { provider, providerId } as any,
    )
      .lean<RawUserDocument>()
      .exec();
    return doc ? UserEntity.fromDocument(doc) : null;
  }

  async findManyByIds(ids: string[]): Promise<UserEntity[]> {
    const docs = await UserModel.find({ _id: { $in: ids } })
      .lean<RawUserDocument[]>()
      .exec();
    return docs.map((doc) => UserEntity.fromDocument(doc));
  }

  async findOnlineUsers(): Promise<UserEntity[]> {
    const docs = await UserModel.find({ isOnline: true })
      .lean<RawUserDocument[]>()
      .exec();
    return docs.map((doc) => UserEntity.fromDocument(doc));
  }

  async exists(filter: Record<string, unknown>): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await UserModel.exists(filter as any).exec();
    return result !== null;
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: CreateUserInput): Promise<UserEntity> {
    const doc = await UserModel.create(data);
    // .create() returns a full Mongoose document, cast to lean for consistency
    return UserEntity.fromDocument(doc.toObject() as RawUserDocument);
  }

  async updateById(
    id: string,
    data: UpdateUserInput,
  ): Promise<UserEntity | null> {
    const update: UpdateQuery<RawUserDocument> = { $set: data };
    const doc = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .lean<RawUserDocument>()
      .exec();
    return doc ? UserEntity.fromDocument(doc) : null;
  }

  /**
   * Updates the password field (hashing is handled by the pre-save hook).
   * Must use .save() so the pre-save hook fires — findByIdAndUpdate bypasses hooks.
   */
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const doc = await UserModel.findById(id).exec();
    if (!doc) return false;
    doc.password = newPassword;
    await doc.save();
    return true;
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { isOnline } }).exec();
  }

  async markEmailVerified(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      $set: { emailVerified: true },
    }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  // ─── Raw Password Access (DAL-internal use only) ───────────────────────────

  /**
   * Returns the hashed password for a given email.
   * This is the ONLY method that exposes the password field,
   * and it must only be called from within the DAL or an auth service
   * that needs to compare passwords.
   *
   * The password is never included in UserEntity.
   */
  async findHashedPasswordByEmail(email: string): Promise<string | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean<RawUserDocument>()
      .exec();
    return doc?.password ?? null;
  }
}
