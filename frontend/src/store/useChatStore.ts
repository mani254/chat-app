import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Chat, Message } from "../types";
import { useUserStore } from "./useUserStore";

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  sendMessage: (
    chatId: string,
    content: string,
    messageType?: "text" | "image" | "file"
  ) => void;
  markAsRead: (chatId: string, messageId: string, userId: string) => void;
  loadMoreMessages: (chatId: string) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      chats: [],
      messages: {},
      sendMessage: (chatId, content, messageType = "text") => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) return;
        const newMessage: Message = {
          _id: `msg${Date.now()}`,
          chat: chatId,
          sender: currentUser._id,
          content,
          readBy: [currentUser._id],
          messageType,
          createdAt: new Date().toISOString(),
        };
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [chatId]: [...(state.messages[chatId] || []), newMessage],
            },
            chats: state.chats.map((chat) =>
              chat._id === chatId
                ? { ...chat, latestMessage: newMessage._id }
                : chat
            ),
          }),
          false,
          "sendMessage"
        );
      },
      markAsRead: (chatId, messageId, userId) => {
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [chatId]:
                state.messages[chatId]?.map((msg) =>
                  msg._id === messageId && !msg.readBy.includes(userId)
                    ? { ...msg, readBy: [...msg.readBy, userId] }
                    : msg
                ) || [],
            },
          }),
          false,
          "markAsRead"
        );
      },
      loadMoreMessages: (chatId) => {
        console.log(`Loading more messages for chat: ${chatId}`);
      },
    }),
    { name: "chat-store" }
  )
);
