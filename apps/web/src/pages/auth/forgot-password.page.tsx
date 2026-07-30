import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, Input, OtpInput, PasswordInput } from '@org/ui';
import {
  useSendOtp,
  useVerifyOtp,
  useForgotPassword,
  useResendOtp,
  ApiError,
} from '@org/internal-sdk';
import { AuthLayout } from '../../layout/auth-layout';

const step1Schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

const step3Schema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step3Values = z.infer<typeof step3Schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [resendTimer, setResendTimer] = React.useState(0);

  const sendOtpMutation = useSendOtp();
  const resendOtpMutation = useResendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const forgotPasswordMutation = useForgotPassword();

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [resendTimer]);

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema as any),
    defaultValues: { email: '' },
  });

  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema as any),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Step 1: Send Reset OTP
  const onStep1Submit = (values: Step1Values) => {
    setGeneralError(null);
    sendOtpMutation.mutate(
      { email: values.email, purpose: 'forgot_password' },
      {
        onSuccess: () => {
          setEmail(values.email);
          setStep(2);
          setResendTimer(60);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setGeneralError(err.message);
          } else {
            setGeneralError('Failed to send reset code. Please try again.');
          }
        },
      }
    );
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }
    setOtpError(null);
    setGeneralError(null);

    verifyOtpMutation.mutate(
      { email, otp, purpose: 'forgot_password' },
      {
        onSuccess: (res) => {
          if (res.verified) {
            setStep(3);
          } else {
            setOtpError(res.message || 'Invalid code');
          }
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setOtpError(err.message);
          } else {
            setOtpError('Verification failed. Please try again.');
          }
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setGeneralError(null);
    resendOtpMutation.mutate(
      { email, purpose: 'forgot_password' },
      {
        onSuccess: () => setResendTimer(60),
        onError: (err) => {
          if (err instanceof ApiError) setGeneralError(err.message);
        },
      }
    );
  };

  // Step 3: Reset Password
  const onStep3Submit = (values: Step3Values) => {
    setGeneralError(null);
    forgotPasswordMutation.mutate(
      {
        email,
        otp,
        newPassword: values.newPassword,
      },
      {
        onSuccess: (res) => {
          setSuccessMessage(res.message || 'Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setGeneralError(err.message);
          } else {
            setGeneralError('Failed to reset password. Please try again.');
          }
        },
      }
    );
  };

  return (
    <AuthLayout>
      <Card
        title={
          step === 1
            ? 'Reset your password'
            : step === 2
            ? 'Verify reset code'
            : 'Set new password'
        }
        description={
          step === 1
            ? 'Enter your registered email address'
            : step === 2
            ? `Enter the 6-digit code sent to ${email}`
            : 'Create a new secure password for your account'
        }
        footer={
          <div className="text-center text-xs text-zinc-400">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="text-zinc-100 font-semibold hover:underline transition-all"
            >
              Sign in
            </Link>
          </div>
        }
      >
        {generalError && (
          <Alert variant="error" className="mb-4">
            {generalError}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form
            onSubmit={step1Form.handleSubmit(onStep1Submit)}
            className="space-y-4"
          >
            <Input
              label="Email address"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              error={step1Form.formState.errors.email?.message}
              {...step1Form.register('email')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={sendOtpMutation.isPending}
            >
              Send Reset Code
            </Button>
          </form>
        )}

        {/* STEP 2: Verify Code */}
        {step === 2 && (
          <div className="space-y-6">
            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setOtpError(null);
              }}
              error={otpError || undefined}
            />

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-zinc-200 hover:underline"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || resendOtpMutation.isPending}
                className="hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
              >
                {resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : resendOtpMutation.isPending
                  ? 'Sending...'
                  : 'Resend code'}
              </button>
            </div>

            <Button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full"
              isLoading={verifyOtpMutation.isPending}
            >
              Verify Code
            </Button>
          </div>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form
            onSubmit={step3Form.handleSubmit(onStep3Submit)}
            className="space-y-4"
          >
            <PasswordInput
              label="New password"
              placeholder="••••••••"
              error={step3Form.formState.errors.newPassword?.message}
              {...step3Form.register('newPassword')}
            />

            <PasswordInput
              label="Confirm new password"
              placeholder="••••••••"
              error={step3Form.formState.errors.confirmPassword?.message}
              {...step3Form.register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={forgotPasswordMutation.isPending}
            >
              Reset Password
            </Button>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}
