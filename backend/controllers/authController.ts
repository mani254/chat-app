import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { generateOtp } from "./otpController";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as any;
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Check if user exists with Google provider
      if (userExists.provider === "google") {
        res.status(400).json({
          message:
            "An account with this email already exists. Please use Google login or contact support.",
        });
        return;
      }
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({
      name,
      email,
      password: password,
      provider: "credentials",
      emailVerified: false,
    });

    // Generate and send OTP for email verification
    const otpReq = { body: { email, type: "email_verification" } };
    const otpRes = {
      status: (code: number) => ({
        json: (data: any) => {
          if (code >= 400) {
            throw new Error(data.message);
          }
        },
      }),
      json: (data: any) => data,
    };

    try {
      await generateOtp(otpReq as any, otpRes as any);
    } catch (otpError) {
      console.error("Failed to send OTP:", otpError);
      // Don't fail registration if OTP sending fails
    }

    res.status(201).json({
      message:
        "User created successfully. Please check your email for verification code.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified,
        requiresVerification: true,
      },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials", data: null });
      return;
    }

    // Check if user is OAuth-only (no password)
    if (user.provider === "google" && !user.password) {
      res.status(400).json({
        message: "Use Google login or set a password in your account settings",
        data: null,
      });
      return;
    }

    // Check if user has a password for credentials login
    if (!user.password) {
      res.status(401).json({ message: "Invalid credentials", data: null });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials", data: null });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Send OTP for email verification

      const otpReq = { body: { email, type: "email_verification" } };
      const otpRes = {
        status: (code: number) => ({
          json: (data: any) => {
            if (code >= 400) {
              throw new Error(data.message);
            }
          },
        }),
        json: (data: any) => data,
      };

      try {
        await generateOtp(otpReq as any, otpRes as any);
      } catch (otpError) {
        console.error("Failed to send OTP:", otpError);
      }

      res.status(403).json({
        message:
          "Email not verified. Please check your email for verification code.",
        data: {
          requiresVerification: true,
          email: user.email,
        },
      });
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
    res.status(500).json({ message: "Login failed" });
  }
};

export const createRefreshToken = async (req: Request, res: Response) => {
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
        // secure: true,
        // sameSite: "none",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const handleLogout = (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (err: any) {
    console.error(err.message);
  }
};
