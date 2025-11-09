import { MessageWithSender } from '@workspace/database';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MessageActionsState {
  showMessageActions: boolean;
  currentMessage: MessageWithSender | null;

  openMessageActions: (message: MessageWithSender) => void;
  closeMessageActions: () => void;
  toggleMessageActions: (message?: MessageWithSender) => void;
}

export const useMessageActionsStore = create<MessageActionsState>()(
  devtools(
    (set, get) => ({
      showMessageActions: false,
      currentMessage: null,

      openMessageActions: (message) => {
        set({
          showMessageActions: true,
          currentMessage: message,
        });
      },

      closeMessageActions: () => {
        set({
          showMessageActions: false,
          currentMessage: null,
        });
      },

      toggleMessageActions: (message) => {
        const { showMessageActions, currentMessage } = get();

        if (showMessageActions && currentMessage?._id === message?._id) {
          set({
            showMessageActions: false,
            currentMessage: null,
          });
          return;
        }

        set({
          showMessageActions: true,
          currentMessage: message ?? null,
        });
      },
    }),
    { name: 'message-actions-store' },
  ),
);

export const messageActionsStore = useMessageActionsStore;
