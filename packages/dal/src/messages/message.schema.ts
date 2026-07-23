import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

import { DB_COLLECTIONS } from '../connection/database.constants.js';

// ─── Schema ───────────────────────────────────────────────────────────────────

const messageSchema = new Schema(
  {
    /**
     * _chat: The chat this message belongs to.
     * Named with underscore prefix per DAL MongoDB naming convention.
     */
    _chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    /**
     * _sender: The user who sent the message.
     */
    _sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    /**
     * _readBy: Array of user IDs who have read this message.
     */
    _readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messageType: {
      type: String,
      enum: ['text', 'media', 'note'],
      default: 'text',
    },
    mediaLinks: {
      type: [String],
      default: [],
    },
    /**
     * _replyTo: Optional reference to the message this is replying to.
     */
    _replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

messageSchema.index({ _chat: 1, createdAt: -1 });
messageSchema.index({ _sender: 1 });
messageSchema.index({ messageType: 1 });

// ─── Internal Types ───────────────────────────────────────────────────────────

/**
 * Raw Mongoose document type — derived directly from the schema.
 * Never exported. Used only within the DAL.
 */
export type RawMessageDocument = InferSchemaType<typeof messageSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Model (private to DAL) ───────────────────────────────────────────────────

/**
 * The Mongoose Message model.
 * NOT exported — only MessageRepository may use it.
 */
export const MessageModel = model<RawMessageDocument>(
  'Message',
  messageSchema,
  DB_COLLECTIONS.MESSAGES,
);
