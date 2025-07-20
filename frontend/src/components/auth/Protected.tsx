"use client";

import { useUserStore } from "@/src/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, setToken, getCurrentUser } = useUserStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const localToken = localStorage.getItem("accessToken");
      if (!localToken) {
        router.replace("/login");
        return;
      }

      setToken(localToken);
      await getCurrentUser();
      setCheckingAuth(false);
    };

    initializeAuth();
  }, [router, setToken, getCurrentUser]);


  if (checkingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  return <>{children}</>;
};
