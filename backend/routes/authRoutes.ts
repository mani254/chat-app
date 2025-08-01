import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({ name, email, password: password });
    res.status(201).json({
      message: "User created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err: any) {
    console.error(err.message);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);

    if (!user || !isMatch) {
      res.status(401).json({ message: "Invalid credentials", data: null });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        // secure: true,
        // sameSite: "none",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: true,
        // sameSite: "none",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Logged in",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      });
  } catch (err: any) {
    console.error(err.message);
  }
});

router.get("/refresh", (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(404).json({ message: "No token found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    const newAccessToken = generateAccessToken((decoded as any).id);

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (err: any) {
    console.error(err.message);
  }
});

export default router;
