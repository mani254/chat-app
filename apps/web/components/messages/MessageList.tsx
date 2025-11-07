import { useMessageStore } from "@/store/useMessageStore";
import { PopulatedChatDocument } from "@workspace/database";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import MessageBubble from "./MessageBubble";
import TypingDots from "./TypingDots";

interface MessageListProps {
  activeChat: PopulatedChatDocument;
  loading: boolean;
  onLoadMore: () => void;
}


const MessageList = ({ activeChat, loading, onLoadMore }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const topObserverRef = useRef<HTMLDivElement | null>(null);
  const bottomObserverRef = useRef<HTMLDivElement | null>(null);

  const messages = useMessageStore((s) => s.messages);
  const totalMessages = useMessageStore((s) => s.totalMessages);

  const hasMoreMessages = useMemo(
    () => messages.length < totalMessages,
    [messages, totalMessages]
  );

  // --- Scroll Behavior State ---
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isTopVisible, setIsTopVisible] = useState(false);
  const [isBottomVisible, setIsBottomVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // --- Scroll to Bottom ---
  const scrollToBottom = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.scrollTop = scroll.scrollHeight;
  }, []);

  // --- Detect user scroll position ---
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    const onScroll = () => {
      const distanceFromBottom =
        scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight;

      setIsNearBottom(distanceFromBottom < 80);
      setShowScrollButton(distanceFromBottom > 300);
    };

    scroll.addEventListener("scroll", onScroll);
    onScroll(); // run once
    return () => scroll.removeEventListener("scroll", onScroll);
  }, []);

  // --- Intersection Observer (Top - Load More) ---
  useEffect(() => {
    if (!topObserverRef.current) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry) return;

        setIsTopVisible(entry.isIntersecting);

        if (entry.isIntersecting && !loading && hasMoreMessages) {
          const scroll = scrollRef.current;
          if (!scroll) return;

          const prevHeight = scroll.scrollHeight;

          onLoadMore();

          // preserve scroll position after older messages load
          requestAnimationFrame(() => {
            const newHeight = scroll.scrollHeight;
            scroll.scrollTop = newHeight - prevHeight + scroll.scrollTop;
          });
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [loading, hasMoreMessages, onLoadMore]);

  // --- Intersection Observer (Bottom - Detect if user is at bottom) ---
  useEffect(() => {
    if (!bottomObserverRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setIsBottomVisible(entry.isIntersecting);
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(bottomObserverRef.current);
    return () => observer.disconnect();
  }, []);

  // --- Auto Scroll on New Messages ---
  useEffect(() => {
    // If both observers visible → messages don't exceed container → do nothing
    if (isTopVisible && isBottomVisible) return;

    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages.length, isNearBottom, isTopVisible, isBottomVisible, scrollToBottom]);


  return (
    <div className="relative h-full flex-1 overflow-y-auto px-3 scrollbar-custom bg-background-accent/40" ref={scrollRef}>
      {/* TOP OBSERVER (Load More Trigger) */}
      <div ref={topObserverRef} className="min-h-6 flex justify-center items-center">
        {loading && <LoadMoreLoader />}
      </div>

      {/* Messages list */}
      <ul className="flex flex-col gap-3">
        {messages.map((m) => (
          <MessageBubble
            key={m._id.toString()}
            message={m}
          />
        ))}
        <li>
          <TypingDots />
        </li>
      </ul>

      {/* BOTTOM OBSERVER (Bottom Detection) */}
      <div ref={bottomObserverRef} className="h-2" />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-4 right-4 bg-primary text-white text-sm px-3 py-1 rounded-full shadow"
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default MessageList;
