# `@org/internal-sdk` — Developer Guide (Frontend SDK & Query Hooks)

This package is the **client-side TypeScript SDK and state management library** for your frontend web application (`@org/web`). It encapsulates REST API communication, authentication state, and **TanStack Query** hooks.

---

## 📌 What is this package?

`@org/internal-sdk` is an intermediary library between your React frontend and your backend REST server. Instead of writing ad-hoc `fetch` or `axios` calls inside your React page components, you write custom **TanStack Query hooks** in this package and import them cleanly into your pages.

---

## 🎯 What is its exact use?

Use `@org/internal-sdk` to decouple API communication and server-state caching from your visual UI:

1. **Centralized HTTP Client**: Manages base URLs, credentials, authentication headers, and standardized API error handling in one place (`src/http/api-client.ts`).
2. **Re-usable Query & Mutation Hooks**: Provides React Query hooks (like `useLogin`, `useCurrentUser`, or your custom domain hooks) that handle caching, retries, and loading states automatically.
3. **Session Context & Route Guards**: Houses `<AuthProvider />`, `useAuth()`, and declarative route guards (`<ProtectedRoute />`, `<GuestRoute />`).

---

## ✍️ What should you write here?

When adding a new frontend feature that communicates with the backend, add your code to `src/<feature>/`:

- **`api/<feature>.api.ts`**: Write raw async helper functions that invoke `apiClient.get()`, `apiClient.post()`, etc., using Request/Response DTOs imported from `@org/shared`.
- **`hooks/use-<action>.ts`**: Write custom TanStack Query `useQuery` or `useMutation` hooks that wrap your API helper functions.
- **`context/` or `providers/`**: Write global React Context providers if your feature requires shared client-side state across routes.

### What should you NEVER write here?
- **No Visual UI Components**: Do not write buttons, form cards, modals, or Tailwind CSS styling here. (Put visual primitives in `@org/ui` and pages in `@org/web`).
- **No Database Logic**: Never import `@org/dal` or Mongoose in this package.
- **No Route Guards**: Do not write `<ProtectedRoute />` or `<GuestRoute />` here. Route guard behavior is application-specific — it depends on which router you use and where you redirect. The SDK provides `useAuth()` and `isAuthenticated` state. Your app (`@org/web`) uses that to write its own guards.

> [!IMPORTANT]
> `useAuth()` is the correct public API for routing decisions. Your app reads `isAuthenticated` from `useAuth()` and implements its own `<ProtectedRoute />` and `<GuestRoute />` inside `apps/web/src/components/`.

---

## 🏗️ Structure You Should Follow

```
packages/internal-sdk/src/
├── http/                  # Centralized Axios client & error wrapper (api-client.ts, api-error.ts)
├── providers/             # SdkProvider (QueryClientProvider + AuthProvider wrapper)
├── auth/                  # Authentication context, API calls & hooks
│   ├── api/
│   │   └── auth.api.ts
│   ├── context/
│   │   └── auth-provider.tsx
│   └── hooks/
│       ├── use-auth.ts
│       ├── use-current-user.ts
│       ├── use-login.ts
│       └── ...
├── <your-new-feature>/    # Add new domain API wrappers and hooks here
│   ├── api/
│   │   └── <feature>.api.ts
│   ├── hooks/
│   │   ├── use-get-<feature>.ts
│   │   └── use-create-<feature>.ts
│   └── index.ts
└── index.ts               # Root public entry point
```

---

## 💡 Example Workflow: Adding a New Query Hook

1. Create `src/project/api/project.api.ts`:
   ```ts
   import { apiClient } from '../../http/api-client';
   import type { CreateProjectRequest, ProjectResponse } from '@org/shared';

   export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
     const res = await apiClient.post<ProjectResponse>('/api/projects', data);
     return res.data;
   }
   ```
2. Create `src/project/hooks/use-create-project.ts`:
   ```ts
   import { useMutation, useQueryClient } from '@tanstack/react-query';
   import { createProject } from '../api/project.api';

   export function useCreateProject() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: createProject,
       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
     });
   }
   ```
3. Export from `src/index.ts` and call `const { mutate } = useCreateProject();` directly inside `@org/web`!
