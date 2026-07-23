# `@org/shared` — Shared Contract Library

The `@org/shared` library is a standalone, **zero-runtime dependency** type contract package. It serves as the single source of truth for TypeScript types shared across the entire stack.

---

## 📌 Purpose & Responsibilities

- **Unified Type Contracts**: Shared between Backend (NestJS Controllers, Services, DAL) and Frontend (TanStack Query, React components).
- **Zero Runtime Dependencies**: Contains pure TypeScript type definitions and interfaces only. Can be safely imported anywhere without pulling in heavy runtime libraries like Mongoose.

---

## 🔑 Key Aspects & Guidelines

### 1. DTO Conventions (Frontend & Controller Integration)

- **Request DTOs (`*-request-dto.ts`)**: Replicates payload structures expected by API Controllers. Used by NestJS validation pipelines and Frontend TanStack Query mutations.
- **Response DTOs (`*-response-dto.ts`)**: Replicates exact API JSON response shapes. Dates are typed as `string` (ISO format) for JSON safety. Used by NestJS Controllers and Frontend TanStack Query queries.

### 2. Database Types (`*-db.types.ts`)

- Defines input payload structures passed into `@org/dal` Repositories (e.g., `CreateUserInput`, `CreateChatInput`, `CreateMessageInput`).

### 3. Common Utilities (`common/`)

- `PaginationOptions`: Standard `page` and `limit` query params.
- `PaginatedResult<T>`: Generic envelope for paginated queries (`items`, `total`, `page`, `limit`, `hasMore`).
- `ApiResponse<T>`: Discriminated union for full type-safety on API success and error responses.

### 4. Export Strategy

- All domain modules export their contents cleanly via `index.ts`.
- Consumers import everything from `@org/shared`:
  ```ts
  import type {
    CreateChatRequest,
    ChatResponse,
    ApiResponse,
  } from '@org/shared';
  ```

---

## 📂 Folder Structure

```
packages/shared/src/
├── common/
│   ├── pagination.types.ts   # PaginationOptions & PaginatedResult<T>
│   ├── api-response.types.ts # ApiResponse<T>, ApiSuccessResponse, ApiErrorResponse
│   └── index.ts
├── user/
│   ├── user-db.types.ts      # Repository payload types
│   ├── user-request-dto.ts   # Controller request DTOs
│   ├── user-response-dto.ts  # Controller response DTOs
│   └── index.ts
├── chat/
│   ├── chat-db.types.ts
│   ├── chat-request-dto.ts
│   ├── chat-response-dto.ts
│   └── index.ts
├── message/
│   ├── message-db.types.ts
│   ├── message-request-dto.ts
│   ├── message-response-dto.ts
│   └── index.ts
└── index.ts                   # Root public entry point
```
