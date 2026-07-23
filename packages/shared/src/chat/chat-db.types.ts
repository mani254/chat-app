export interface CreateChatInput {
  name?: string;
  description?: string;
  isGroupChat?: boolean;
  userIds: string[];
  groupAdminId?: string;
  avatar?: string;
}

export interface UpdateChatInput {
  name?: string;
  description?: string;
  avatar?: string;
}
