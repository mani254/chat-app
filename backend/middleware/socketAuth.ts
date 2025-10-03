// src/middleware/socketAuth.ts
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import User from "../models/User";

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc: Record<string, string>, part) => {
    const [key, ...rest] = part.trim().split("=");
    acc[decodeURIComponent(key)] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export const authenticateSocket = async (socket: Socket, next: any) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies["accessToken"];

    if (!token) throw new Error("Authentication token not provided");

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      id: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found");

    (socket as any).user = user;
    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Unauthorized"));
  }
};
