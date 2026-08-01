import type {
  ChatListResponse,
  ChatResponse,
  CreateChatRequest,
} from '@org/shared';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createChatApi,
  fetchChatByIdApi,
  fetchChatsApi,
} from '../api/chat.api';

export const CHAT_KEYS = {
  all: ['chats'] as const,
  lists: () => [...CHAT_KEYS.all, 'list'] as const,
  list: (type?: string, search?: string) =>
    [...CHAT_KEYS.lists(), { type, search }] as const,
  details: () => [...CHAT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CHAT_KEYS.details(), id] as const,
};

export function useInfiniteChatsQuery(
  type: 'all' | 'group' | 'direct' = 'all',
  search?: string,
) {
  const trimmedSearch = search?.trim() || undefined;

  return useInfiniteQuery<ChatListResponse>({
    queryKey: CHAT_KEYS.list(type, trimmedSearch),
    queryFn: ({ pageParam }) =>
      fetchChatsApi({
        type,
        cursor: pageParam as string | undefined,
        limit: 10,
        search: trimmedSearch,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useChatDetailsQuery(chatId: string | null | undefined) {
  return useQuery<ChatResponse>({
    queryKey: CHAT_KEYS.detail(chatId ?? ''),
    queryFn: () => fetchChatByIdApi(chatId!),
    enabled: Boolean(chatId && /^[a-fA-F0-9]{24}$/.test(chatId)),
  });
}

export function useCreateChatMutation() {
  const queryClient = useQueryClient();
  return useMutation<ChatResponse, Error, CreateChatRequest>({
    mutationFn: (payload) => createChatApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
    },
  });
}
