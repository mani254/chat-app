import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  MessageListResponse,
  MessageResponse,
  SendMessageRequest,
} from '@org/shared';
import {
  fetchMessagesApi,
  markAllMessagesReadApi,
  sendMessageApi,
} from '../api/message.api';
import { CHAT_KEYS } from '../../chat/hooks/use-chats';

export const MESSAGE_KEYS = {
  all: ['messages'] as const,
  list: (chatId: string) => [...MESSAGE_KEYS.all, chatId] as const,
};

export function useInfiniteMessagesQuery(chatId: string | null | undefined) {
  return useInfiniteQuery<MessageListResponse>({
    queryKey: MESSAGE_KEYS.list(chatId ?? ''),
    queryFn: ({ pageParam }) =>
      fetchMessagesApi(chatId!, {
        cursor: pageParam as string | undefined,
        limit: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(chatId && /^[a-fA-F0-9]{24}$/.test(chatId)),
  });
}

export function useSendMessageMutation(chatId: string) {
  const queryClient = useQueryClient();
  return useMutation<MessageResponse, Error, SendMessageRequest>({
    mutationFn: (payload) => sendMessageApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.list(chatId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
    },
  });
}

export function useMarkReadMutation(chatId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => markAllMessagesReadApi(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
    },
  });
}
