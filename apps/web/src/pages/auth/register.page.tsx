import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, Input, OtpInput, PasswordInput } from '@org/ui';
import {
  useSendOtp,
  useVerifyOtp,
  useRegister,
  useResendOtp,
  ApiError,
} from '@org/internal-sdk';
import { AuthLayout } from '../../layout/auth-layout';

// Zod schemas for each step
const step1Schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

const step3Schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step3Values = z.infer<typeof step3Schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [resendTimer, setResendTimer] = React.useState(0);

  const sendOtpMutation = useSendOtp();
  const resendOtpMutation = useResendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const registerMutation = useRegister();

  // Resend countdown timer
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [resendTimer]);

  // Form handlers
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema as any),
    defaultValues: { email: '' },
  });

  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema as any),
    defaultValues: { name: '', password: '', confirmPassword: '' },
  });

  // Step 1: Send OTP
  const onStep1Submit = (values: Step1Values) => {
    setGeneralError(null);
    sendOtpMutation.mutate(
      { email: values.email, purpose: 'register' },
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
            setGeneralError('Failed to send OTP code. Please try again.');
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
      { email, otp, purpose: 'register' },
      {
        onSuccess: (res) => {
          if (res.verified) {
            setStep(3);
          } else {
            setOtpError(res.message || 'Invalid OTP code');
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
      { email, purpose: 'register' },
      {
        onSuccess: () => {
          setResendTimer(60);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setGeneralError(err.message);
          }
        },
      }
    );
  };

  // Step 3: Complete Registration
  const onStep3Submit = (values: Step3Values) => {
    setGeneralError(null);
    registerMutation.mutate(
      {
        email,
        name: values.name,
        password: values.password,
        otp,
      },
      {
        onSuccess: () => {
          navigate('/chat');
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setGeneralError(err.message);
          } else {
            setGeneralError('Registration failed. Please try again.');
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
            ? 'Create an account'
            : step === 2
            ? 'Verify your email'
            : 'Complete your profile'
        }
        description={
          step === 1
            ? 'Enter your email address to get started'
            : step === 2
            ? `We sent a 6-digit code to ${email}`
            : 'Set your name and secure password'
        }
        footer={
          <div className="text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-zinc-100 font-semibold hover:underline transition-all"
            >
              Sign in
            </Link>
          </div>
        }
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === s
                    ? 'bg-zinc-100 text-zinc-950 ring-2 ring-zinc-400'
                    : step > s
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                }`}
              >
                {s}
              </div>
              <span
                className={`text-xs font-medium ${
                  step === s ? 'text-zinc-200' : 'text-zinc-600'
                }`}
              >
                {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Profile'}
              </span>
            </div>
          ))}
        </div>

        {generalError && (
          <Alert variant="error" className="mb-4">
            {generalError}
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
              Send Verification Code
            </Button>
          </form>
        )}

        {/* STEP 2: Verify 6-digit OTP */}
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

        {/* STEP 3: Complete Profile */}
        {step === 3 && (
          <form
            onSubmit={step3Form.handleSubmit(onStep3Submit)}
            className="space-y-4"
          >
            <Input
              label="Full name"
              placeholder="John Doe"
              error={step3Form.formState.errors.name?.message}
              {...step3Form.register('name')}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              error={step3Form.formState.errors.password?.message}
              {...step3Form.register('password')}
            />

            <PasswordInput
              label="Confirm password"
              placeholder="••••••••"
              error={step3Form.formState.errors.confirmPassword?.message}
              {...step3Form.register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={registerMutation.isPending}
            >
              Complete Registration
            </Button>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}
