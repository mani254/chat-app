import { Server, Socket } from "socket.io";
import ChatModel from "../models/Chat";
import MessageModel from "../models/Message";

interface SendMessagePayload {
  chatId: string;
  receiverId?: string;
  content: string;
  messageType?: "text" | "media" | "note";
  replyTo?: string;
}

export const registerMessageHandlers = (socket: Socket, io: Server) => {
  socket.on("send-message", async (data: SendMessagePayload) => {
    console.log("send message event triggered");
    try {
      const user = (socket as any).user;
      if (!user) throw new Error("User not authenticated");

      const chat = await ChatModel.findById(data.chatId);

      if (!chat) return socket.emit("error", "Chat not found");

      const message = await MessageModel.create({
        chat: chat._id,
        sender: user._id,
        content: data.content,
        readBy: [user._id],
        messageType: data.messageType || "text",
        replyTo: data?.replyTo,
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
    } catch (err) {
      console.error("send-message error:", err);
      socket.emit("error", "Message sending failed");
    }
  });
};
