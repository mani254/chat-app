'use client';


import LoginRegistration from "@/components/auth/LoginRegistration";
import Register from "@/components/auth/Register";
import { useUserStore } from "@/store/useUserStore";


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