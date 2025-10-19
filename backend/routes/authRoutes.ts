import express from "express";
import {
  createRefreshToken,
  handleLogout,
  loginUser,
  registerUser,
} from "../controllers/authController";
import {
  handleGoogleCallback,
  initiateGoogleAuth,
} from "../controllers/googleAuthController";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/refresh", createRefreshToken);

router.post("/logout", handleLogout);

// Google OAuth routes
router.get("/google", initiateGoogleAuth);
router.get("/google/callback", handleGoogleCallback);

export default router;
