import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      auth: { token }, // JWT token passed here
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
};
