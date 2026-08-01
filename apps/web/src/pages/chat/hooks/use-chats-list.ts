import {
  CHAT_KEYS,
  fetchChatByIdApi,
  useCurrentUser,
  useInfiniteChatsQuery,
  useSocket,
} from '@org/internal-sdk';
import type { ChatResponse, MessageResponse } from '@org/shared';
import { WS_EVENTS } from '@org/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../../../hooks/use-debounce';

export type ChatTabType = 'all' | 'group' | 'direct';

/**
 * Helper to check if a chat matches the current active tab and database search string.
 */
function doesChatMatchFilter(
  chat: ChatResponse,
  tab: ChatTabType,
  search: string,
  currentUserId?: string,
): boolean {
  // 1. Tab filter
  if (tab === 'group' && !chat.isGroupChat) return false;
  if (tab === 'direct' && chat.isGroupChat) return false;

  // 2. Search query filter
  const searchTrimmed = search.trim().toLowerCase();
  if (!searchTrimmed) return true;

  if (chat.isGroupChat) {
    const nameMatch = chat.name?.toLowerCase().includes(searchTrimmed);
    const descMatch = chat.description?.toLowerCase().includes(searchTrimmed);
    return Boolean(nameMatch || descMatch);
  } else {
    const recipient = chat.users?.find((u) => u._id !== currentUserId) || chat.users?.[0];
    if (!recipient) return false;
    const nameMatch = recipient.name?.toLowerCase().includes(searchTrimmed);
    const emailMatch = recipient.email?.toLowerCase().includes(searchTrimmed);
    return Boolean(nameMatch || emailMatch);
  }
}

export function useChatsList(activeChatId?: string | null) {
  const [tab, setTab] = useState<ChatTabType>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: currentUser } = useCurrentUser();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  // Infinite query for chats
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteChatsQuery(tab, debouncedSearch);

  // Local state for dynamically re-ordered chats
  const [chats, setChats] = useState<ChatResponse[]>([]);

  // Sync fetched infinite query pages to local chats state
  useEffect(() => {
    if (!data?.pages) return;
    const fetchedChats = data.pages.flatMap((page) => page.items);
    setChats(fetchedChats.map((c) => (c._id === activeChatId ? { ...c, unreadCount: 0 } : c)));
  }, [data, activeChatId]);

  // Immediately clear unread count when activeChatId changes
  useEffect(() => {
    if (!activeChatId) return;
    setChats((prevChats) =>
      prevChats.map((c) => (c._id === activeChatId ? { ...c, unreadCount: 0 } : c)),
    );
  }, [activeChatId]);

  // Real-time socket listener for new messages (bumping active chat to top & sound)
  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    const handleNewMessage = async (msg: MessageResponse) => {
      if (!msg.chatId) return;

      console.log('new message came =', msg);

      // 1. Invalidate TanStack Query's chat list cache so background queries stay synchronized
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });

      // 2. Play arrival sound effect if sent by someone else
      if (msg.sender?._id !== currentUser._id) {
        try {
          const audio = new Audio('/sounds/message-arrived-sound-effect.mp3');
          audio.play().catch(() => { });
        } catch {
          // ignore audio autoplay policy errors
        }
      }

      // 3. Immediately bump/update local chats state respecting active search & tab filters
      setChats((prevChats) => {
        const existingIndex = prevChats.findIndex((c) => c._id === msg.chatId);

        if (existingIndex !== -1) {
          const currentChat = prevChats[existingIndex];
          const isCurrentActive = activeChatId === msg.chatId;

          const updatedChat: ChatResponse = {
            ...currentChat,
            latestMessage: {
              _id: msg._id,
              content: msg.content,
              messageType: msg.messageType,
              sender: msg.sender,
              createdAt: msg.createdAt,
            },
            updatedAt: new Date().toISOString(),
            unreadCount: isCurrentActive
              ? 0
              : (currentChat.unreadCount || 0) + (msg.sender?._id !== currentUser._id ? 1 : 0),
          };

          const matchesFilter = doesChatMatchFilter(
            updatedChat,
            tab,
            debouncedSearch,
            currentUser._id,
          );

          if (!matchesFilter) {
            return prevChats.filter((c) => c._id !== msg.chatId);
          }

          return [
            updatedChat,
            ...prevChats.slice(0, existingIndex),
            ...prevChats.slice(existingIndex + 1),
          ];
        }

        // Chat is not yet in current loaded pages list: fetch chat and check filter
        fetchChatByIdApi(msg.chatId)
          .then((fetchedChat) => {
            if (!fetchedChat) return;

            const matchesFilter = doesChatMatchFilter(
              fetchedChat,
              tab,
              debouncedSearch,
              currentUser._id,
            );
            if (!matchesFilter) return;

            setChats((currentPrev) => {
              if (currentPrev.some((c) => c._id === fetchedChat._id)) return currentPrev;
              return [fetchedChat, ...currentPrev];
            });
          })
          .catch(() => { });

        return prevChats;
      });
    };

    socket.on(WS_EVENTS.MESSAGE_NEW, handleNewMessage);
    return () => {
      socket.off(WS_EVENTS.MESSAGE_NEW, handleNewMessage);
    };
  }, [socket, currentUser?._id, activeChatId, tab, debouncedSearch, queryClient]);

  // IntersectionObserver Sentinel for Infinite Scroll
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const observeSentinel = useCallback(() => {
    const container = scrollRef.current;
    const sentinel = observerRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const cleanup = observeSentinel();
    return cleanup;
  }, [observeSentinel]);

  return {
    tab,
    setTab,
    search,
    setSearch,
    chats,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    scrollRef,
    observerRef,
  };
}
