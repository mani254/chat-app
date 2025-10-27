'use client';

import { useUserStore } from '@/store/useUserStore';
import { validation } from '@/utils/validation';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { PasswordInput } from '../formComponents/PasswordInput';
import { TextInput } from '../formComponents/TextInput';
import OtpVerification from './OtpVerification';

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface ErrorState {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

const Register = (): React.ReactElement => {
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [error, setError] = useState<ErrorState>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const registerUser = useUserStore((state) => state.register);
  const router = useRouter();
  const hasErrors = useMemo(() => {
    return Object.values(error).some((value) => value !== '')
  }, [error]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;

    setRegisterData((prev) => ({ ...prev, [name]: value }));

    const validationError = validation(name, value);
    setError((prev) => ({ ...prev, [name]: validationError || '' }));

    if (name === 'confirmPassword') {
      if (!value) return;
      if (registerData.password !== value) {
        setError((prev) => ({ ...prev, confirmPassword: 'passwords not match' }));
      } else {
        setError((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
    if (name === 'password') {
      if (!registerData.confirmPassword) return;
      if (registerData.confirmPassword !== value) {
        setError((prev) => ({ ...prev, confirmPassword: 'passwords not match' }));
      } else {
        setError((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (hasErrors) return;

    const { email, password, name } = registerData;
    const user = await registerUser({ email, password, name });

    if (!user) return;

    if (!user.emailVerified) {
      setPendingEmail(email);
      setShowOtpVerification(true);
    } else {
      router.replace('/login')
    }


  };

  const handleOtpSuccess = () => {
    setShowOtpVerification(false);
    setPendingEmail('');
    router.replace('/login');
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
        type="registration"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-3">
        <h4 className="text-center sm:text-start font-semibold tracking-tight">Welcome! Create your account</h4>
        <p className="text-center sm:text-start text-foreground-accent mt-2">
          Already have account?{' '}
          <span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </span>
        </p>
      </div>

      <TextInput
        label="User name"
        type="text"
        placeholder="User name"
        name="name"
        id="name"
        value={registerData.name}
        onChange={handleChange}
        required
        variant="outline"
        wrapperClass="mt-5"
        error={error.name}
      />

      <TextInput
        label="E-mail"
        type="email"
        placeholder="Email"
        name="email"
        id="email"
        value={registerData.email}
        onChange={handleChange}
        required
        variant="outline"
        wrapperClass="mt-5"
        error={error.email}
      />

      <PasswordInput
        label="Password"
        placeholder="Password"
        name="password"
        id="password"
        value={registerData.password}
        onChange={handleChange}
        required
        variant="outline"
        wrapperClass="mt-5"
        error={error.password}
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm Password"
        name="confirmPassword"
        id="confirmPassword"
        value={registerData.confirmPassword}
        onChange={handleChange}
        required
        variant="outline"
        wrapperClass="mt-5"
        error={error.confirmPassword}
      />

      <Button className='w-full bg-primary text-background-accent py-5 mt-5 cursor-pointer' type="submit" disabled={hasErrors || !registerData.email || !registerData.password || !registerData.name || !registerData.confirmPassword}>
        Register
      </Button>
    </form>
  );
};

export default Register;