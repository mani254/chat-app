import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL as string;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};
