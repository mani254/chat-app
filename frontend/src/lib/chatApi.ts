// lib/chatApi.ts
import { Chat, ChatQueryParams, CreateChatPayload } from "../types";
import axios from "./api";

export async function fetchChats(
  params: ChatQueryParams
): Promise<{ chats: Chat[]; totalItems: number }> {
  try {
    const res = await axios.get("/api/chats", { params });
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error fetching chats:", msg);
    window.alert(msg);
    return { chats: [], totalItems: 0 };
  }
}

export async function fetchChatById(chatId: string): Promise<Chat | null> {
  try {
    const res = await axios.get(`/api/chats/${chatId}`);
    return res.data.chat;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error fetching chat by ID:", msg);
    window.alert(msg);
    return null;
  }
}

export async function createChat(
  info: CreateChatPayload
): Promise<Chat | null> {
  try {
    const res = await axios.post("/api/chats", info);
    return res.data.chat;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error creating chat:", msg);
    window.alert(msg);
    return null;
  }
}
