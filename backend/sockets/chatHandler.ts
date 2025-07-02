import { Server, Socket } from "socket.io";
import { IChat } from "../models/Chat";
import chatServices from "../services/chatServices";

const registerChatHandlers = (socket: Socket, io: Server) => {
  socket.on("create-chat", async (data: IChat) => {
    try {
      const chat = chatServices.createChat(data);
    } catch (err: any) {
      console.log(err.message);
    }
  });
};

export default registerChatHandlers;
