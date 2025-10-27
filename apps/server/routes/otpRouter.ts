import express from 'express';
import { generateOtp, resendOtp, verifyOtp } from '../controllers/otpController';

const otpRouter = express.Router();

// OTP routes
otpRouter.post('/generate', generateOtp);
otpRouter.post('/verify', verifyOtp);
otpRouter.post('/resend', resendOtp);

export default otpRouter;
