# `@org/shared` — Developer Guide (Type Contracts & DTOs)

This package is the **single source of truth** for all TypeScript type definitions, DTOs, and API contracts in your monorepo. It acts as the typed contract layer between your backend services and frontend applications.

---

## 📌 What is this package?

`@org/shared` is a **zero-runtime dependency** TypeScript library. It contains pure interfaces, type aliases, and discriminated unions. When you compile or bundle your applications, `@org/shared` leaves zero runtime footprint while guaranteeing 100% end-to-end type safety.

---

## 🎯 What is its exact use?

Use `@org/shared` whenever a data structure crosses an architectural boundary:

1. **Frontend-to-Backend API Calls**: The Request/Response DTOs defined here are imported by NestJS controllers in `@org/api` for input validation and by TanStack Query hooks in `@org/internal-sdk` for HTTP request/response typing.
2. **Backend-to-Database Input**: The database payload types defined here are imported by `@org/dal` Repositories to enforce strict typing when inserting or updating MongoDB documents.
3. **Common Envelopes**: Shared wrappers like `ApiResponse<T>` and `PaginatedResult<T>` ensure all API responses adhere to a consistent JSON format across your app.

---

## ✍️ What should you write here?

When building a new feature in your project, add the following files to `src/<feature>/`:

- **`*-request-dto.ts`**: Define TypeScript interfaces for payloads sent in POST/PUT/PATCH HTTP requests.
- **`*-response-dto.ts`**: Define TypeScript interfaces for JSON shapes returned by server endpoints.
  > [!IMPORTANT]
  > Always type date fields in Response DTOs as `string` (ISO 8601 strings) because JSON serialization converts dates to strings over the network.
- **`*-db.types.ts`**: Define data structures passed into `@org/dal` repository creation or update methods.
- **`*-types.ts`**: Define domain-specific enums, status flags, or utility types.

### What should you NEVER write here?
- **No Runtime Logic**: Do not add classes with execution logic, API fetch calls, or database connection scripts.
- **No Heavy Dependencies**: Never install Mongoose, Axios, Express, NestJS, or React in this package.

---

## 🏗️ Structure You Should Follow

Organize new features into domain folders under `src/`:

```
packages/shared/src/
├── common/                # System-wide envelopes (ApiResponse, PaginatedResult, PaginationOptions)
├── user/                  # User domain DTOs and DB input contracts
├── <your-new-feature>/    # Add new domain feature folders here
│   ├── <feature>-db.types.ts
│   ├── <feature>-request-dto.ts
│   ├── <feature>-response-dto.ts
│   └── index.ts
└── index.ts               # Always re-export feature modules from the root index
```

---

## 💡 Example Workflow: Adding a New Feature

1. Create a folder: `src/project/`
2. Create `src/project/project-request-dto.ts`:
   ```ts
   export interface CreateProjectRequest {
     title: string;
     description: string;
   }
   ```
3. Export from `src/project/index.ts` and `src/index.ts`.
4. Consume immediately in both `@org/api` and `@org/internal-sdk` without rebuilding!
