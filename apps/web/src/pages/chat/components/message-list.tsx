import React, { useEffect, useRef } from 'react';
import type { MessageResponse, UserSummary } from '@org/shared';
import { MessageBubble } from './message-bubble';
import { TypingDots } from './typing-dots';
import { Spinner } from '@org/ui';

interface MessageListProps {
  messages: MessageResponse[];
  currentUser: UserSummary | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onFetchNextPage: () => void;
  typingUser?: { name: string } | null;
  onReplyMessage: (msg: MessageResponse) => void;
  onDeleteMessage: (msgId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  typingUser,
  onReplyMessage,
  onDeleteMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Handle top infinite scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      prevScrollHeightRef.current = container.scrollHeight;
      onFetchNextPage();
    }
  };

  // Adjust scroll position after loading older messages
  useEffect(() => {
    const container = containerRef.current;
    if (container && prevScrollHeightRef.current > 0) {
      const scrollDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  // Scroll to bottom on initial load or new message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, typingUser]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F7]/80">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 bg-[#F5F5F7]/80 scrollbar-thin scrollbar-thumb-slate-300"
    >
      {/* Top Loader when loading previous cursor page */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Spinner size="sm" />
        </div>
      )}

      {/* Beginning of chat marker */}
      {!hasNextPage && messages.length > 0 && (
        <div className="text-center my-4 text-xs text-slate-400 font-medium">
          Beginning of conversation history
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <p className="text-sm font-semibold text-slate-600">No messages yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Send a message to start the conversation!
          </p>
        </div>
      )}

      {/* Message Bubbles Stream */}
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          message={msg}
          currentUser={currentUser}
          onReply={onReplyMessage}
          onDelete={onDeleteMessage}
        />
      ))}

      {/* Active Typing Indicator */}
      {typingUser && (
        <div className="my-2">
          <TypingDots userName={typingUser.name} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
