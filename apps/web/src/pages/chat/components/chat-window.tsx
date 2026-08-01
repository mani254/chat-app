import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  useChatDetailsQuery,
  useCurrentUser,
  useInfiniteMessagesQuery,
  useMarkReadMutation,
  useSendMessageMutation,
  useSocket,
} from '@org/internal-sdk';
import type { MessageResponse } from '@org/shared';
import { WS_EVENTS } from '@org/shared';
import { MessageHeader } from './message-header';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { useQueryClient } from '@tanstack/react-query';
import { CHAT_KEYS } from '@org/internal-sdk';
import { MESSAGE_KEYS } from '@org/internal-sdk';

interface ChatWindowProps {
  chatId: string | null;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null);
  const [typingUser, setTypingUser] = useState<{ name: string } | null>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: chat } = useChatDetailsQuery(chatId);

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMessagesQuery(chatId);

  const sendMessageMutation = useSendMessageMutation(chatId || '');
  const markReadMutation = useMarkReadMutation(chatId || '');

  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Audio refs
  const arrivalSoundRef = useRef<HTMLAudioElement | null>(null);
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    arrivalSoundRef.current = new Audio('/sounds/message-arrived-sound-effect.mp3');
    typingSoundRef.current = new Audio('/sounds/typing-effect.mp3');
    if (typingSoundRef.current) {
      typingSoundRef.current.loop = true;
    }
  }, []);

  // Flatten and reverse messages (so newest are at bottom)
  const rawItems = messagesData?.pages.flatMap((page) => page.items) || [];
  const messages = [...rawItems].reverse();

  // Socket Room Join/Leave and Event Subscription
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join room
    socket.emit(WS_EVENTS.CHAT_JOIN_ROOM, { chatId });

    // Mark as read
    markReadMutation.mutate();

    // Event Handler: Incoming new message
    const handleNewMessage = (msg: MessageResponse) => {
      if (msg.chatId === chatId) {
        // Play arrival sound if not sent by self
        if (msg.sender?._id !== currentUser?._id && arrivalSoundRef.current) {
          arrivalSoundRef.current.currentTime = 0;
          arrivalSoundRef.current.play().catch(() => {});
        }

        // Invalidate message list & chat list
        queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.list(chatId) });
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
      }
    };

    // Event Handler: Typing Start
    const handleTypingStart = (payload: { chatId: string; name?: string; userId?: string }) => {
      if (payload.chatId === chatId && payload.userId !== currentUser?._id) {
        setTypingUser({ name: payload.name || 'Someone' });
        if (typingSoundRef.current) {
          typingSoundRef.current.currentTime = 0;
          typingSoundRef.current.play().catch(() => {});
        }
      }
    };

    // Event Handler: Typing Stop
    const handleTypingStop = (payload: { chatId: string; userId?: string }) => {
      if (payload.chatId === chatId) {
        setTypingUser(null);
        if (typingSoundRef.current) {
          typingSoundRef.current.pause();
          typingSoundRef.current.currentTime = 0;
        }
      }
    };

    socket.on(WS_EVENTS.MESSAGE_NEW, handleNewMessage);
    socket.on(WS_EVENTS.TYPING_START, handleTypingStart);
    socket.on(WS_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      socket.emit(WS_EVENTS.CHAT_LEAVE_ROOM, { chatId });
      socket.off(WS_EVENTS.MESSAGE_NEW, handleNewMessage);
      socket.off(WS_EVENTS.TYPING_START, handleTypingStart);
      socket.off(WS_EVENTS.TYPING_STOP, handleTypingStop);

      if (typingSoundRef.current) {
        typingSoundRef.current.pause();
        typingSoundRef.current.currentTime = 0;
      }
    };
  }, [socket, chatId, currentUser?._id, queryClient]);

  // Handle Send Message
  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!chatId) return;
    await sendMessageMutation.mutateAsync({
      chatId,
      content,
      replyToId,
    });
  };

  if (!chatId || !chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F5F5F7]/80 text-slate-500">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 mb-4 shadow-md shadow-slate-200/60">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Select a Conversation</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Pick a conversation from the sidebar or start a new chat to begin messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F7]/80 relative overflow-hidden">
      {/* Header */}
      <MessageHeader chat={chat} currentUser={currentUser || null} onBack={onBack} />

      {/* Message Stream */}
      <MessageList
        messages={messages}
        currentUser={currentUser || null}
        isLoading={isLoadingMessages}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onFetchNextPage={fetchNextPage}
        typingUser={typingUser}
        onReplyMessage={(msg) => setReplyTo(msg)}
        onDeleteMessage={() => {}}
      />

      {/* Input */}
      <MessageInput
        chatId={chatId}
        onSend={handleSendMessage}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
      />
    </div>
  );
};
