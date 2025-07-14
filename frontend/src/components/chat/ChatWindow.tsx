"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useChatStore } from "@/src/store/useChatStore";
import { useMessageStore } from "@/src/store/useMessageStore";
import { useUserStore } from "@/src/store/useUserStore";
import { useSocketContext } from "../providers/socketProvider";

import ChatInputArea from "./ChatInputArea";
import ChatMessagesList from "./ChatMessagesList";

const ChatWindow = () => {
  const searchParams = useSearchParams();
  const { socket } = useSocketContext();

  const currentUser = useUserStore((s) => s.currentUser);
  const activeChat = useChatStore((s) => s.activeChat);
  const setActiveChat = useChatStore((s) => s.setActiveChat);

  const messages = useMessageStore((s) => s.messages);
  const loadMessages = useMessageStore((s) => s.loadMessages);
  const resetMessages = useMessageStore((s) => s.resetMessages);
  const loadingMessages = useMessageStore((s) => s.loadingMessages);
  const totalMessages = useMessageStore((s) => s.totalMessages);

  // On chat change: reset and join socket room
  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (!chatId || !socket) return;

    resetMessages();
    setActiveChat(chatId).then(() => {
      socket.emit("join-chat", chatId);
      loadMessages({ chatId, reset: true });
    });
  }, [searchParams, socket, resetMessages, setActiveChat, loadMessages]);

  if (!activeChat) return null;

  const hasMoreMessages = messages.length < totalMessages;

  return (
    <div className="flex-1 flex flex-col h-screen relative">
      <ChatMessagesList
        messages={messages}
        currentUser={currentUser}
        activeChat={activeChat}
        loading={loadingMessages}
        hasMoreMessages={hasMoreMessages}
        onLoadMore={() => loadMessages({ chatId: activeChat._id })}
      />
      <ChatInputArea activeChat={activeChat} />
    </div>
  );
};

export default ChatWindow;
