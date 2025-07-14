import { Server, Socket } from "socket.io";

const registerChatHandlers = (socket: Socket, io: Server) => {
  try {
    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
    });
  } catch (err: any) {
    console.error("chatError:", err);
    socket.emit("error", "Message sending failed");
  }
};

export default registerChatHandlers;
