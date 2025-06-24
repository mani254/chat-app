"use client";
import { motion } from "framer-motion";
import { useEffect } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import Header from "../components/Header";
import ProtectedComponent from "../components/Protected";
import { useUIStore } from "../store/useUiStore";

export default function Home() {
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ProtectedComponent>
      <div className="h-screen flex flex-col bg-background">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          <ChatSidebar />

          <motion.main
            className="flex-1 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ChatWindow />
          </motion.main>

        </div>

      </div>
    </ProtectedComponent>
  );
}
