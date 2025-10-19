
'use client';

import Login from "@/src/components/auth/Login";
import LoginRegistration from "@/src/components/auth/LoginRegistration";
import { useUserStore } from "@/src/store/useUserStore";


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
