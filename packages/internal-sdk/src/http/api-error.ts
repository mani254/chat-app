import type { ApiErrorResponse } from '@org/shared';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(payload: ApiErrorResponse) {
    super(payload.error || 'An unexpected error occurred');
    this.name = 'ApiError';
    this.statusCode = payload.statusCode || 500;
    this.code = payload.code;
  }
}
