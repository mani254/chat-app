import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

import { DB_COLLECTIONS } from '../connection/database.constants.js';

// ─── Schema ───────────────────────────────────────────────────────────────────

const chatSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Chat name should be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Chat description should be less than 300 characters'],
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    /**
     * _users: All participants of this chat.
     * Named with underscore prefix per DAL MongoDB naming convention.
     */
    _users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Users list cannot be empty'],
      },
    ],
    /**
     * _groupAdmin: Admin of the group chat.
     * Required only when isGroupChat is true.
     */
    _groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: { isGroupChat?: boolean }) {
        return this.isGroupChat === true;
      },
    },
    /**
     * _latestMessage: Reference to the most recent message in this chat.
     * Updated by the repository whenever a new message is created.
     */
    _latestMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

chatSchema.index({ _users: 1 });
chatSchema.index({ isGroupChat: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ name: 1 });

// ─── Internal Types ───────────────────────────────────────────────────────────

/**
 * Raw Mongoose document type — derived directly from the schema.
 * Never exported. Used only within the DAL.
 */
export type RawChatDocument = InferSchemaType<typeof chatSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Model (private to DAL) ───────────────────────────────────────────────────

/**
 * The Mongoose Chat model.
 * NOT exported — only ChatRepository may use it.
 */
export const ChatModel = model<RawChatDocument>(
  'Chat',
  chatSchema,
  DB_COLLECTIONS.CHATS,
);
