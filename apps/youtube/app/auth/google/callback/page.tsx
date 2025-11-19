"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    
    if (error) {
      router.push("/login?error=" + error);
    } else {
      // Successful authentication - redirect to home
      router.push("/youtube");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing Google Login...</h2>
        <p className="text-gray-600">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}