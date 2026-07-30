import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, Input, PasswordInput } from '@org/ui';
import { useLogin, useGoogleLogin, ApiError } from '@org/internal-sdk';
import { AuthLayout } from '../../layout/auth-layout';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setErrorMessage(null);
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/chat');
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Failed to sign in. Please check your credentials.');
        }
      },
    });
  };

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    const mockEmail = prompt('Enter your Google Email address for instant Google Sign-In:', 'user@gmail.com');
    if (!mockEmail) return;

    googleLoginMutation.mutate(
      { idToken: 'google_token_' + Date.now(), email: mockEmail, name: mockEmail.split('@')[0] },
      {
        onSuccess: () => {
          navigate('/chat');
        },
        onError: (err) => {
          setErrorMessage(err instanceof ApiError ? err.message : 'Google sign-in failed.');
        },
      }
    );
  };

  return (
    <AuthLayout>
      <Card
        title="Sign in to your account"
        description="Enter your credentials or continue with Google"
        footer={
          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline transition-all"
            >
              Sign up
            </Link>
          </div>
        }
      >
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-center gap-2.5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleGoogleSignIn}
            isLoading={googleLoginMutation.isPending}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <Alert variant="error" title="Authentication Error">
                {errorMessage}
              </Alert>
            )}

            <Input
              label="Email address"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex justify-end mb-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={loginMutation.isPending}
            >
              Sign in
            </Button>
          </form>
        </div>
      </Card>
    </AuthLayout>
  );
}
