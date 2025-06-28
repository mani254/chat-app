import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token }, // JWT token passed here
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
};
