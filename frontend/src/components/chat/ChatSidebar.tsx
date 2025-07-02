"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useChatStore } from "@/src/store/useChatStore";
import { useUIStore } from "@/src/store/useUiStore";
import { useUserStore } from "@/src/store/useUserStore";
import { Chat } from "@/src/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Header from "../Header";

interface GetChatDetailsParams {
  chat: Chat;
  type?: "name" | "avatar";
}

const ChatSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeChat, setActiveChat] = useState<Chat | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const initialFetchDone = useRef(false);

  const { chats, setChats, hasMoreChats } = useChatStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const currentUser = useUserStore((state) => state.currentUser);

  // Update active chat from URL
  useEffect(() => {
    const chatId = searchParams.get("chatId");
    const chat = chats.find((c) => c._id === chatId);
    setActiveChat(chat);
  }, [searchParams, chats]);

  // Main fetch logic with safety
  const fetchChats = useCallback(async () => {
    if (!currentUser || loading || !hasMoreChats) return;

    setLoading(true);
    await setChats({ search, page, limit: 20, userId: currentUser._id });
    setLoading(false);
  }, [search, page, currentUser, setChats, loading, hasMoreChats]);

  // Initial load only once
  useEffect(() => {
    if (!initialFetchDone.current && currentUser) {
      initialFetchDone.current = true;
      fetchChats();
    }
  }, [currentUser, fetchChats]);

  // Pagination observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMoreChats && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [loading, hasMoreChats]
  );

  useEffect(() => {
    const sentinel = observerRef.current;
    const scrollContainer = scrollRef.current;
    if (!sentinel || !scrollContainer) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer,
      threshold: 1.0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    if (page > 1 && currentUser) {
      fetchChats();
    }
  }, [page, currentUser, fetchChats]);

  const setCurrentChat = useCallback(
    (chat: Chat) => {
      if (chat) {
        router.push(`/?chatId=${chat._id}`);
        setActiveChat(chat);
      }
    },
    [router]
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diff < 24
      ? date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getChatDetails = ({ chat, type = "name" }: GetChatDetailsParams) => {
    if (chat.isGroupChat) {
      return type === "avatar" ? chat.avatar : chat.name;
    }
    const other = chat.users.find((u) => u._id !== currentUser?._id);
    return type === "avatar" ? other?.avatar : other?.name;
  };

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-background border-r border-background-accent flex flex-col",
          "lg:relative lg:z-0",
          isSidebarOpen ? "w-80" : "w-0 lg:w-0"
        )}
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-background-accent">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Chats
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="pl-10 bg-background border-background-accent"
              />
            </div>
          </div>

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="p-2">
              {chats.map((chat) => {
                const isActive = activeChat?._id === chat._id;
                const chatName = getChatDetails({ chat, type: "name" });
                const chatImage = getChatDetails({ chat, type: "avatar" });
                const latestMsg = chat.latestMessage;
                const isUnread =
                  currentUser &&
                  latestMsg &&
                  !latestMsg.readBy.includes(currentUser._id);

                return (
                  <motion.div
                    key={chat._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full p-3 h-auto justify-start text-left hover:bg-background-accent rounded-lg mb-1 cursor-pointer",
                        isActive && "bg-primary-accent"
                      )}
                      onClick={() => {
                        setCurrentChat(chat);
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={chatImage} />
                            <AvatarFallback>
                              {chatName?.charAt(0).toUpperCase() || "UN"}
                            </AvatarFallback>
                          </Avatar>
                          {!chat.isGroupChat && (
                            <div className="absolute -bottom-1 -right-1 w-[14px] h-[14px] bg-green-500 rounded-full " />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={cn(
                                "font-medium text-sm truncate",
                                isActive ? "text-primary" : "text-foreground"
                              )}
                            >
                              {chatName}
                            </h3>
                            {latestMsg && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {formatTime(latestMsg.createdAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p
                              className={cn(
                                "text-xs truncate",
                                isUnread
                                  ? "text-gray-900 dark:text-white font-medium"
                                  : "text-gray-500 dark:text-gray-400"
                              )}
                            >
                              {latestMsg?.content}
                            </p>
                            {isUnread && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}

              {chats.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations found</p>
                  {search && (
                    <p className="text-sm mt-2">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
            {hasMoreChats && (
              <div ref={observerRef} className="h-8 flex justify-center items-center">
                {loading && (
                  <span className="text-xs text-gray-400">Loading more...</span>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </motion.aside>
    </>
  );
};

export default ChatSidebar;
