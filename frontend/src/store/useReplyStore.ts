import { Message } from "@/src/types";
import { create } from "zustand";

interface ReplyState {
  replyTo: Message | undefined;
  setReplyTo: (message: Message | undefined) => void;
  clearReplyTo: () => void;
}

export const useReplyStore = create<ReplyState>((set) => ({
  replyTo: undefined,
  setReplyTo: (message) => set({ replyTo: message }),
  clearReplyTo: () => set({ replyTo: undefined }),
}));
