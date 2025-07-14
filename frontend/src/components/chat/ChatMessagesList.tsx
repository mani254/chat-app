"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useRef } from "react";

import { Chat, Message, User } from "@/src/types";
import ChatMessageBubble from "./ChatMessageBubble";

interface ChatMessagesListProps {
  messages: Message[];
  currentUser: User | null;
  activeChat: Chat;
  loading: boolean;
  hasMoreMessages: boolean;
  onLoadMore: () => void;
}

const ChatMessagesList = ({
  messages,
  currentUser,
  activeChat,
  loading,
  hasMoreMessages,
  onLoadMore,
}: ChatMessagesListProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const setupObserver = useCallback(() => {
    const scrollEl = scrollRef.current;
    const sentinel = observerRef.current;
    if (!scrollEl || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMoreMessages) {
          onLoadMore();
        }
      },
      { root: scrollEl, threshold: 1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMoreMessages, onLoadMore]);

  useEffect(() => {
    const cleanup = setupObserver();
    return cleanup;
  }, [setupObserver]);

  return (
    <ScrollArea className="flex-1 p-4 overflow-auto bg-background h-full" ref={scrollRef}>
      <div ref={observerRef} className="h-1" />
      <div className="space-y-4 pb-[100px]">
        {messages.map((message) => {
          const isOwn = message.sender._id === currentUser?._id;
          const showName = activeChat?.isGroupChat && !isOwn;
          return (
            <ChatMessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              showName={showName}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ChatMessagesList;
