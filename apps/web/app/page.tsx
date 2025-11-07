"use client";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
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
          <div className="h-[100dvh] flex overflow-hidden">
            <ChatSidebar />
            <ChatWindow />
          </div>
        </SocketProvider>
      </ProtectedRoute>
    </main>
  );
}
