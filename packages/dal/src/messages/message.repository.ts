import mongoose, { type UpdateQuery } from 'mongoose';

import type {
  CreateMessageInput,
  PaginatedResult,
  PaginationOptions,
} from '@org/shared';
import type { MessageEntity } from './message.entity.js';
import { type RawMessageDocument, MessageModel } from './message.schema.js';

// ─── Internal Conversion ──────────────────────────────────────────────────────

/**
 * Converts a raw Mongoose document into a MessageEntity.
 * ObjectId fields are stringified; all other fields pass through unchanged.
 */
function toEntity(doc: RawMessageDocument): MessageEntity {
  return {
    ...doc,
    _id: doc._id.toString(),
    _chat: doc._chat.toString(),
    _sender: doc._sender.toString(),
    _readBy: doc._readBy?.map((id) => id.toString()) ?? [],
    _replyTo: doc._replyTo?.toString(),
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * MessageRepository — the only way to interact with the Message collection.
 *
 * All reference fields use the underscore convention (_chat, _sender,
 * _readBy, _replyTo) internally. Consumers receive MessageEntity objects
 * where all ObjectIds have been converted to plain strings.
 */
export class MessageRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<MessageEntity | null> {
    const doc = await MessageModel.findById(id)
      .lean<RawMessageDocument>()
      .exec();
    return doc ? toEntity(doc) : null;
  }

  /**
   * Returns paginated messages for a chat, sorted newest-first.
   * Default: page 1, 50 messages per page.
   */
  async findByChatId(
    chatId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<MessageEntity>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 50));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      MessageModel.find({ _chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<RawMessageDocument[]>()
        .exec(),
      MessageModel.countDocuments({ _chat: chatId }).exec(),
    ]);

    return {
      items: docs.map(toEntity),
      total,
      page,
      limit,
      hasMore: skip + docs.length < total,
    };
  }

  /**
   * Cursor-based paginated message fetch for a chat.
   * Cursor = `_id` of the oldest message from the previous page.
   * Returns messages sorted newest-first (most recent at index 0).
   *
   * Usage:
   *  - Initial load: no cursor
   *  - Next page: cursor = items[items.length - 1]._id
   */
  async findByChatIdWithCursor(
    chatId: string,
    options: { cursor?: string; limit?: number } = {},
  ): Promise<{ items: MessageEntity[]; nextCursor?: string; hasMore: boolean; total: number }> {
    const limit = Math.min(100, Math.max(1, options.limit ?? 50));

    const filter: Record<string, unknown> = { _chat: chatId };

    if (options.cursor) {
      filter['_id'] = { $lt: new mongoose.Types.ObjectId(options.cursor) };
    }

    const [docs, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean<RawMessageDocument[]>()
        .exec(),
      MessageModel.countDocuments({ _chat: chatId }).exec(),
    ]);

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem._id.toString() : undefined;

    return { items: items.map(toEntity), nextCursor, hasMore, total };
  }

  async findLatestByChatId(
    chatId: string,
    count = 1,
  ): Promise<MessageEntity[]> {
    const docs = await MessageModel.find({ _chat: chatId })
      .sort({ createdAt: -1 })
      .limit(count)
      .lean<RawMessageDocument[]>()
      .exec();
    return docs.map(toEntity);
  }

  async countUnread(chatId: string, userId: string): Promise<number> {
    return MessageModel.countDocuments({
      _chat: chatId,
      _readBy: { $ne: userId },
      _sender: { $ne: userId },
    }).exec();
  }

  // ─── Write ─────────────────────────────────────────────────────────────────

  async create(data: CreateMessageInput): Promise<MessageEntity> {
    const doc = await MessageModel.create({
      _chat: data.chatId,
      _sender: data.senderId,
      content: data.content,
      messageType: data.messageType ?? 'text',
      mediaLinks: data.mediaLinks ?? [],
      _replyTo: data.replyToId,
      _readBy: [data.senderId], // sender auto-reads their own message
    });
    return toEntity(doc.toObject() as RawMessageDocument);
  }

  /**
   * Marks a single message as read by the given user.
   * Uses $addToSet to avoid duplicates in _readBy.
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    const update: UpdateQuery<RawMessageDocument> = {
      $addToSet: { _readBy: userId },
    };
    await MessageModel.findByIdAndUpdate(messageId, update).exec();
  }

  /**
   * Marks all unread messages in a chat as read by the given user.
   * Efficient bulk operation — one query for all unread messages.
   */
  async markAllAsRead(chatId: string, userId: string): Promise<void> {
    await MessageModel.updateMany(
      {
        _chat: chatId,
        _readBy: { $ne: userId },
        _sender: { $ne: userId },
      },
      { $addToSet: { _readBy: userId } },
    ).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await MessageModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Deletes all messages belonging to a chat.
   * Intended for use when a chat is deleted.
   */
  async deleteByChatId(chatId: string): Promise<number> {
    const result = await MessageModel.deleteMany({ _chat: chatId }).exec();
    return result.deletedCount;
  }
}
