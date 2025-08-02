'use client';

import { Button } from '@/components/ui/button';
import { useUserStore } from '@/src/store/useUserStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PasswordInput } from '../FormComponents/PasswordInput';
import { TextInput } from '../FormComponents/TextInput';

interface LoginData {
  email: string;
  password: string;
}

const Login = (): React.ReactElement => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

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
      const user = await logInUser(loginData)
      if (user) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleForgotPassword = (): void => {
    // Handle forgot password logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-3">
        <h4 className="text-center sm:text-start font-semibold">Sign in to your account</h4>
        <p className="text-center sm:text-start font-regular text-opacity-60 mt-2">
          Not a member?{' '}
          <span>
            <Link href="/register" className="text-blue-500 font-medium">
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
          className="font-medium text-blue-500 text-end cursor-pointer inline-block"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>
      </div>

      <Button type="submit" className='w-full py-5 hover:bg-opacity-90 mt-5'>
        Sign In
      </Button>
    </form>
  );
};

export default Login;
