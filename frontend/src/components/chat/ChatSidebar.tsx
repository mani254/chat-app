"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/src/store/useChatStore";
import { useUserStore } from "@/src/store/useUserStore";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import ChatListItem from "./ChatList";
import NoChatsFound from "./NoChatsFound";

const ChatListSidebar = () => {
  const [search, setSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const chats = useChatStore(s => s.chats)
  const loadChats = useChatStore(s => s.loadChats)
  const loadingChats = useChatStore(s => s.loadingChats)
  const totalChats = useChatStore((s) => s.totalChats)
  const currentUser = useUserStore((s) => s.currentUser);
  const activeChat = useChatStore((s) => s.activeChat)
  const debouncedSearch = useRef(
    debounce(
      (params: { search?: string; userId: string }) => {
        loadChats({ ...params, reset: true });
      },
      300
    )
  ).current;

  useEffect(() => {
    if (!currentUser) return;
    debouncedSearch({ search, userId: currentUser._id });
  }, [search, currentUser, debouncedSearch]);

  // Infinite scroll observer
  const observeSentinel = useCallback(() => {
    const container = scrollRef.current;
    const sentinel = observerRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasMore = chats.length < totalChats;
        if (entry.isIntersecting && !loadingChats && hasMore) {
          loadChats({ search, userId: currentUser?._id });
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
    <div className="w-[350px] lg:w-1/3 max-w-[300px] border border-background-accent h-full relative overflow-hidden py-3">
      {/* Search Bar */}
      <div className="mb-3 px-2 sticky top-0">
        <Input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-2 rounded-lg border bg-background-accent border-foreground-accent/50 text-sm",
            loadingChats && "pr-10"
          )}
          style={{ minHeight: 38 }}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className={cn("w-4 h-4", loadingChats && "animate-spin")} />
        </span>
      </div>

      {/* Chat List Scrollable */}
      <ScrollArea ref={scrollRef} className="h-full scrollbar-hidden">
        <div className="space-y-1">
          {loadingChats && chats.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg bg-background-accent" />
            ))
          ) : chats.length === 0 ? (
            <NoChatsFound search={search} />
          ) : (
            chats.map((chat) => {
              const isChatActive = activeChat?._id === chat._id

              const haveUnreadMessages =
                !!chat.latestMessage &&
                Array.isArray(chat.latestMessage.readBy) &&
                !chat.latestMessage.readBy.includes(currentUser?._id || "");

              return (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  currentUserId={currentUser?._id}
                  isChatActive={isChatActive}
                  haveUnreadMessages={haveUnreadMessages}
                />
              )
            }
            )
          )}
          <div ref={observerRef} className="h-8 flex justify-center items-center">
            {loadingChats && chats.length > 0 && (
              <LoadMoreLoader />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatListSidebar;
