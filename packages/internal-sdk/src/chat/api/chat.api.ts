import { getApiClient } from '../../http/api-client';
import type {
  ChatListResponse,
  ChatResponse,
  CreateChatRequest,
  GetChatsQuery,
  UpdateGroupChatRequest,
} from '@org/shared';

export async function fetchChatsApi(params?: GetChatsQuery): Promise<ChatListResponse> {
  const client = getApiClient();
  const response = await client.get<unknown, ChatListResponse>('/chats', { params });
  return response;
}

export async function fetchChatByIdApi(chatId: string): Promise<ChatResponse> {
  const client = getApiClient();
  const response = await client.get<unknown, ChatResponse>(`/chats/${chatId}`);
  return response;
}

export async function createChatApi(payload: CreateChatRequest): Promise<ChatResponse> {
  const client = getApiClient();
  const response = await client.post<unknown, ChatResponse>('/chats', payload);
  return response;
}

export async function updateGroupChatApi(
  chatId: string,
  payload: UpdateGroupChatRequest,
): Promise<ChatResponse> {
  const client = getApiClient();
  const response = await client.patch<unknown, ChatResponse>(`/chats/${chatId}`, payload);
  return response;
}

export async function deleteChatApi(chatId: string): Promise<void> {
  const client = getApiClient();
  await client.delete(`/chats/${chatId}`);
}

export async function addGroupMemberApi(chatId: string, userId: string): Promise<ChatResponse> {
  const client = getApiClient();
  const response = await client.post<unknown, ChatResponse>(`/chats/${chatId}/members`, { userId });
  return response;
}

export async function removeGroupMemberApi(chatId: string, userId: string): Promise<ChatResponse> {
  const client = getApiClient();
  const response = await client.delete<unknown, ChatResponse>(`/chats/${chatId}/members/${userId}`);
  return response;
}
