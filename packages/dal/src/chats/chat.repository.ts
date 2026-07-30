import type { UpdateQuery } from 'mongoose';
import mongoose from 'mongoose';

import type { CreateChatInput, UpdateChatInput } from '@org/shared';
import type { ChatEntity } from './chat.entity.js';
import { type RawChatDocument, ChatModel } from './chat.schema.js';

// ─── Internal Conversion ──────────────────────────────────────────────────────

/**
 * Converts a raw Mongoose document into a ChatEntity.
 * ObjectId fields are stringified; all other fields pass through unchanged.
 */
function toEntity(doc: RawChatDocument): ChatEntity {
  return {
    ...doc,
    _id: doc._id.toString(),
    _users: doc._users?.map((id) => id.toString()) ?? [],
    _groupAdmin: doc._groupAdmin?.toString(),
    _latestMessage: doc._latestMessage?.toString(),
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * ChatRepository — the only way to interact with the Chat collection.
 *
 * All reference fields use the underscore convention (_users, _groupAdmin,
 * _latestMessage) internally. Consumers receive ChatEntity objects where all
 * ObjectIds have been converted to plain strings.
 */
export class ChatRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<ChatEntity | null> {
    const doc = await ChatModel.findById(id).lean<RawChatDocument>().exec();
    return doc ? toEntity(doc) : null;
  }

  /**
   * Returns all chats where the given user is a participant.
   * Sorted by most recently updated first (active conversations on top).
   */
  async findByUserId(userId: string): Promise<ChatEntity[]> {
    const docs = await ChatModel.find({ _users: userId })
      .sort({ updatedAt: -1 })
      .lean<RawChatDocument[]>()
      .exec();
    return docs.map(toEntity);
  }

  /**
   * Cursor-based paginated chat list for a user.
   * Cursor = updatedAt ISO string of the last item fetched.
   * Returns chats sorted by updatedAt descending (most recently active first).
   */
  async findByUserIdWithCursor(
    userId: string,
    options: {
      cursor?: string;
      limit?: number;
      type?: 'all' | 'group' | 'direct';
    } = {},
  ): Promise<{ items: ChatEntity[]; nextCursor?: string; hasMore: boolean }> {
    const limit = Math.min(50, Math.max(1, options.limit ?? 20));

    const filter: Record<string, unknown> = { _users: userId };

    if (options.type === 'group') filter['isGroupChat'] = true;
    if (options.type === 'direct') filter['isGroupChat'] = false;

    if (options.cursor) {
      filter['updatedAt'] = { $lt: new Date(options.cursor) };
    }

    // Fetch limit + 1 to determine hasMore
    const docs = await ChatModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit + 1)
      .lean<RawChatDocument[]>()
      .exec();

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem ? (lastItem.updatedAt as Date).toISOString() : undefined;

    return { items: items.map(toEntity), nextCursor, hasMore };
  }

  /**
   * Finds a 1-on-1 (non-group) chat between exactly two users.
   * Used to prevent duplicate DM chats being created.
   */
  async findDirectChat(
    userAId: string,
    userBId: string,
  ): Promise<ChatEntity | null> {
    const doc = await ChatModel.findOne({
      isGroupChat: false,
      _users: { $all: [userAId, userBId], $size: 2 },
    })
      .lean<RawChatDocument>()
      .exec();
    return doc ? toEntity(doc) : null;
  }

  async findGroupChats(): Promise<ChatEntity[]> {
    const docs = await ChatModel.find({ isGroupChat: true })
      .sort({ updatedAt: -1 })
      .lean<RawChatDocument[]>()
      .exec();
    return docs.map(toEntity);
  }

  /**
   * Checks whether a user is a member of a given chat.
   */
  async isMember(chatId: string, userId: string): Promise<boolean> {
    const count = await ChatModel.countDocuments({
      _id: new mongoose.Types.ObjectId(chatId),
      _users: new mongoose.Types.ObjectId(userId),
    }).exec();
    return count > 0;
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: CreateChatInput): Promise<ChatEntity> {
    const doc = await ChatModel.create({
      name: data.name,
      description: data.description,
      isGroupChat: data.isGroupChat ?? false,
      _users: data.userIds,
      _groupAdmin: data.groupAdminId,
      avatar: data.avatar ?? '',
    });
    return toEntity(doc.toObject() as RawChatDocument);
  }

  async updateById(
    id: string,
    data: UpdateChatInput,
  ): Promise<ChatEntity | null> {
    const update: UpdateQuery<RawChatDocument> = { $set: data };
    const doc = await ChatModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .lean<RawChatDocument>()
      .exec();
    return doc ? toEntity(doc) : null;
  }

  async addUser(chatId: string, userId: string): Promise<ChatEntity | null> {
    const doc = await ChatModel.findByIdAndUpdate(
      chatId,
      { $addToSet: { _users: userId } },
      { new: true },
    )
      .lean<RawChatDocument>()
      .exec();
    return doc ? toEntity(doc) : null;
  }

  async removeUser(chatId: string, userId: string): Promise<ChatEntity | null> {
    const doc = await ChatModel.findByIdAndUpdate(
      chatId,
      { $pull: { _users: userId } },
      { new: true },
    )
      .lean<RawChatDocument>()
      .exec();
    return doc ? toEntity(doc) : null;
  }

  /**
   * Updates the _latestMessage pointer.
   * Called by the application after a new message is created.
   */
  async updateLatestMessage(chatId: string, messageId: string): Promise<void> {
    await ChatModel.findByIdAndUpdate(chatId, {
      $set: { _latestMessage: messageId },
    }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await ChatModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
