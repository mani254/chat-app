import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useUIStore } from "../store/useUiStore";
import { useUserStore } from '../store/useUserStore';
import { Chat } from '../types';

const ChatSidebar = () => {

  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeChat, setActiveChat] = useState<Chat>();

  const { chats, messages } = useChatStore();
  const { users, currentUser } = useUserStore()

  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setActiveChat(chat);
    } else {
      setActiveChat(chat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const setCurrentChat = useCallback((chat: Chat) => {
    if (chat) {
      router.push(`/?chatId=${chat._id}`);
      setActiveChat(chat);
    }
  }, [router, setActiveChat]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      if (!searchQuery) return chats;

      if (chat.isGroupChat) {
        return chat.name?.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        const otherUser = users.find(
          (u) => chat.users.includes(u._id) && u._id !== currentUser?._id
        );
        return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });
  }, [chats, users, currentUser, searchQuery]);

  const getChatName = (chat: Chat) => {
    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    }
    const otherUser = users.find(u =>
      chat.users.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.isGroupChat) {
      return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=40&h=40&fit=crop&crop=face';
    }
    const otherUser = users.find(u =>
      chat.users.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.avatar;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-background border-r border-background-accent flex flex-col",
          "lg:relative lg:z-0",
          isSidebarOpen ? "w-80" : "w-0 lg:w-0"
        )}
        initial={false}
        animate={{
          width: isSidebarOpen ? 320 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-background-accent">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-background-accent"
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredChats.map((chat) => {
                const isActive = activeChat?._id === chat._id;
                const chatMessages = messages[chat._id] || [];
                const latestMsg = chatMessages.find(m => m._id === chat.latestMessage);
                const isUnread = latestMsg && !latestMsg.readBy.includes(currentUser?._id || '');

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
                        if (window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={getChatAvatar(chat)} />
                            <AvatarFallback>
                              {getChatName(chat).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {!chat.isGroupChat && (
                            <div className="absolute -bottom-1 -right-1 w-[14px] h-[14px] bg-green-500 rounded-full " />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={cn(
                              "font-medium text-sm truncate",
                              isActive ? "text-primary" : "text-foreground"
                            )}>
                              {getChatName(chat)}
                            </h3>
                            {latestMsg && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {formatTime(latestMsg.createdAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-xs truncate",
                              isUnread
                                ? "text-gray-900 dark:text-white font-medium"
                                : "text-gray-500 dark:text-gray-400"
                            )}>
                              {chat?.latestMessage}
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

              {filteredChats.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations found</p>
                  {searchQuery && (
                    <p className="text-sm mt-2">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.aside>
    </>
  )
};

export default ChatSidebar;