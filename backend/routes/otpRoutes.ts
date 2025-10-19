import express from "express";
import {
  checkOtpStatus,
  generateOtp,
  resendOtp,
  verifyOtp,
} from "../controllers/otpController";

const router = express.Router();

// OTP routes
router.post("/generate", generateOtp);
router.post("/verify", verifyOtp);
router.post("/resend", resendOtp);
router.get("/status", checkOtpStatus);

export default router;
