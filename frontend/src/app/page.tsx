"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { ProtectedRoute } from "../components/auth/Protected";
import NewChatModal from "../components/chat/chats/NewChatModal";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { SocketProvider } from "../components/providers/socketProvider";
import { useUIStore } from "../store/useUiStore";

export default function Home() {
  const theme = useUIStore(s => s.theme)

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ProtectedRoute>
      <SocketProvider>
        <div className={`${theme} h-screen bg-background-accent flex`}>
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
        <div className="w-auto fixed left-20 bottom-20 z-10">
          <NewChatModal />
        </div>
      </SocketProvider>
    </ProtectedRoute>
  );
}
