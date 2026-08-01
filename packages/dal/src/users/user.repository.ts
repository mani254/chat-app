import type { UpdateQuery } from 'mongoose';
import type { CreateUserInput, UpdateUserInput } from '@org/shared';
import { type UserEntity, toUserEntity } from './user.entity.js';
import { type RawUserDocument, UserModel } from './user.schema.js';

export class UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id).lean<RawUserDocument>().exec();
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .lean<RawUserDocument>()
      .exec();
    return doc ? toUserEntity(doc) : null;
  }

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
    return doc ? toUserEntity(doc) : null;
  }

  async findManyByIds(ids: string[]): Promise<UserEntity[]> {
    const docs = await UserModel.find({ _id: { $in: ids } })
      .lean<RawUserDocument[]>()
      .exec();
    return docs.map(toUserEntity);
  }

  async findOnlineUsers(): Promise<UserEntity[]> {
    const docs = await UserModel.find({ isOnline: true })
      .lean<RawUserDocument[]>()
      .exec();
    return docs.map(toUserEntity);
  }

  /**
   * Search users by name or email, optionally excluding the requesting user.
   */
  async searchUsers(
    search?: string,
    excludeUserId?: string,
    limit = 20,
  ): Promise<UserEntity[]> {
    const filter: Record<string, unknown> = {};

    if (excludeUserId) {
      filter['_id'] = { $ne: excludeUserId };
    }

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      filter['$or'] = [{ name: regex }, { email: regex }];
    }

    const docs = await UserModel.find(filter)
      .limit(limit)
      .lean<RawUserDocument[]>()
      .exec();

    return docs.map(toUserEntity);
  }

  /**
   * Cursor-based paginated user search (default limit = 10).
   */
  async searchUsersWithCursor(
    options: {
      search?: string;
      excludeUserId?: string;
      cursor?: string;
      limit?: number;
    } = {},
  ): Promise<{ items: UserEntity[]; nextCursor?: string; hasMore: boolean }> {
    const limit = Math.min(50, Math.max(1, options.limit ?? 10));
    const filter: Record<string, unknown> = {};

    if (options.excludeUserId) {
      filter['_id'] = { $ne: options.excludeUserId };
    }

    if (options.search && options.search.trim().length > 0) {
      const regex = new RegExp(options.search.trim(), 'i');
      filter['$or'] = [{ name: regex }, { email: regex }];
    }

    if (options.cursor) {
      filter['_id'] = { ...((filter['_id'] as object) || {}), $gt: options.cursor };
    }

    const docs = await UserModel.find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .lean<RawUserDocument[]>()
      .exec();

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem._id.toString() : undefined;

    return { items: items.map(toUserEntity), nextCursor, hasMore };
  }

  async exists(filter: Record<string, unknown>): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await UserModel.exists(filter as any).exec();
    return result !== null;
  }

  async create(data: CreateUserInput): Promise<UserEntity> {
    const doc = await UserModel.create(data);
    return toUserEntity(doc.toObject() as RawUserDocument);
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
    return doc ? toUserEntity(doc) : null;
  }

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

  async findHashedPasswordByEmail(email: string): Promise<string | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean<RawUserDocument>()
      .exec();
    return doc?.password ?? null;
  }
}
