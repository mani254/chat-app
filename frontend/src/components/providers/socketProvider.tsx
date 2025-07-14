"use client";

import { useSocket } from "@/src/socket/useSocket";
import { useUserStore } from "@/src/store/useUserStore";
import React, { createContext, useContext } from "react";

interface SocketContextType {
  socket: ReturnType<typeof useSocket>["socket"];
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useUserStore((state) => state.token);

  const { socket, connected } = useSocket(token!);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
