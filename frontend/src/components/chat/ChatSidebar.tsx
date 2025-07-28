"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/src/store/useChatStore";
import { useUIStore } from "@/src/store/useUiStore";
import { useUserStore } from "@/src/store/useUserStore";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../Header";
import LoadMoreLoader from "../loaders/LoadMoreLoader";
import ChatListItem from "./ChatList";
import NoChatsFound from "./NoChatsFound";

const ChatListSidebar = () => {
  const [search, setSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const { isSidebarOpen, toggleSidebar } = useUIStore();

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

  // Triggers debounced search whenever `search` or `currentUser` changes.
  useEffect(() => {
    if (!currentUser) return;
    debouncedSearch({ search, userId: currentUser._id });
  }, [search, currentUser, debouncedSearch]);

  // Closes sidebar on window resize if width < 768 and sidebar is open.
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth < 768 && isSidebarOpen) {
  //       // toggleSidebar(false);
  //     }
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Closes sidebar when clicking outside of it on small screens.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth >= 768) return;

      if (
        isSidebarOpen &&
        scrollRef.current &&
        !scrollRef.current.contains(e.target as Node)
      ) {
        toggleSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sets up observer to trigger loading chats when sentinel is in view.
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

  // Calls observer setup function and ensures cleanup on re-renders.
  useEffect(() => {
    const cleanup = observeSentinel();
    return cleanup;
  }, [observeSentinel]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed md:static bg-background border-r border-background-accent h-full overflow-hidden",
            "w-[300px] md:w-1/3 max-w-[340px] h-full py-3",
            "md:translate-x-0 md:opacity-100",
            "shadow-lg md:shadow-none"
          )}
        >
          <div className="sticky top-0 z-10 bg-background py-1">
            <Header />

            {/* Search Bar */}
            <div className="my-3 px-2   ">
              <div className="relative">
                <Input
                  placeholder="Search chats..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-full border border-foreground-accent/50 text-sm",
                    loadingChats && "pr-10",

                  )}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className={cn("w-4 h-4", loadingChats && "animate-spin")} />
                </span>
              </div>
            </div>
          </div>


          {/* Chat List Scrollable */}
          <ScrollArea ref={scrollRef} className="h-full pb-[100px] scrollbar-hidden">
            <div className="space-y-1">
              {loadingChats && chats.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg bg-background-accent" />
                ))
              ) : chats.length === 0 ? (
                <NoChatsFound search={search} />
              ) : (
                chats.map((chat) => {
                  const isChatActive = activeChat?._id === chat._id;

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
                  );
                })
              )}
              <div ref={observerRef} className="h-8 flex justify-center items-center">
                {loadingChats && chats.length > 0 && <LoadMoreLoader />}
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatListSidebar;
