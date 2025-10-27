import { Otp, User } from '@workspace/database';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { generateOtpEmailTemplate } from '../mailTemplates/otpMail';
import sendMail from '../utils/sendMail';
// Generate and send OTP
export const generateOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, type = 'email_verification' } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Check if user exists for email verification
    if (type === 'email_verification') {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
    }

    // Invalidate any existing unused OTPs for this email and type
    await Otp.updateMany({ email, type, isUsed: false }, { isUsed: true });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create OTP record (expires in 10 minutes)
    await Otp.create({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Get user name for email template
    const user = await User.findOne({ email });
    const userName = user?.name || 'User';

    // Send OTP email
    const emailHtml = generateOtpEmailTemplate(otp, userName);
    await sendMail({
      subject: 'Email Verification - ChatApp',
      html: emailHtml,
      to: email,
    });

    res.json({
      message: 'OTP sent successfully',
      data: {
        email,
        type,
        expiresIn: 600,
      },
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, type = 'email_verification' } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }

    // Find valid OTP
    const otpRecord = await Otp.findOne({
      email,
      otp,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // Check attempt limit
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      res.status(400).json({
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      });
      return;
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Handle email verification
    if (type === 'email_verification') {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user.emailVerified = true;
      await user.save();
    }

    res.json({
      message: 'OTP verified successfully',
      data: {
        email,
        type,
        verified: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Resend OTP
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, type = 'email_verification' } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if email is already verified
    if (type === 'email_verification' && user.emailVerified) {
      res.status(400).json({ message: 'Email is already verified login' });
      return;
    }

    // Generate new OTP
    await generateOtp(req, res);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};
