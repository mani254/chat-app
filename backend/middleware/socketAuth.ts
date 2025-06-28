// src/middleware/socketAuth.ts
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import User from "../models/User";

export const authenticateSocket = async (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth?.token;

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
