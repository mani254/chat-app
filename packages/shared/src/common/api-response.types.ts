// ─── API Response Envelope ────────────────────────────────────────────────────

/**
 * Successful API response envelope.
 * Every controller success response is wrapped in this shape.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error API response envelope.
 * Every controller error response is wrapped in this shape.
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  /** Application-level error code (e.g. "USER_NOT_FOUND", "INVALID_CREDENTIALS") */
  code?: string;
  statusCode: number;
}

/**
 * Discriminated union of success and error API responses.
 * Use this type in TanStack Query for full type safety on both paths.
 *
 * @example
 * const response: ApiResponse<UserResponse> = await api.post('/users');
 * if (response.success) {
 *   console.log(response.data.name); // UserResponse
 * } else {
 *   console.log(response.error);     // string
 * }
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
