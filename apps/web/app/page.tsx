"use client";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { SocketProvider } from "@/components/providers/SocketProviders";
import { useUIStore } from "@/store/useUIStore";
import { useEffect } from "react";

export default function Home() {

  const theme = useUIStore(s => s.theme)

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <main className="">
      <ProtectedRoute>
        <SocketProvider>
          <div></div>
        </SocketProvider>
      </ProtectedRoute>
    </main>
  );
}
