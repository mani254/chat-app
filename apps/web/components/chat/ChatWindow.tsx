import useMediaQuery from "@/hooks/useMediaQuery";
import { useMessageSocket } from "@/socket/useMessageSocket";
import { useTypingSocket } from "@/socket/useTypingSocket";
import { useChatStore } from "@/store/useChatStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useUIStore } from "@/store/useUIStore";
import { mobileWidth } from "@/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import MessageInputArea from "../messages/MessageInputArea";
import MessageList from "../messages/MessageList";
import MessageHeader from "../messages/MesssageHeader";
import NoActiveChatScreen from "../messages/NoActiveChatScreen";
import { useSocketContext } from "../providers/SocketProviders";

const ChatWindow = () => {

  const searchParams = useSearchParams();
  const { socket } = useSocketContext()

  const audioRef = useRef<HTMLAudioElement>(null);
  const typingSoundRef = useRef<HTMLAudioElement>(null);

  const activeChat = useChatStore((s) => s.activeChat);
  const setActiveChat = useChatStore((s) => s.setActiveChat);

  const loadMessages = useMessageStore((s) => s.loadMessages);
  const resetMessages = useMessageStore((s) => s.resetMessages);
  const loadingMessages = useMessageStore((s) => s.loadingMessages);

  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);

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


  useMessageSocket(activeChat?._id.toString() || null, audioRef as React.RefObject<HTMLAudioElement>);
  useTypingSocket(activeChat?._id.toString() || undefined, typingSoundRef as React.RefObject<HTMLAudioElement>)

  if (!activeChat) {
    return <NoActiveChatScreen />
  }



  return (
    <div className="flex-1 flex flex-col  h-full relative bg-background">

      <div className="relative -z-50 hidden">
        <audio controls ref={audioRef} src='/sounds/message-arrived-sound-effect.mp3' />
      </div>

      <div className="relative -z-50 hidden">
        <audio controls ref={typingSoundRef} src='sounds/typing-effect.mp3' />
      </div>

      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
          <MessageHeader chat={activeChat} />
        </div>

        <MessageList
          activeChat={activeChat}
          loading={loadingMessages}
          onLoadMore={() => loadMessages({ chatId: activeChat._id.toString() })}
        />

        <MessageInputArea />
      </div>

    </div>
  )
}

export default ChatWindow
