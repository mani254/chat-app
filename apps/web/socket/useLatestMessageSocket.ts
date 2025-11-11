// src/socket/useLatestMessageSocket.ts
import { useSocketContext } from '@/components/providers/SocketProviders';
import { useChatStore } from '@/store/useChatStore';
import { MessageWithSender } from '@workspace/database';
import { useCallback, useEffect } from 'react';

export const useLatestMessageSocket = () => {
  const { socket } = useSocketContext();
  const updateChatLatestMessage = useChatStore((s) => s.updateChatLatestMessage);

  // ✅ Handler to update chat list when new message arrives (for any chat)
  const handleNewMessageChatUpdate = useCallback(
    (message: MessageWithSender) => {
      if (!message || !message.chat) return;

      const chatId = typeof message.chat === 'string' ? message.chat : message.chat._id?.toString?.();

      if (!chatId) return;

      // update latest message on chat list
      updateChatLatestMessage(chatId, message);
    },
    [updateChatLatestMessage],
  );

  // ✅ Always listen for chat update events (user-scoped)
  useEffect(() => {
    if (!socket) return;

    socket.on('new-message-chat-update', handleNewMessageChatUpdate);
    console.log('[useLatestMessageSocket] listener added');

    return () => {
      socket.off('new-message-chat-update', handleNewMessageChatUpdate);
      console.log('[useLatestMessageSocket] listener removed');
    };
  }, [socket, handleNewMessageChatUpdate]);

  return null;
};
