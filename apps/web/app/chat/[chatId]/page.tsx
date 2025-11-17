"use client";

import ChatWindow from "@/components/chat/ChatWindow";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatIdPage({ params }: { params: { chatId: string } }) {
  const router = useRouter();

  useEffect(() => {
    const id = params.chatId;
    const valid = !!id && /^[a-fA-F0-9]{24}$/.test(id);
    if (!valid) {
      router.replace("/chat");
    }
  }, [router, params.chatId]);

  return <ChatWindow />;
}