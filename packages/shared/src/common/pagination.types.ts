// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Options accepted by any paginated query method.
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Generic paginated result wrapper.
 *
 * Used by repositories (e.g. PaginatedResult<MessageEntity>)
 * and by API response types (e.g. PaginatedResult<MessageResponse>).
 *
 * @example
 * async findByChatId(chatId: string): Promise<PaginatedResult<MessageEntity>>
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
