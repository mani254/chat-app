import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  userId?: any;
}

export const authorise = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    req.userId = await User.findById((decoded as any).id).select("password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token Expired" });
  }
};
