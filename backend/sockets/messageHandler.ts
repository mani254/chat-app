import { Server, Socket } from "socket.io";
import ChatModel from "../models/Chat";
import MessageModel from "../models/Message";

interface SendMessagePayload {
  chatId: string;
  receiverId?: string;
  content: string;
  messageType?: "text" | "media" | "note";
  replyTo?: string;
  mediaLinks?: string[];
}

export const registerMessageHandlers = (socket: Socket, io: Server) => {
  socket.on(
    "send-message",
    async (data: SendMessagePayload, ack?: (response: any) => void) => {
      console.log("send message event triggered");
      try {
        const user = (socket as any).user;
        if (!user) throw new Error("User not authenticated");

        // Basic validation
        if (!data?.chatId || typeof data.chatId !== "string") {
          const err = { code: "BAD_REQUEST", message: "chatId is required" };
          ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
          return;
        }

        const content = (data?.content || "").trim();
        const type = data?.messageType || "text";

        // For media messages, allow empty content if mediaLinks are provided
        if (!content && type !== "media") {
          const err = { code: "BAD_REQUEST", message: "content is required" };
          ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
          return;
        }

        // For media messages, ensure either content or mediaLinks are provided
        if (type === "media" && !content) {
          const links = Array.isArray(data.mediaLinks)
            ? data.mediaLinks.filter(Boolean)
            : [];
          if (links.length === 0) {
            const err = {
              code: "BAD_REQUEST",
              message: "content or mediaLinks required for media message",
            };
            ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
            return;
          }
        }
        if (content && content.length > 5000) {
          const err = { code: "BAD_REQUEST", message: "content too long" };
          ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
          return;
        }

        const allowedTypes = ["text", "media", "note"] as const;
        if (!allowedTypes.includes(type)) {
          const err = { code: "BAD_REQUEST", message: "invalid messageType" };
          ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
          return;
        }

        // For media messages ensure at least one media link
        if (type === "media") {
          const links = Array.isArray(data.mediaLinks)
            ? data.mediaLinks.filter(Boolean)
            : [];
          if (links.length === 0) {
            const err = {
              code: "BAD_REQUEST",
              message: "mediaLinks required for media message",
            };
            ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
            return;
          }
        }

        const chat = await ChatModel.findById(data.chatId);

        if (!chat) {
          const err = { code: "NOT_FOUND", message: "Chat not found" };
          ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
          return;
        }

        // Membership check: ensure sender belongs to chat
        const isMember = chat.users.some(
          (u: any) => u.toString() === user._id.toString()
        );
        if (!isMember) {
          const err = { code: "FORBIDDEN", message: "Not a chat member" };
          ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
          return;
        }

        // Validate replyTo belongs to same chat (if provided)
        let replyToId = data?.replyTo;
        if (replyToId) {
          const replyMsg = await MessageModel.findById(replyToId).select(
            "chat"
          );
          if (!replyMsg || replyMsg.chat.toString() !== chat._id.toString()) {
            const err = { code: "BAD_REQUEST", message: "Invalid replyTo" };
            ack ? ack({ ok: false, error: err }) : socket.emit("error", err);
            return;
          }
        }

        const message = await MessageModel.create({
          chat: chat._id,
          sender: user._id,
          content,
          readBy: [user._id],
          messageType: type,
          replyTo: replyToId,
          mediaLinks: type === "media" ? data.mediaLinks || [] : [],
        });

        chat.latestMessage = message._id;
        await chat.save();

        const populatedMessage = await MessageModel.findById(message._id)
          .populate("sender", "name avatar")
          .populate("chat")
          .populate("replyTo");

        // 🛰 Emit to chat room
        io.to(chat._id.toString()).emit("new-message", populatedMessage);

        for (const userId of chat.users) {
          io.to(userId.toString()).emit(
            "new-message-chat-update",
            populatedMessage
          );
        }
        // Ack success
        if (ack) ack({ ok: true, data: populatedMessage });
      } catch (err: any) {
        console.error("send-message error:", err);
        const errorPayload = {
          code: "INTERNAL",
          message: err?.message || "Message sending failed",
        };
        if (ack) ack({ ok: false, error: errorPayload });
        else socket.emit("error", errorPayload);
      }
    }
  );
};
