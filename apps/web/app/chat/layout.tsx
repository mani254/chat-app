"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import CreateChatButton from "@/components/chat/CreateChatButton";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { SocketProvider } from "@/components/providers/SocketProviders";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {

  const theme = useUIStore((s) => s.theme);
  const activeChat = useChatStore((s) => s.activeChat);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <main className="">
      <ProtectedRoute>
        <SocketProvider>
          <div className="h-dvh flex overflow-hidden">
            <ChatSidebar />
            {children}
          </div>
          <div
            className={cn(
              "fixed w-min right-10 md:left-10 bottom-14 z-10",
              activeChat && "hidden md:block"
            )}
          >
            <CreateChatButton />
          </div>
        </SocketProvider>
      </ProtectedRoute>
    </main>
  );
}