import { Request, Response } from "express";
import { GOOGLE_CONFIG } from "../config/auth";
import User from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";

// Google OAuth initiation endpoint
export const initiateGoogleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
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
          redirectTo: req.query.redirectTo || "/",
        })
      )}`;

    res.json({ authUrl: googleAuthUrl });
  } catch (error) {
    console.error("Google auth initiation error:", error);
    res
      .status(500)
      .json({ message: "Failed to initiate Google authentication" });
  }
};

// Google OAuth callback handler
export const handleGoogleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state, error } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/google/callback?error=${error}`
      );
    }

    if (!code) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/google/callback?error=no_code`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/google/callback?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user profile from Google
    const profileResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
    );

    if (!profileResponse.ok) {
      console.error("Profile fetch failed:", await profileResponse.text());
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/google/callback?error=profile_fetch_failed`
      );
    }

    const googleUser = await profileResponse.json();

    // Verify email is verified
    if (!googleUser.verified_email) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/google/callback?error=email_not_verified`
      );
    }

    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // User exists - handle different scenarios
      if (user.provider === "credentials") {
        // Merge with existing credentials account
        user.provider = "google";
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
        console.log(
          `Merged existing credentials account with Google: ${user.email}`
        );
      } else if (user.provider === "google") {
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
        provider: "google",
        providerId: googleUser.id,
        name: googleUser.name,
        avatar: googleUser.picture,
        emailVerified: true,
        phone: googleUser.phone || null,
        birthday: googleUser.birthday ? new Date(googleUser.birthday) : null,
      });
      console.log(`Created new Google user: ${user.email}`);
    }

    // Generate tokens using existing logic
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Parse state to get redirect URL
    let redirectTo = "/";
    try {
      if (state) {
        const stateData = JSON.parse(decodeURIComponent(state as string));
        redirectTo = stateData.redirectTo || "/";
      }
    } catch (err) {
      console.warn("Failed to parse state:", err);
    }

    // Set cookies and redirect to frontend
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/google/callback?success=true`
      );
  } catch (error) {
    console.error("Google callback error:", error);
    // Redirect to frontend with error
    res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/auth/google/callback?error=auth_failed`
    );
  }
};
