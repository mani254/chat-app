'use client';

import { resendOtp, verfiyOtp } from '@/lib/otpApi';
import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TextInput } from '../formComponents/TextInput';

interface OtpVerificationProps {
  email: string;
  onSuccess: () => void;
  onResend: () => void;
  type?: 'registration' | 'login';
}

const OtpVerification = ({ email, onSuccess, onResend, type = 'registration' }: OtpVerificationProps) => {

  const router = useRouter();
  // OTP input
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Process states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Resend cooldown timer (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // --- OTP input handling ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  // --- Verify OTP ---
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a complete 6-digit code');
      return;
    }
    setIsVerifying(true);
    const result = await verfiyOtp({ email, otp: otpString, type: 'email_verification' });
    if (result?.verified) {
      toast.success('Email verified successfully Login to continue');
      router.push('login');
      onSuccess();
    }
    setIsVerifying(false);
  };

  // --- Resend OTP ---
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    await resendOtp({ email, type: 'email_verification' });
    setIsResending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-accent">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">
          {type === 'registration' ? 'Verify Your Email' : 'Email Verification Required'}
        </h2>
        <p className="text-foreground-accent">We've sent a 6-digit verification code to</p>
        <p className="font-medium text-foreground">{email}</p>
      </div>

      {/* OTP Inputs */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Enter verification code
        </label>
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el: any) => (inputRefs.current[index] = el || null)}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-bold border focus:ring-1  rounded-lg outline-none transition-colors"
              disabled={isVerifying}
            />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleVerify}
          disabled={isVerifying || otp.join('').length !== 6}
          className="w-full py-3 text-base font-medium cursor-pointer"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2 border-primary-invert"></div>
              Verifying...
            </div>
          ) : (
            'Verify Email'
          )}
        </Button>

        <Button
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
          variant="outline"
          className="w-full py-3 text-base font-medium cursor-pointer"
        >
          {isResending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2 border-foreground-accent"></div>
              Sending...
            </div>
          ) : resendCooldown > 0 ? (
            `Resend available in ${resendCooldown}s`
          ) : (
            'Resend Code'
          )}
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-foreground-accent">
          Didn’t receive the code? Check your spam folder or{' '}
          <button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="font-medium disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:text-primary/80"
          >
            {resendCooldown > 0 ? `try again in ${resendCooldown}s` : 'try again'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
