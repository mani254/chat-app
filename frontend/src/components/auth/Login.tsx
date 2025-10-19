'use client';

import { Button } from '@/components/ui/button';
import { useUserStore } from '@/src/store/useUserStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PasswordInput } from '../FormComponents/PasswordInput';
import { TextInput } from '../FormComponents/TextInput';
import OtpVerification from './OtpVerification';

interface LoginData {
  email: string;
  password: string;
}

const Login = (): React.ReactElement => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const logInUser = useUserStore(state => state.login)

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        const user = await logInUser(loginData);
        if (user) {
          router.replace('/');
        }
      } else if (response.status === 403 && data.data?.requiresVerification) {
        // Email not verified, show OTP verification
        setPendingEmail(loginData.email);
        setShowOtpVerification(true);
      } else {
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleForgotPassword = (): void => {
    // Handle forgot password logic here
  };

  const handleOtpSuccess = () => {
    setShowOtpVerification(false);
    setPendingEmail('');
    // Try login again after verification
    handleSubmit({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>);
  };

  const handleOtpResend = () => {
    // OTP resend is handled in the OtpVerification component
  };

  if (showOtpVerification) {
    return (
      <OtpVerification
        email={pendingEmail}
        onSuccess={handleOtpSuccess}
        onResend={handleOtpResend}
        type="login"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-3">
        <h4 className="text-center sm:text-start font-semibold tracking-tight">Sign in to your account</h4>
        <p className="text-center sm:text-start text-foreground-accent mt-2">
          Not a member?{' '}
          <span>
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create Account
            </Link>
          </span>
        </p>
      </div>

      <TextInput
        label="E-mail"
        type="email"
        placeholder="Email"
        name="email"
        id="email"
        value={loginData.email}
        onChange={handleChange}
        required
        variant="outline"
        wrapperClass="mt-5"
      />

      <PasswordInput
        label="Password"
        placeholder="Password"
        name="password"
        id="password"
        value={loginData.password}
        onChange={handleChange}
        required
        variant="outline"
        wrapperClass="mt-5"
      />

      <div className="flex justify-end mt-2">
        <button
          type="button"
          className="font-medium text-primary text-end cursor-pointer inline-block hover:underline"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>
      </div>

      <Button type="submit" className='w-full py-5 mt-5'>
        Sign In
      </Button>
    </form>
  );
};

export default Login;
