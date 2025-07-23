import { Server, Socket } from "socket.io";

export const registerTypingHandlers = (socket: Socket, io: Server) => {
  try {
    socket.on("user-start-typing", ({ chatId, user }) => {
      console.log("user started typing", user.name, "in chat", chatId);
      socket.to(chatId).emit("server-user-started-typing", chatId, user);
    });

    socket.on("user-end-typing", ({ chatId, user }) => {
      console.log("user ended typing", user.name, "in chat", chatId);
      socket.to(chatId).emit("server-user-ended-typing", chatId, user);
    });
  } catch (err) {
    console.error("typing indicator:", err);
    socket.emit("error", "typing indicator failed");
  }
};
