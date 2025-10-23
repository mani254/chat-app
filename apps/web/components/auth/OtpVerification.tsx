'use client';

import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
import { useEffect, useRef, useState } from 'react';
import { TextInput } from '../formComponents/TextInput';

interface OtpVerificationProps {
  email: string;
  onSuccess: () => void;
  onResend: () => void;
  type?: 'registration' | 'login';
}

const OtpVerification = ({ email, onSuccess, onResend, type = 'registration' }: OtpVerificationProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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

    // Focus the last filled input or the first empty one
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          otp: otpString,
          type: 'email_verification',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified successfully!');
        onSuccess();
      } else {
        toast.error(data.message || 'Verification failed');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/api/otp/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          type: 'email_verification',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent!');
        setTimeLeft(600); // Reset timer
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        onResend();
      } else {
        toast.error(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {type === 'registration' ? 'Verify Your Email' : 'Email Verification Required'}
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

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
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              disabled={isVerifying}
            />
          ))}
        </div>
      </div>

      <div className="text-center mb-6">
        {timeLeft > 0 ? (
          <p className="text-sm text-gray-600">
            Code expires in <span className="font-medium text-red-600">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <p className="text-sm text-red-600 font-medium">Code has expired</p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleVerify}
          disabled={isVerifying || otp.join('').length !== 6 || timeLeft === 0}
          className="w-full py-3 text-base font-medium"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify Email'
          )}
        </Button>

        <Button
          onClick={handleResend}
          disabled={isResending || timeLeft > 0}
          variant="outline"
          className="w-full py-3 text-base font-medium"
        >
          {isResending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
              Sending...
            </div>
          ) : (
            'Resend Code'
          )}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Didn't receive the code? Check your spam folder or{' '}
          <button
            onClick={handleResend}
            disabled={isResending || timeLeft > 0}
            className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            try again
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;