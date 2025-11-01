// models/Message.ts

import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [
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
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true },
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ messageType: 1 });

export const Message = model('Message', messageSchema);

export type MessageDocument = InferSchemaType<typeof messageSchema> & {
  _id: mongoose.Types.ObjectId | string;
};
