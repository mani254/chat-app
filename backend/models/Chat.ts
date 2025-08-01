// models/Chat.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChat extends Document {
  name?: string;
  avatar?: string;
  isGroupChat: boolean;
  users: Types.ObjectId[];
  groupAdmin?: Types.ObjectId;
  latestMessage?: Types.ObjectId;
}

const ChatSchema: Schema<IChat> = new Schema(
  {
    name: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    groupAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Chat ||
  mongoose.model<IChat>("Chat", ChatSchema);
