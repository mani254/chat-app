'use client';

import { google, loginBackground } from '@/utils';
// import logo from '@/assets/images/logo.png';
import Image from 'next/image';


interface LoginRegistrationProps {
  children: React.ReactNode;
  onGoogleLogin?: () => void;
}

const LoginRegistration = ({ children, onGoogleLogin }: LoginRegistrationProps) => {

  return (
    <section className="w-full h-screen flex justify-end bg-background-invert">
      <div className="relative sm:w-full">
        <Image
          className="absolute w-full h-full object-cover object-center"
          src={loginBackground}
          alt="login page background"
          fill
          priority
        />
      </div>
      <div className="w-full md:w-[700px] sm:min-w-[500px] bg-background p-5 sm:p-10 flex items-center">
        <div className="w-full">
          <Image
            className="m-auto block sm:m-0 w-12 h-12"
            src={'/logo.png'}
            alt="logo"
            width={48}
            height={48}
          />

          {children}

          <div className="flex items-center mt-6">
            <div className="h-px w-full border border-border"></div>
            <p className="text-xs text-foreground-accent px-2">OR</p>
            <div className="h-px w-full bg-border"></div>
          </div>

          <div className="flex justify-around mt-6 gap-4">
            <div
              className="flex items-center justify-center border px-3 py-1 rounded-md shadow-sm cursor-pointer w-full transition-colors border-border bg-background hover:bg-background-accent"
              onClick={onGoogleLogin}
            >
              <Image
                className="w-6 mr-3"
                src={google}
                alt="google svg icon"
                width={24}
                height={24}
              />
              <p className="whitespace-nowrap font-medium">Google</p>
            </div>
            {/* <div className="flex items-center justify-center border border-gray-300 px-3 py-1 rounded-md bg-white shadow-sm cursor-pointer w-full">
              <Image
                className="w-6 mr-3"
                src={apple}
                alt="apple svg icon"
                width={24}
                height={24}
              />
              <p className="whitespace-nowrap font-medium">Apple</p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginRegistration;