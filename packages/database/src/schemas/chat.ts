// models/Chat.ts

import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

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
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Users list cannot be empty'],
      },
    ],
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: any) {
        return this.isGroupChat === true;
      },
    },
    latestMessage: {
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

chatSchema.index({ users: 1 });
chatSchema.index({ isGroupChat: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ name: 1 });

export const Chat = model('Chat', chatSchema);

export type ChatDocument = InferSchemaType<typeof chatSchema> & {
  _id: mongoose.Types.ObjectId | string;
};
