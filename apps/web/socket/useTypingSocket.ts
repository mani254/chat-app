import { useSocketContext } from '@/components/providers/SocketProviders';
import { UserDocument } from '@workspace/database';
import { RefObject, useCallback, useEffect } from 'react';
import { useMessageStore } from '../store/useMessageStore';

export const useTypingSocket = (
  activeChatId: string | undefined,
  typingSoundRef: RefObject<HTMLAudioElement> | null,
) => {
  const { socket } = useSocketContext();
  const setTypingInfo = useMessageStore((state) => state.setTypingInfo);

  // Start typing event handler
  const handleStartTyping = useCallback(
    (chatId: string, user: UserDocument) => {
      if (chatId !== activeChatId) return;

      console.log('🟢 Server: user started typing', user.name);

      // Update typing info in store
      setTypingInfo({
        isTyping: true,
        typingUser: {
          name: user.name,
          avatar: user.avatar || '',
          id: user._id.toString(),
        },
      });

      // Play typing sound (restart from 0)
      const typingSound = typingSoundRef?.current;
      if (typingSound) {
        typingSound.currentTime = 0; // restart from beginning
        typingSound.loop = true; // loop until stopped
        const playPromise = typingSound.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('🔇 Typing sound playback failed:', err);
          });
        }
      }
    },
    [activeChatId, setTypingInfo, typingSoundRef],
  );

  // Stop typing event handler
  const handleStopTyping = useCallback(
    (chatId: string, user: UserDocument) => {
      if (chatId !== activeChatId) return;

      console.log('🔴 Server: user stopped typing', user.name);

      // Reset typing info
      setTypingInfo({ isTyping: false, typingUser: null });

      // Stop typing sound immediately
      const typingSound = typingSoundRef?.current;
      if (typingSound) {
        typingSound.pause();
        typingSound.currentTime = 0; // reset to beginning
      }
    },
    [activeChatId, setTypingInfo, typingSoundRef],
  );

  // Add/remove socket event listeners
  useEffect(() => {
    if (!socket || !activeChatId) return;

    socket.on('server-user-started-typing', handleStartTyping);
    socket.on('server-user-ended-typing', handleStopTyping);

    console.log('✅ Typing event listeners added for chat:', activeChatId);

    return () => {
      socket.off('server-user-started-typing', handleStartTyping);
      socket.off('server-user-ended-typing', handleStopTyping);

      // Ensure sound is stopped on cleanup
      const sound = typingSoundRef?.current;
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }

      console.log('🧹 Typing event listeners removed for chat:', activeChatId);
    };
  }, [socket, activeChatId, handleStartTyping, handleStopTyping, typingSoundRef]);

  return null;
};
