import { io, Socket } from 'socket.io-client';
import axios from './api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL as string;

let socket: Socket | null = null;

const handleTokenRefresh = async () => {
  try {
    // Request new tokens from the server
    await axios.get(`${BACKEND_URL}/api/auth/refresh`, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Handle unauthorized error
    socket.on('connect_error', async (error) => {
      if (error.message === 'Unauthorized') {
        console.log('🔄 Token expired, attempting refresh...');
        const refreshed = await handleTokenRefresh();
        if (refreshed) {
          console.log('✅ Token refreshed, reconnecting...');
          socket?.connect();
        } else {
          console.log('❌ Token refresh failed');
          // Optionally redirect to login page or show error
          window.location.href = '/login';
        }
      }
    });

    // Handle new access token from server
    socket.on('connect', () => {
      const newAccessToken = (socket as any)?.handshake?.newAccessToken;
      if (newAccessToken) {
        console.log('✅ Received new access token');
        // Token is automatically set in cookies by the server
      }
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
