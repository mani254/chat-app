'use client';


import { Button } from '@/components/ui/button';
import { useUserStore } from '@/src/store/useUserStore';
import { validation } from '@/src/utils/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import { PasswordInput } from '../FormComponents/PasswordInput';
import { TextInput } from '../FormComponents/TextInput';


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

  const registerUser = useUserStore((state) => state.register);
  const router = useRouter();

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

    const hasErrors = Object.values(error).some((value) => value !== '');
    if (hasErrors) return;

    const { email, password, name } = registerData;
    try {
      await registerUser({ email, password, name });
      router.replace('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-3">
        <h4 className="text-center sm:text-start font-semibold">Welcome! Create your account</h4>
        <p className="text-center sm:text-start font-regular text-opacity-60 mt-2">
          Already have account?{' '}
          <span>
            <Link href="/login" className="text-blue-500 font-medium">
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

      <Button className='w-full mt-5 py-5' type="submit">
        Register
      </Button>
    </form>
  );
};

export default Register;
