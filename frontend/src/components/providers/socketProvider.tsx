"use client";

import { useSocket } from "@/src/socket/useSocket";
import React, { createContext, useContext } from "react";

const SocketContext = createContext<any>(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) => {
  const { socket, connected } = useSocket(token);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};