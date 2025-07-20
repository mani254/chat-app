"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "../components/auth/Protected";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import NewChatModal from "../components/chat/newChatModel";
import Header from "../components/Header";
import { SocketProvider } from "../components/providers/socketProvider";

export default function Home() {


  return (
    <ProtectedRoute>
      <SocketProvider>
        <div className="h-screen bg-background flex pt-[65px]">
          <Header />
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
        <div className="w-auto fixed left-5 bottom-5">
          <NewChatModal />
        </div>
      </SocketProvider>
    </ProtectedRoute>
  );
}
