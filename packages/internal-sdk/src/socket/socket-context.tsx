import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getEnvConfig } from '../config/env.config';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export interface SocketProviderProps {
  children: React.ReactNode;
  url?: string;
  token?: string | null;
}

/**
 * Resolves the backend Socket.IO URL & namespace (/chat).
 * Defaults cleanly to single source of truth getEnvConfig().socketUrl.
 */
const resolveSocketUrl = (customUrl?: string): string => {
  const targetUrl = customUrl || getEnvConfig().socketUrl;
  const trimmed = targetUrl.replace(/\/$/, '');
  return trimmed.endsWith('/chat') ? trimmed : `${trimmed}/chat`;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  url,
  token,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = resolveSocketUrl(url);
    const authToken = token || localStorage.getItem('auth_token') || '';

    if (!authToken) {
      setIsConnected(false);
      setSocket(null);
      return;
    }

    const socketInstance = io(socketUrl, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [url, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
