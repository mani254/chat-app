export interface CreateMessageInput {
  chatId: string;
  senderId: string;
  content: string;
  messageType?: 'text' | 'media' | 'note';
  mediaLinks?: string[];
  replyToId?: string;
}
