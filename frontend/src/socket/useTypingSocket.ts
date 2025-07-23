import { RefObject, useCallback, useEffect } from "react";
import { useSocketContext } from "../components/providers/socketProvider";
import { useMessageStore } from "../store/useMessageStore";
import { User } from "../types";

export const useTypingSocket = (
  activeChatId: string | null,
  typingSoundRef: RefObject<HTMLAudioElement> | null
) => {
  const { socket } = useSocketContext();

  const setTypingInfo = useMessageStore((state) => state.setTypingInfo);

  // Memoized callback for handling new message
  const handleStartTyping = useCallback(
    (chatId: string, user: User) => {
      console.log("server side started typing", chatId, user);
      if (chatId === activeChatId) {
        setTypingInfo({
          isTyping: true,
          typingUser: {
            name: user.name,
            avatar: user.avatar || "",
            id: user._id,
          },
        });
      }
    },
    [activeChatId, setTypingInfo]
  );

  const handleStopTyping = useCallback(
    (chatId: string, user: User) => {
      console.log("server side stopped typing", chatId, user);
      if (chatId === activeChatId) {
        setTypingInfo({ isTyping: false, typingUser: null });
      }
    },
    [activeChatId, setTypingInfo]
  );

  useEffect(() => {
    if (!socket || !activeChatId || !typingSoundRef?.current) return;

    socket.on("server-user-started-typing", handleStartTyping);
    socket.on("server-user-ended-typing", handleStopTyping);
    console.log("typing event listeners added");

    return () => {
      socket.off("server-user-started-typing", handleStartTyping);
      socket.off("server-user-ended-typing", handleStopTyping);
      console.log("typing event listeners removed");
    };
  }, [
    activeChatId,
    handleStartTyping,
    handleStopTyping,
    socket,
    typingSoundRef,
  ]);

  return null;
};
