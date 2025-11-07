import { createChat, fetchChatById, fetchChats } from '@/lib/chatApi';
import { CreateChatPayload, MessageDocument, MessageWithSender, PopulatedChatDocument } from '@workspace/database';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ChatState {
  chats: PopulatedChatDocument[];
  activeChat: PopulatedChatDocument | null;
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

  setActiveChat: (chatId: string | null) => Promise<void>;
  createChat: (info: CreateChatPayload) => Promise<PopulatedChatDocument>;
  updateChatLatestMessage: (chatId: string, message: MessageWithSender) => Promise<void>;
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
            sortBy: 'updatedAt',
            orderBy: 'desc',
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
          console.error('Failed to load chats:', err);
          set({ loadingChats: false });
        }
      },

      // ✅ Load full chat by ID
      setActiveChat: async (chatId: string | null) => {
        if (!chatId) {
          set({ activeChat: null });
          return;
        }
        try {
          const chat = await fetchChatById(chatId);
          if (chat) {
            set({ activeChat: chat });
          } else {
            console.warn('No chat found for ID:', chatId);
          }
        } catch (err) {
          console.error('Failed to set active chat:', err);
        }
      },

      // ✅ Create chat and set as active
      createChat: async (info: CreateChatPayload) => {
        const { chats } = get();
        try {
          const chat = await createChat(info);
          if (chat) {
            const existedChat = chats.some((c) => chat._id === c._id);
            if (existedChat) {
              set({ activeChat: chat });
            } else {
              set({ activeChat: chat, chats: [chat, ...chats] });
            }
            return chat;
          }
        } catch (err) {
          console.error('Failed to create chat:', err);
        }
      },

      updateChatLatestMessage: async (chatId: string, message: MessageDocument) => {
        const { chats, limit } = get();

        const existingIndex = chats.findIndex((c) => c._id.toString() === chatId);

        if (existingIndex !== -1) {
          // ✅ Chat exists: update latestMessage and move it to top
          const updatedChat = {
            ...chats[existingIndex],
            latestMessage: message,
          };

          const updatedChats = [updatedChat, ...chats.slice(0, existingIndex), ...chats.slice(existingIndex + 1)];

          set({ chats: updatedChats as PopulatedChatDocument[] });
        } else {
          try {
            // 🚀 Chat does not exist: fetch and push to top
            const fetchedChat = await fetchChatById(chatId);

            if (fetchedChat) {
              // ✅ Update latestMessage
              fetchedChat.latestMessage = message;

              const trimmedChats = chats.length >= limit ? chats.slice(0, limit - 1) : chats;

              set({ chats: [fetchedChat, ...trimmedChats] });
            }
          } catch (err) {
            console.error('Failed to fetch chat for update:', err);
          }
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
    { name: 'chat-store' },
  ),
);
