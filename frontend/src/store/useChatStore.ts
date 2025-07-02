import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "../lib/api";
import { Chat, ChatQueryParams, Message } from "../types";

async function fetchChats(
  params: ChatQueryParams
): Promise<{ chats: Chat[]; totalItems: number }> {
  try {
    const response = await axios.get<{
      message: string;
      chats: Chat[];
      totalItems: number;
    }>("/api/chats", { params });
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while fetching chats");
    window.alert(errorMessage);
    return { chats: [], totalItems: 0 };
  }
}

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  hasMoreChats: boolean;
  setChats: (
    params: ChatQueryParams
  ) => Promise<{ chats: Chat[]; totalItems: number }>;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      chats: [],
      messages: {},
      hasMoreChats: true,

      setChats: async (params) => {
        const { chats, totalItems } = await fetchChats(params);
        set(
          (state) => {
            const newChats =
              params.page && params.page > 1
                ? [...state.chats, ...(chats || [])]
                : chats || [];
            const hasMoreChats = newChats.length < totalItems;
            return {
              chats: newChats,
              hasMoreChats,
            };
          },
          false,
          "setChats"
        );
        return { chats, totalItems };
      },
    }),
    { name: "chat-store" }
  )
);
