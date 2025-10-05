// models/Message.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  messageType: "text" | "media" | "note";
  mediaLinks: string[];
  midText?: boolean;
  replyTo?: Types.ObjectId;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messageType: {
      type: String,
      enum: ["text", "media", "note"],
      default: "text",
    },
    mediaLinks: {
      type: [String],
      default: [],
    },
    midText: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
