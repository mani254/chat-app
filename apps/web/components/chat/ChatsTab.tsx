import { useChatStore } from "@/store/useChatStore";
import { useUserStore } from "@/store/useUserStore";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import ChatsList from "./ChatsList";

const ChatsTab = ({ search }: { search: string | undefined }) => {
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
    debouncedSearch({ search, userId: currentUser._id.toString(), isGroupChat: false });
  }, [search, currentUser, debouncedSearch]);


  const observeSentinel = useCallback(() => {
    const container = scrollRef.current;
    const sentinel = observerRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasMore = chats.length < totalChats;
        if (entry?.isIntersecting && !loadingChats && hasMore) {
          loadChats({ search, userId: currentUser?._id.toString(), isGroupChat: false });
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
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-2 space-y-1"
    >

      <ChatsList chats={chats} search={search || ''} type="chat" />

      <div ref={observerRef} className="h-8 flex justify-center items-center">
        {loadingChats && chats.length > 0 && <LoadMoreLoader />}
      </div>
    </div>
  );
};

export default ChatsTab;
