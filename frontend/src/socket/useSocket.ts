import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "../lib/socket";

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const sock = getSocket(token);

    sock.connect();

    sock.on("connect", () => {
      console.log("✅ Socket connected:", sock.id);
      setConnected(true);
    });

    sock.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    sock.on("connect_error", (err) => {
      console.error("🚨 Connection error:", err.message);
    });

    setSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, [token]);

  return { socket, connected };
};
