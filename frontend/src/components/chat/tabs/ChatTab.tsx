"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import LoadMoreLoader from "../../loaders/LoadMoreLoader";
import ChatList from "../chats/ChatList";


const ChatsTab = ({ search }: { search: string }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const chats = useChatStore(s => s.chats)
  const loadChats = useChatStore(s => s.loadChats)
  const loadingChats = useChatStore(s => s.loadingChats)
  const totalChats = useChatStore((s) => s.totalChats)
  const currentUser = useUserStore((s) => s.currentUser);
  const debouncedSearch = useRef(
    debounce(
      (params: { search?: string; userId: string, isGroupChat: false }) => {
        loadChats({ ...params, reset: true });
      },
      300
    )
  ).current;

  // Triggers debounced search whenever `search` or `currentUser` changes.
  useEffect(() => {
    if (!currentUser) return;
    debouncedSearch({ search, userId: currentUser._id, isGroupChat: false });
  }, [search, currentUser, debouncedSearch]);


  const observeSentinel = useCallback(() => {
    const container = scrollRef.current;
    const sentinel = observerRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasMore = chats.length < totalChats;
        if (entry.isIntersecting && !loadingChats && hasMore) {
          loadChats({ search, userId: currentUser?._id, isGroupChat: false });
        }
      },
      { root: container, threshold: 1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats.length, totalChats, loadingChats, loadChats, search]);

  useEffect(() => {
    const cleanup = observeSentinel();
    return cleanup;
  }, [observeSentinel]);

  return (
    <ScrollArea ref={scrollRef} className="h-[calc(100dvh-180px)] scrollbar-hidden">
      <ChatList chats={chats} search={search} type="chat" />
      <div ref={observerRef} className="h-8 flex justify-center items-center">
        {loadingChats && chats.length > 0 && <LoadMoreLoader />}
      </div>
    </ScrollArea>
  );
};

export default ChatsTab;
