import { toast } from "sonner";
import { Message, MessageQueryParams } from "../types";
import api from "./api";

export async function fetchMessages(
  params: MessageQueryParams
): Promise<{ messages: Message[]; totalItems: number }> {
  try {
    const res = await api.get("/api/messages", { params });
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Error fetching messages:", msg);
    toast.error("Error fetching messages", {
      description: msg,
    });
    return { messages: [], totalItems: 0 };
  }
}
