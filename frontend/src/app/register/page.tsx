'use client';

import LoginRegistration from "@/src/components/auth/LoginRegistration";
import Register from "@/src/components/auth/Register";
import { useUserStore } from "@/src/store/useUserStore";


const RegisterPage = () => {
  const loginWithGoogle = useUserStore(state => state.loginWithGoogle);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div>
      <LoginRegistration onGoogleLogin={handleGoogleLogin}>
        <Register />
      </LoginRegistration>
    </div>
  )
}

export default RegisterPage
