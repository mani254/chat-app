import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Chat, CreateChatPayload } from "../types";

import {
  createChat as createChatAPI,
  fetchChatById,
  fetchChats,
} from "../lib/chatApi";
// import {
//   fetchChats,
//   fetchChatById,
//   createChat as createChatAPI,
// } from "../lib/chatApi"; // separate file (cleaner)

// Zustand state
interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  page: number;
  limit: number;
  totalChats: number;
  loadingChats: boolean;

  loadChats: (params?: {
    search?: string;
    reset?: boolean;
    limit?: number;
    isGroupChat?: boolean;
    userId?: string;
  }) => Promise<void>;

  setActiveChat: (chatId: string) => Promise<void>;
  createChat: (info: CreateChatPayload) => Promise<Chat>;
  resetChats: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      chats: [],
      activeChat: null,
      page: 1,
      limit: 10,
      totalChats: 0,
      loadingChats: false,

      // ✅ Paginated fetch with reset support
      loadChats: async (params = {}) => {
        const { page, limit, chats, loadingChats } = get();
        if (loadingChats) return;

        const reset = params.reset ?? false;
        const nextPage = reset ? 1 : page;
        const fetchLimit = params.limit ?? limit;

        set({ loadingChats: true });

        try {
          const { chats: fetchedChats, totalItems } = await fetchChats({
            search: params.search,
            page: nextPage,
            limit: fetchLimit,
            sortBy: "updatedAt",
            orderBy: "desc",
            isGroupChat: params.isGroupChat,
            userId: params.userId,
          });

          set({
            chats: reset ? fetchedChats : [...chats, ...fetchedChats],
            page: nextPage + 1,
            limit: fetchLimit,
            totalChats: totalItems,
            loadingChats: false,
          });
        } catch (err) {
          console.error("Failed to load chats:", err);
          set({ loadingChats: false });
        }
      },

      // ✅ Load full chat by ID
      setActiveChat: async (chatId: string) => {
        try {
          const chat = await fetchChatById(chatId);
          if (chat) {
            set({ activeChat: chat });
          } else {
            console.warn("No chat found for ID:", chatId);
          }
        } catch (err) {
          console.error("Failed to set active chat:", err);
        }
      },

      // ✅ Create chat and set as active
      createChat: async (info: CreateChatPayload) => {
        const { chats } = get();
        try {
          const chat = await createChatAPI(info);
          if (chat) {
            const existedChat = chats.some((c) => chat._id === c._id);
            console.log(existedChat, "existed chat");
            if (existedChat) {
              set({ activeChat: chat });
            } else {
              set({ activeChat: chat, chats: [chat, ...chats] });
            }
            return chat;
          }
        } catch (err) {
          console.error("Failed to create chat:", err);
        }
      },

      // ✅ Reset chat state
      resetChats: () =>
        set({
          chats: [],
          page: 1,
          totalChats: 0,
          loadingChats: false,
        }),
    }),
    { name: "chat-store" }
  )
);
