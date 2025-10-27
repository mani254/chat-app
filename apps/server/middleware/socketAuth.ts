// src/middleware/socketAuth.ts
import { User } from '@workspace/database';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc: Record<string, string>, part) => {
    const [key, ...rest] = part.trim().split('=');
    acc[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

export const authenticateSocket = async (socket: Socket, next: any) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const accessToken = cookies['accessToken'];
    const refreshToken = cookies['refreshToken'];

    if (!accessToken && !refreshToken) {
      throw new Error('Authentication tokens not provided');
    }

    try {
      if (accessToken) {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as {
          id: string;
        };
        const user = await User.findById(decoded.id);
        if (user) {
          (socket as any).user = user;
          return next();
        }
      }
    } catch (accessError) {
      // Access token is invalid or expired, try refresh token
      if (!refreshToken) throw new Error('Refresh token not provided');
    }

    // Try to refresh the token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        id: string;
      };

      const user = await User.findById(decoded.id);
      if (!user) throw new Error('User not found');

      // Generate new tokens
      const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '15m',
      });

      (socket as any).newAccessToken = newAccessToken;
      (socket as any).user = user;
      next();
    } catch (refreshError) {
      throw new Error('Invalid refresh token');
    }
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Unauthorized'));
  }
};
