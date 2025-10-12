"use client";

import { useMessageStore } from "@/src/store/useMessageStore";
import { Chat, User } from "@/src/types";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import { MediaSkeleton } from "./messages/MediaSkeleton";
import ChatMessageBubble from "./messages/MessageBubble";
import TypingDots from "./messages/TypingDots";

interface ChatMessagesListProps {
  currentUser: User | null;
  activeChat: Chat;
  loading: boolean;
  onLoadMore: () => void;
  sendingMedia: boolean;
}

const ChatMessagesList = ({
  currentUser,
  activeChat,
  loading,
  onLoadMore,
  sendingMedia,
}: ChatMessagesListProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const topObserverRef = useRef<HTMLDivElement | null>(null); // for load more
  const previousScrollHeight = useRef<number>(0);
  const loadingMore = useRef<boolean>(false);

  const messages = useMessageStore((s) => s.messages);
  const totalMessages = useMessageStore((s) => s.totalMessages);
  const hasMoreMessages = useMemo(() => messages.length < totalMessages, [messages, totalMessages])


  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasNewMessageInBottom, setHasNewMessageInBottom] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // 🧭 Infinite Scroll Observer (TOP)
  const setupTopObserver = useCallback(() => {
    const scrollEl = scrollRef.current;
    const sentinel = topObserverRef.current;
    if (!scrollEl || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // if (entry.isIntersecting && !loading && hasMoreMessages) {
        //   onLoadMore();
        // }
        if (entry.isIntersecting && !loading && hasMoreMessages) {
          previousScrollHeight.current = scrollEl.scrollHeight;
          loadingMore.current = true;
          onLoadMore();
        }
      },
      { root: scrollEl, threshold: 1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMoreMessages, onLoadMore]);

  // 📏 Scroll position detection for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Calculate distance from bottom
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Show scroll-to-bottom button if user has scrolled up more than 600px from bottom
    const shouldShowButton = distanceFromBottom > 600;
    setShowScrollToBottom(shouldShowButton);
    setIsUserScrolledUp(shouldShowButton);
  }, []);

  // Setup scroll listener and top observer
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const cleanupTop = setupTopObserver();

    // Add scroll event listener
    container.addEventListener('scroll', handleScroll);

    return () => {
      if (cleanupTop) cleanupTop();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [setupTopObserver, handleScroll]);

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

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !loadingMore.current) return;

    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      const diff = newScrollHeight - previousScrollHeight.current;

      container.scrollTop += diff; 
      loadingMore.current = false;
    });
  }, [messages]);

  // 🔽 When new message arrives, handle auto-scroll behavior
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;

    if (!isUserScrolledUp) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
        setHasNewMessageInBottom(false);
      });
    } else {
      setHasNewMessageInBottom(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <div className="px-4 pb-[110px] overflow-y-auto h-full scrollbar-custom" ref={scrollRef}>
      {/* 🔼 Top Observer (for infinite scroll) */}

      <div ref={topObserverRef} className="h-8 flex justify-center items-center ">
        {loading && <LoadMoreLoader />}
      </div>

      {/* 💬 Chat Messages */}
      <div className="space-y-3 md:space-y-4">
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
        {sendingMedia && (
          <div className="flex justify-end">
            <div className="bg-background-accent/50 border border-border rounded-2xl px-4 py-2 max-w-[80%]">
              <MediaSkeleton count={1} />
            </div>
          </div>
        )}
      </div>


      {/* ⬇️ Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          className="absolute bottom-[120px] left-1/2 -translate-x-1/2 bg-primary text-white px-3.5 py-2 rounded-full shadow-md hover:shadow-lg transition-colors hover:bg-primary/90"
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
              // Reset states after scrolling to bottom
              setTimeout(() => {
                setShowScrollToBottom(false);
                setIsUserScrolledUp(false);
                setHasNewMessageInBottom(false);
              }, 300); 
            }
          }}
        >
          <ArrowDown />
          {hasNewMessageInBottom && (
            <div className="w-3 h-3 bg-primary/70 absolute right-0 bottom-0 rounded-full ring-2 ring-background" />
          )}
        </button>
      )}
    </div>
  );
};

export default ChatMessagesList;
