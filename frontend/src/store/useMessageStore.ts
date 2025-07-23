import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "../lib/api";
import { Message, MessageQueryParams } from "../types";

async function fetchMessages(
  params: MessageQueryParams
): Promise<{ messages: Message[]; totalItems: number }> {
  try {
    const res = await axios.get("/api/messages", { params });
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error fetching messages:", msg);
    window.alert(msg);
    return { messages: [], totalItems: 0 };
  }
}

interface MessageState {
  messages: Message[];
  page: number;
  limit: number;
  totalMessages: number;
  loadingMessages: boolean;
  typingInfo: {
    isTyping: boolean;
    typingUser: {
      name: string;
      id: string;
      avatar: string;
    } | null;
  };
  setTypingInfo: (typingInfo: {
    isTyping: boolean;
    typingUser: {
      name: string;
      id: string;
      avatar: string;
    } | null;
  }) => void;

  addMessage: (message: Message) => void;

  loadMessages: (params: {
    chatId: string;
    reset?: boolean;
    limit?: number;
  }) => Promise<void>;

  resetMessages: () => void;
}

export const useMessageStore = create<MessageState>()(
  devtools(
    (set, get) => ({
      messages: [],
      page: 1,
      limit: 40,
      totalMessages: 0,
      loadingMessages: false,

      loadMessages: async ({ chatId, reset = false, limit }) => {
        const { page, messages, loadingMessages } = get();
        if (loadingMessages) return;

        const nextPage = reset ? 1 : page;
        const fetchLimit = limit ?? get().limit;

        set({ loadingMessages: true });

        try {
          const { messages: newMessages, totalItems } = await fetchMessages({
            chatId,
            page: nextPage,
            limit: fetchLimit,
          });

          const orderedMessages = newMessages.reverse();

          set({
            messages: reset
              ? orderedMessages
              : [...orderedMessages, ...messages],
            page: nextPage + 1,
            limit: fetchLimit,
            totalMessages: totalItems,
            loadingMessages: false,
          });
        } catch (err) {
          console.error("Failed to load messages", err);
          set({ loadingMessages: false });
        }
      },

      setTypingInfo(typingInfo) {
        set({ typingInfo });
      },

      addMessage: (message: Message) => {
        const { messages, limit } = get();
        const newMessages = [...messages];

        if (newMessages.length >= limit) {
          newMessages.shift();
        }

        newMessages.push(message);
        set({ messages: newMessages });
      },

      resetMessages: () =>
        set({
          messages: [],
          page: 1,
          totalMessages: 0,
          loadingMessages: false,
        }),
    }),
    { name: "message-store" }
  )
);

export const messageStore = useMessageStore;
