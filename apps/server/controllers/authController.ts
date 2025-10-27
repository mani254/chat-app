import { User } from '@workspace/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { generateOtp } from './otpController';
dotenv.config();

export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.provider === 'google') {
        res.status(400).json({
          message: 'An account with this email already exists. Please use Google login.',
        });
        return;
      }

      if (existingUser.emailVerified) {
        res.status(400).json({
          message: 'User already exists and is verified. Please log in instead.',
        });
        return;
      }
    }

    const user =
      existingUser ||
      (await User.create({
        name,
        email,
        password,
        provider: 'credentials',
        emailVerified: false,
      }));

    // Generate and send OTP for email verification
    const otpReq = { body: { email, type: 'email_verification' } };
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
      console.error('Failed to send OTP:', otpError);
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email for verification code.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials', data: null });
      return;
    }

    // Check if user is OAuth-only (no password)
    if (user.provider === 'google' && !user.password) {
      res.status(400).json({
        message: 'Use Google login or set a password in your account settings',
        data: null,
      });
      return;
    }

    // Check if user has a password for credentials login
    if (!user.password) {
      res.status(401).json({ message: 'Invalid credentials', data: null });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials', data: null });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Send OTP for email verification

      const otpReq = { body: { email, type: 'email_verification' } };
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
        console.error('Failed to send OTP:', otpError);
      }

      res.status(403).json({
        message: 'Email not verified. Please check your email for verification code.',
        data: {
          requiresVerification: true,
          email: user.email,
        },
      });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        // secure: true,
        // sameSite: "none",
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        // secure: true,
        // sameSite: "none",
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: 'Logged in',
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
    res.status(500).json({ message: 'Login failed' });
  }
};

export const createRefreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(404).json({ message: 'No token found' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    const newAccessToken = generateAccessToken((decoded as any).id);

    res
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        // secure: true,
        // sameSite: "none",
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: 'Token refreshed', accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const handleLogout = (req: Request, res: Response) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err: any) {
    console.error(err.message);
  }
};

export const initiateGoogleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate Google OAuth URL
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CONFIG.clientId}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline&` +
      `state=${encodeURIComponent(
        JSON.stringify({
          redirectTo: req.query.redirectTo || '/',
        }),
      )}`;

    res.json({ authUrl: googleAuthUrl });
  } catch (error) {
    console.error('Google auth initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate Google authentication' });
  }
};

export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?error=${error}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?error=token_exchange_failed`,
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user profile from Google
    const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);

    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', await profileResponse.text());
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?error=profile_fetch_failed`,
      );
    }

    const googleUser = await profileResponse.json();

    // Verify email is verified
    if (!googleUser.verified_email) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?error=email_not_verified`,
      );
    }

    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // User exists - handle different scenarios
      if (user.provider === 'credentials') {
        // Merge with existing credentials account
        user.provider = 'google';
        user.providerId = googleUser.id;
        user.emailVerified = true;

        // Update missing fields if they exist
        if (!user.avatar && googleUser.picture) {
          user.avatar = googleUser.picture;
        }
        if (!user.name && googleUser.name) {
          user.name = googleUser.name;
        }

        await user.save();
        console.log(`Merged existing credentials account with Google: ${user.email}`);
      } else if (user.provider === 'google') {
        // Update existing Google account
        user.providerId = googleUser.id;
        user.emailVerified = true;

        // Update fields if they've changed
        if (googleUser.picture) user.avatar = googleUser.picture;
        if (googleUser.name) user.name = googleUser.name;

        await user.save();
        console.log(`Updated existing Google account: ${user.email}`);
      }
    } else {
      // Create new user
      user = await User.create({
        email: googleUser.email,
        provider: 'google',
        providerId: googleUser.id,
        name: googleUser.name,
        avatar: googleUser.picture,
        emailVerified: true,
        phone: googleUser.phone || null,
        birthday: googleUser.birthday ? new Date(googleUser.birthday) : null,
      });
    }

    // Generate tokens using existing logic
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Parse state to get redirect URL
    let redirectTo = '/';
    try {
      if (state) {
        const stateData = JSON.parse(decodeURIComponent(state as string));
        redirectTo = stateData.redirectTo || '/';
      }
    } catch (err) {
      console.warn('Failed to parse state:', err);
    }

    // Set cookies and redirect to frontend
    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?success=true`);
  } catch (error) {
    console.error('Google callback error:', error);
    // Redirect to frontend with error
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?error=auth_failed`);
  }
};
