import { RefObject, useCallback, useEffect } from "react";
import { useSocketContext } from "../components/providers/socketProvider";
import { useChatStore } from "../store/useChatStore";
import { useMessageStore } from "../store/useMessageStore";
import { Message } from "../types";

export const useMessageSocket = (
  activeChatId: string | null,
  audioRef: RefObject<HTMLAudioElement> | null
) => {
  const { socket } = useSocketContext();

  const addMessage = useMessageStore((state) => state.addMessage);
  const updateChatLatestMessage = useChatStore(
    (state) => state.updateChatLatestMessage
  );

  // Memoized callback for handling new message
  const handleNewMessage = useCallback(
    (message: Message) => {
      console.log("new message received", message);

      if (typeof message.chat === "string" || !message.chat?._id) {
        console.log("chat is not populated inside the message");
        return;
      }

      if (message.chat._id === activeChatId) {
        addMessage(message);
        if (audioRef?.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }
    },
    [activeChatId, addMessage, audioRef]
  );

  // Memoized callback for updating chat latest message
  const handleNewMessageChatUpdate = useCallback(
    (message: Message) => {
      console.log("new message chat update received", message);

      if (typeof message.chat === "string" || !message.chat?._id) {
        console.log("chat is not populated inside the message");
        return;
      }

      updateChatLatestMessage(message.chat._id, message);
    },
    [updateChatLatestMessage]
  );

  useEffect(() => {
    if (!socket || !activeChatId || !audioRef?.current) return;

    socket.on("new-message", handleNewMessage);
    console.log("new-message event listener added");

    socket.on("new-message-chat-update", handleNewMessageChatUpdate);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("new-message-chat-update", handleNewMessageChatUpdate);
      console.log("event listeners removed");
    };
  }, [
    socket,
    activeChatId,
    audioRef,
    handleNewMessage,
    handleNewMessageChatUpdate,
  ]);

  return null;
};
