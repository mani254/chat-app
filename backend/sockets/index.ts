// src/sockets/socketHandler.ts
import { Server, Socket } from "socket.io";
import { authenticateSocket } from "../middleware/socketAuth";
import User from "../models/User";
import { registerMessageHandlers } from "./messageHandler";

const socketHandler = async (socket: Socket, io: Server) => {
  // Authenticate
  await authenticateSocket(socket, async (err: any) => {
    if (err) {
      console.log("Socket authentication failed.");
      socket.disconnect();
      return;
    }

    const user = (socket as any).user;

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    socket.join(user._id.toString());

    socket.broadcast.emit("user-online", { userId: user._id });

    console.log(`${user.name} connected`);

    registerMessageHandlers(socket, io);

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(user._id, { isOnline: false });
      socket.broadcast.emit("user-offline", { userId: user._id });
      console.log(`${user.name} disconnected`);
    });
  });
};

export default socketHandler;
