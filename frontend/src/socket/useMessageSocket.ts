import { useEffect } from "react";
import { useSocketContext } from "../components/providers/socketProvider";
import { useChatStore } from "../store/useChatStore";
import { useMessageStore } from "../store/useMessageStore";
import { Message } from "../types";

export const useMessageSocket = (activeChatId: string | null) => {
  const { socket } = useSocketContext();
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateChatLatestMessage = useChatStore(
    (state) => state.updateChatLatestMessage
  );

  useEffect(() => {
    if (!socket || !activeChatId) return;

    const handleNewMessage = (message: Message) => {
      console.log("new message received", message);
      if (typeof message.chat === "string" || !message.chat?._id) {
        console.log("chat is not populated inside the message");
        return;
      }
      if (message.chat._id === activeChatId) {
        addMessage(message);
      }
    };

    const handleNewMessageChatUpdate = (message: Message) => {
      console.log("new message chat update received", message);
      if (typeof message.chat === "string" || !message.chat?._id) {
        console.log("chat is not populated inside the message");
        return;
      }
      updateChatLatestMessage(message.chat._id, message);
    };

    socket.on("new-message", handleNewMessage);
    console.log("new-message event listener added");

    socket.on("new-message-chat-update", handleNewMessageChatUpdate);
    return () => {
      socket.off("new-message", handleNewMessage);
      console.log("new-message event listener removed");
    };
  }, [socket, activeChatId, addMessage, updateChatLatestMessage]);
};
