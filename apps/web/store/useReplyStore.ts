import { MessageWithSender } from '@workspace/database';
import { create } from 'zustand';

interface ReplyState {
  replyTo: MessageWithSender | undefined;
  setReplyTo: (message: MessageWithSender | undefined) => void;
  clearReplyTo: () => void;
}

export const useReplyStore = create<ReplyState>((set) => ({
  replyTo: undefined,
  setReplyTo: (message) => set({ replyTo: message }),
  clearReplyTo: () => set({ replyTo: undefined }),
}));
