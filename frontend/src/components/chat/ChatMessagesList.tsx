"use client";

import { Chat, Message, User } from "@/src/types";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import ChatMessageBubble from "./messages/MessageBubble";
import TypingDots from "./messages/TypingDots";

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
  const topObserverRef = useRef<HTMLDivElement | null>(null); // for load more
  const bottomObserverRef = useRef<HTMLDivElement | null>(null); // for scroll-to-bottom visibility

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasNewMessageInBottom, setHasNewMessageInBottom] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // 🧭 Infinite Scroll Observer (TOP)
  const setupTopObserver = useCallback(() => {
    const scrollEl = scrollRef.current;
    const sentinel = topObserverRef.current;
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

  // 👁️ Scroll-to-bottom Observer (BOTTOM)
  const setupBottomObserver = useCallback(() => {
    const scrollEl = scrollRef.current;
    const bottomSentinel = bottomObserverRef.current;
    if (!scrollEl || !bottomSentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollToBottom(!entry.isIntersecting);
      },
      { root: scrollEl, threshold: 0.1 }
    );

    observer.observe(bottomSentinel);
    return () => observer.disconnect();
  }, []);

  // Setup both observers
  useEffect(() => {
    const cleanupTop = setupTopObserver();
    const cleanupBottom = setupBottomObserver();
    return () => {
      if (cleanupTop) cleanupTop();
      if (cleanupBottom) cleanupBottom();
    };
  }, [setupTopObserver, setupBottomObserver]);

  // ✅ Initial scroll to bottom once on load
  useEffect(() => {
    if (!scrollRef.current || initialScrollDone || messages.length === 0) return;

    requestAnimationFrame(() => {
      scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
      setInitialScrollDone(true);
    });
  }, [messages.length, initialScrollDone]);

  // 🔁 Reset initial scroll on chat change
  useEffect(() => {
    setInitialScrollDone(false);
  }, [activeChat?._id]);

  // 🔽 When new message arrives, track if user is near bottom
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollBottomGap = container.scrollHeight - (container.scrollTop + container.clientHeight);
    const isAtBottom = scrollBottomGap < 100;

    if (isAtBottom) {
      container.scrollTop = container.scrollHeight;
      setHasNewMessageInBottom(false);
    }
  }, [messages]);

  return (
    <div className="flex-1 px-4 overflow-y-auto bg-background h-full" ref={scrollRef}>
      {/* 🔼 Top Observer (for infinite scroll) */}

      <div ref={topObserverRef} className="h-8 flex justify-center items-center">
        {loading && <LoadMoreLoader />}
      </div>

      {/* 💬 Chat Messages */}
      <div className="space-y-4 pb-[80px]">
        {messages.map((message) => {
          const isOwn = message.sender._id === currentUser?._id;
          const showName = activeChat?.isGroupChat && !isOwn;
          const systemMessage = message.midText
          return (
            <ChatMessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              showName={showName}
              systemMessage={systemMessage}
            />
          );
        })}
        <TypingDots />
      </div>

      {/* 👇 Bottom Observer for scroll-to-bottom visibility */}
      <div ref={bottomObserverRef} className="h-1 w-full" />

      {/* ⬇️ Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          className="absolute bottom-24 right-1/2 -translate-x-1/2  bg-primary/85 text-white px-4 py-2 rounded-full shadow-lg transition hover:bg-primary/90"
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
              setShowScrollToBottom(false);
              setHasNewMessageInBottom(false);
            }
          }}
        >
          <ArrowDown />
          {hasNewMessageInBottom && (
            <div className="w-3 h-3 bg-orange-300 absolute right-0 bottom-0 rounded-full" />
          )}
        </button>
      )}
    </div>
  );
};

export default ChatMessagesList;
