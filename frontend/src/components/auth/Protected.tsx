"use client";

import { useUserStore } from "@/src/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, getCurrentUser } = useUserStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await getCurrentUser();
      setCheckingAuth(false);
    };

    initializeAuth();
  }, [router, getCurrentUser]);

  // Redirect after render cycle completes to avoid state updates during render
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [checkingAuth, isAuthenticated, router]);


  if (checkingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
