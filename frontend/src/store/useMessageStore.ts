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

  setTypingInfo: (typingInfo: MessageState["typingInfo"]) => void;

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
      limit: 20,
      totalMessages: 0,
      loadingMessages: false,

      typingInfo: {
        isTyping: false,
        typingUser: null,
      },

      setTypingInfo: (typingInfo) => set({ typingInfo }),

      addMessage: (message: Message) => {
        set((state) => {
          const exists = state.messages.some((m) => m._id === message._id);
          if (exists) return {};
          return { messages: [...state.messages, message] };
        });
      },

      loadMessages: async ({ chatId, reset = false, limit }) => {
        const { messages, loadingMessages } = get();
        if (loadingMessages) return;

        const fetchLimit = limit ?? get().limit;
        const skip = reset ? 0 : messages.length;

        set({ loadingMessages: true });

        try {
          const { messages: newMessages, totalItems } = await fetchMessages({
            chatId,
            skip,
            limit: fetchLimit,
            sortBy: "createdAt",
            orderBy: "desc",
          });

          const orderedMessages = newMessages.reverse();

          set((state) => ({
            messages: reset
              ? orderedMessages
              : [...orderedMessages, ...state.messages],
            limit: fetchLimit,
            totalMessages: totalItems,
            loadingMessages: false,
          }));
        } catch (err) {
          console.error("Failed to load messages:", err);
          set({ loadingMessages: false });
        }
      },

      resetMessages: () =>
        set({
          messages: [],
          totalMessages: 0,
          loadingMessages: false,
        }),
    }),
    { name: "message-store" }
  )
);

export const messageStore = useMessageStore;
