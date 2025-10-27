import { Server, Socket } from "socket.io";

const registerUserHandlers = (socket: Socket, io: Server) => {
  try {
    socket.on("reg-user-chat-updates", (userId: string) => {
      console.log(`User ${socket.id} registed for chat updates: ${userId}`);
      socket.join(userId);
    });
    socket.on("unreg-user-chat-updates", (userId: string) => {
      console.log(`User ${socket.id} un registed for chat updates: ${userId}`);
      socket.leave(userId);
    });
  } catch (err: any) {
    console.error("userError:", err);
    socket.emit("error", "user register event failed ");
  }
};

export default registerUserHandlers;
