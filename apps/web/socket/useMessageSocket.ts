// src/socket/useMessageSocket.ts
import { useSocketContext } from '@/components/providers/SocketProviders';
import { useMessageStore } from '@/store/useMessageStore';
import { MessageWithSender } from '@workspace/database';
import { RefObject, useCallback, useEffect } from 'react';

export const useMessageSocket = (activeChatId: string | null, audioRef: RefObject<HTMLAudioElement> | null) => {
  const { socket } = useSocketContext();
  const addMessage = useMessageStore((s) => s.addMessage);

  // ✅ Handler for incoming messages in currently active chat
  const handleNewMessage = useCallback(
    (message: MessageWithSender) => {
      if (!message || !message.chat) return;

      const chatId = typeof message.chat === 'string' ? message.chat : message.chat._id?.toString?.();

      // only add messages for the open chat
      if (chatId !== activeChatId) return;

      addMessage(message);

      if (audioRef?.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        } catch (err) {
          console.warn('Audio play failed', err);
        }
      }
    },
    [activeChatId, addMessage, audioRef],
  );

  // ✅ Register chat-specific listeners
  useEffect(() => {
    if (!socket || !activeChatId) return;

    socket.on('new-message', handleNewMessage);
    console.log('[useMessageSocket] new-message listener added:', activeChatId);

    return () => {
      socket.off('new-message', handleNewMessage);
      console.log('[useMessageSocket] new-message listener removed:', activeChatId);
    };
  }, [socket, activeChatId, handleNewMessage]);

  return null;
};
