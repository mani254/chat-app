"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ProtectedComponent from "../components/auth/Protected";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import NewChatModal from "../components/chat/newChatModel";
import { SocketProvider } from "../components/providers/socketProvider";
import { useUIStore } from "../store/useUiStore";

export default function Home() {
  const { isDarkMode } = useUIStore();
  const [token, setToken] = useState<string | null>('')

  useEffect(() => {
    const updateToken = () => {
      const newToken = localStorage.getItem("accessToken");
      setToken(newToken);
    };

    window.addEventListener("storage", updateToken);

    const interval = setInterval(updateToken, 5_000);

    updateToken();

    return () => {
      window.removeEventListener("storage", updateToken);
      clearInterval(interval);
    };
  }, []);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!token) {
    return null
  }

  return (
    <ProtectedComponent>

      <SocketProvider token={token}>
        <div className="h-screen flex flex-col bg-background">

          <div className="flex-1 flex overflow-hidden">
            <ChatSidebar />

            <motion.main
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ChatWindow />
            </motion.main>

          </div>
          <div className="w-auto absolute bottom-5 right-5">
            <NewChatModal />
          </div>
        </div>
      </SocketProvider>
    </ProtectedComponent>
  );
}
