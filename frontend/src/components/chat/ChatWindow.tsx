"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useChatStore } from "@/src/store/useChatStore";
import { useMessageStore } from "@/src/store/useMessageStore";
import { useUserStore } from "@/src/store/useUserStore";
import { useSocketContext } from "../providers/socketProvider";

import { useMessageSocket } from "@/src/socket/useMessageSocket";
import { useTypingSocket } from "@/src/socket/useTypingSocket";

import useMediaQuery from "@/src/hooks/useMediaQuery";
import { useUIStore } from "@/src/store/useUiStore";
import ChatMessagesList from "./ChatMessagesList";
import MessageHeader from "./messages/MessageHeader";
import MessageInputArea from "./messages/MessageInputArea";


const ChatWindow = () => {
  const searchParams = useSearchParams();
  const { socket } = useSocketContext()

  const audioRef = useRef<HTMLAudioElement>(null);
  const typingSoundRef = useRef<HTMLAudioElement>(null);

  const currentUser = useUserStore((s) => s.currentUser);
  const activeChat = useChatStore((s) => s.activeChat);
  const setActiveChat = useChatStore((s) => s.setActiveChat);


  const loadMessages = useMessageStore((s) => s.loadMessages);
  const resetMessages = useMessageStore((s) => s.resetMessages);
  const loadingMessages = useMessageStore((s) => s.loadingMessages);


  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // On chat change: reset and join socket room
  useEffect(() => {
    const chatId = searchParams.get("chatId");

    if (!isDesktop && !chatId) {
      toggleSidebar(true);
      setActiveChat(null);
      resetMessages();
    }

    if (!chatId || !socket) return;

    resetMessages();
    setActiveChat(chatId).then(() => {
      socket.emit("join-chat", chatId);
      console.log("Joined Room:", chatId);
      loadMessages({ chatId, reset: true });
    });
    return () => {
      socket.emit("leave-chat", chatId);
      console.log("Left Room:", chatId);
    }
  }, [searchParams, socket, resetMessages, setActiveChat, loadMessages, isDesktop, toggleSidebar]);

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit("reg-user-chat-updates", currentUser._id);
      console.log("Registered for chat updates for user:", currentUser._id);
    }
    return () => {
      if (socket && currentUser) {
        socket.emit("unreg-user-chat-updates", currentUser._id);
        console.log("Unregistered for chat updates for user:", currentUser._id);
      }
    }
  }, [socket, currentUser]);

  useMessageSocket(activeChat?._id || null, audioRef as React.RefObject<HTMLAudioElement>);
  useTypingSocket(activeChat?._id || null, typingSoundRef as React.RefObject<HTMLAudioElement>);

  if (!activeChat) return null;


  return (
    <div className="flex-1 flex flex-col  h-full relative bg-background">

      <div className="relative -z-50 hidden">
        <audio controls ref={audioRef} src='../../assets/sounds/message-arrived-sound-effect.mp3' />
      </div>

      <div className="relative -z-50 hidden">
        <audio controls ref={typingSoundRef} src='../../assets/sounds/typing-effect.mp3' />
      </div>

      <div className="flex flex-col h-full">

        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
          <MessageHeader chat={activeChat} />
        </div>
        <ChatMessagesList
          currentUser={currentUser}
          activeChat={activeChat}
          loading={loadingMessages}
          onLoadMore={() => loadMessages({ chatId: activeChat._id })}
        />
        <MessageInputArea activeChat={activeChat} />
      </div>
    </div>
  );
};

export default ChatWindow;
