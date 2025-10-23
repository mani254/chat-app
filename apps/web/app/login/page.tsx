
'use client';

import Login from "@/components/auth/Login";
import LoginRegistration from "@/components/auth/LoginRegistration";
import { useUserStore } from "@/store/useUserStore";


const LoginPage = () => {
  const loginWithGoogle = useUserStore(state => state.loginWithGoogle);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <>
      <LoginRegistration onGoogleLogin={handleGoogleLogin}>
        <Login />
      </LoginRegistration>
    </>
  )
}

export default LoginPage