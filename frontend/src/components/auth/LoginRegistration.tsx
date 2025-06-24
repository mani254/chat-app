'use client';

// import logo from '@/assets/images/logo.png';
import Image from 'next/image';
import { apple, google, loginBackground } from '../../utils';

const LoginRegistration = ({ children }: { children: React.ReactNode }) => {

  return (
    <section className="w-full h-screen flex justify-end bg-zinc-500">
      <div className="relative sm:w-full">
        <Image
          className="absolute w-full h-full object-cover object-center"
          src={loginBackground}
          alt="login page background"
          fill
          priority
        />
      </div>
      <div className="w-full md:w-[700px] sm:min-w-[500px] bg-white p-5 sm:p-10 flex items-center">
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
            <div className="h-[1px] bg-gray-400 w-full"></div>
            <p className="whitespace-nowrap px-4"> Or continue with</p>
            <div className="h-[1px] bg-gray-400 w-full"></div>
          </div>

          <div className="flex justify-around mt-6 gap-4">
            <div className="flex items-center justify-center border border-gray-300 px-3 py-1 rounded-md bg-white shadow-sm cursor-pointer w-full">
              <Image
                className="w-6 mr-3"
                src={google}
                alt="google svg icon"
                width={24}
                height={24}
              />
              <p className="whitespace-nowrap font-medium">Google</p>
            </div>
            <div className="flex items-center justify-center border border-gray-300 px-3 py-1 rounded-md bg-white shadow-sm cursor-pointer w-full">
              <Image
                className="w-6 mr-3"
                src={apple}
                alt="apple svg icon"
                width={24}
                height={24}
              />
              <p className="whitespace-nowrap font-medium">Apple</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginRegistration;
