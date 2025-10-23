// hooks/useSocket.ts
import { getSocket } from '@/lib/socket';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useUserStore } from '../store/useUserStore';

export const useSocket = (): { socket: Socket | null; connected: boolean } => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sock = getSocket();

    sock.connect();

    sock.on('connect', () => {
      console.log('✅ Socket connected:', sock.id);
      setConnected(true);
    });

    sock.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    sock.on('user-online', ({ userData }) => {
      console.log('👤 User Online:', userData);
      useUserStore.getState().addActiveUser(userData);
    });

    sock.on('user-offline', ({ userId }) => {
      console.log('👤 User Offline:', userId);
      useUserStore.getState().removeActiveUser(userId);
    });

    sock.on('connect_error', (err) => {
      console.error('🚨 Socket connection error:', err.message);
    });

    setSocket(sock);

    return () => {
      sock.off('connect');
      sock.off('disconnect');
      sock.off('user-online');
      sock.off('user-offline');
      sock.off('new-message');
      sock.off('connect_error');
      sock.disconnect();
    };
  }, []);

  return { socket, connected };
};
