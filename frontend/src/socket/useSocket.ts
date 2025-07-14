// hooks/useSocket.ts
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "../lib/socket";
import { useChatStore } from "../store/useChatStore";
import { useMessageStore } from "../store/useMessageStore";
import { useUserStore } from "../store/useUserStore";

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const sock = getSocket(token);

    sock.connect();

    // --- Remove previous listeners before adding new ones to prevent duplicates ---
    sock.off("connect");
    sock.off("disconnect");
    sock.off("user-online");
    sock.off("user-offline");
    sock.off("new-message");
    sock.off("connect_error");

    sock.on("connect", () => {
      console.log("✅ Socket connected:", sock.id);
      setConnected(true);
    });

    sock.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    sock.on("user-online", ({ userData }) => {
      console.log("👤 User Online:", userData);
      useUserStore.getState().addActiveUser(userData);
    });

    sock.on("user-offline", ({ userId }) => {
      console.log("👤 User Offline:", userId);
      useUserStore.getState().removeActiveUser(userId);
    });

    sock.on("new-message", (message) => {
      console.log("📩 New message received:", message);

      const currentChat = useChatStore.getState().activeChat;
      const isActive = currentChat && currentChat._id === message.chat._id;

      if (isActive) {
        useMessageStore.setState((state) => ({
          messages: [...(state.messages || []), message],
        }));
      }

      const updatedChats = useChatStore
        .getState()
        .chats.map((chat) =>
          chat._id === message.chat._id
            ? { ...chat, latestMessage: message }
            : chat
        );

      useChatStore.setState({ chats: updatedChats });
    });

    sock.on("connect_error", (err) => {
      console.error("🚨 Socket connection error:", err.message);
    });

    setSocket(sock);

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off("user-online");
      sock.off("user-offline");
      sock.off("new-message");
      sock.off("connect_error");
      sock.disconnect();
    };
  }, [token]);

  return { socket, connected };
};
