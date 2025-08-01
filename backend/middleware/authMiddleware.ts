import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const authorise = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    let user = await User.findById((decoded as any).id).select("password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    console.log(req.query, "--req.query in the auth middlware");
    req.userId = user._id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token Expired" });
  }
};
