"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ProtectedRoute } from "../components/auth/Protected";
import PlusButton from "../components/chat/chats/PlusButton";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { SocketProvider } from "../components/providers/socketProvider";
import { useChatStore } from "../store/useChatStore";
import { useUIStore } from "../store/useUiStore";

export default function Home() {
  const theme = useUIStore(s => s.theme)

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const activeChat = useChatStore((s) => s.activeChat);

  return (
    <ProtectedRoute>
      <SocketProvider>
        <div className={`${theme} h-screen bg-background-accent flex overflow-hidden`}>
          <ChatSidebar />
          <motion.main
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ChatWindow />
          </motion.main>
        </div>
        <div className={cn("fixed w-min right-10 md:left-10 bottom-14 z-10",
          activeChat && "hidden md:block"
        )}>
          <PlusButton />
        </div>
      </SocketProvider>
    </ProtectedRoute>
  );
}
