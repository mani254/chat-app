// lib/chatApi.ts
import { toast } from "sonner";
import { Chat, ChatQueryParams, CreateChatPayload } from "../types";
import api from "./api";

export async function fetchChats(
  params: ChatQueryParams
): Promise<{ chats: Chat[]; totalItems: number }> {
  try {
    const res = await api.get("/api/chats", { params });
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error fetching chats:", msg);
    toast.error("Error fetching chats", {
      description: msg,
    });
    return { chats: [], totalItems: 0 };
  }
}

export async function fetchChatById(chatId: string): Promise<Chat | null> {
  try {
    const res = await api.get(`/api/chats/${chatId}`);
    return res.data.chat;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error fetching chat by ID:", msg);
    toast.error("Error fetching chat", {
      description: msg,
    });
    return null;
  }
}

export async function createChat(
  info: CreateChatPayload
): Promise<Chat | null> {
  try {
    const res = await api.post("/api/chats", info);
    return res.data.chat;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error creating chat:", msg);
    toast.error("Error while creating chats", {
      description: msg,
    });
    return null;
  }
}
