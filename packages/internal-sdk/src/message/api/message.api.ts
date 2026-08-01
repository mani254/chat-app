import { getApiClient } from '../../http/api-client';
import type {
  MessageListResponse,
  MessageResponse,
  SendMessageRequest,
  UploadResponse,
} from '@org/shared';

export async function fetchMessagesApi(
  chatId: string,
  params?: { cursor?: string; limit?: number },
): Promise<MessageListResponse> {
  const client = getApiClient();
  const response = await client.get<unknown, MessageListResponse>(`/messages/${chatId}`, {
    params,
  });
  return response;
}

export async function sendMessageApi(payload: SendMessageRequest): Promise<MessageResponse> {
  const client = getApiClient();
  const response = await client.post<unknown, MessageResponse>('/messages', payload);
  return response;
}

export async function markAllMessagesReadApi(chatId: string): Promise<void> {
  const client = getApiClient();
  await client.patch(`/messages/${chatId}/read`);
}

export async function deleteMessageApi(messageId: string): Promise<void> {
  const client = getApiClient();
  await client.delete(`/messages/${messageId}`);
}

export async function uploadMediaFilesApi(formData: FormData): Promise<UploadResponse> {
  const client = getApiClient();
  const response = await client.post<unknown, UploadResponse>('/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
}
