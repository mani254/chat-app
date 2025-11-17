## Goals
- Move chat UI from `app/page.tsx` to `/chat` while keeping behavior and appearance identical.
- Introduce `app/chat/layout.tsx`, `app/chat/page.tsx`, and `app/chat/[chatId]/page.tsx`.
- Reuse `components/chat/ChatWindow.tsx` unchanged.
- Preserve state management, providers, styling, and desktop/mobile interactions.

## Folder & Files
1. Add `apps/web/app/chat/layout.tsx` (client):
- Wrap children with `ProtectedRoute` and `SocketProvider`.
- Keep theme behavior by setting `document.body.className` from `useUIStore().theme`.
- Render the common frame: `div.h-dvh.flex.overflow-hidden` with `ChatSidebar` on the left and `{children}` on the right.
- Include the floating `CreateChatButton` with the same `cn(...)` visibility rule using `useChatStore().activeChat`.

2. Add `apps/web/app/chat/page.tsx` (client):
- Render `<ChatWindow />` as the main content, leveraging the shared layout for sidebar and button.

3. Add `apps/web/app/chat/[chatId]/page.tsx` (client):
- Read `params.chatId`.
- Ensure `?chatId=<id>` is present by calling `router.replace(`${pathname}?chatId=${params.chatId}`)` when missing, so `ChatWindow` can continue to read `useSearchParams('chatId')` unchanged.
- Render `<ChatWindow />`.

4. Update `apps/web/app/page.tsx`:
- Replace current chat implementation with a lightweight redirect to `/chat` to move chat-related routes under `/chat` without changing user experience. Server-side `redirect('/chat')` or client `router.replace('/chat')` is acceptable; prefer server `redirect` to avoid a flash.

## Routing & Behavior
- Primary chat route becomes `/chat`.
- Individual conversation route becomes `/chat/[chatId]`, which transparently sets the `?chatId` query param for existing logic.
- 404/not-found behavior remains unchanged (no custom `not-found.tsx` present).

## Feature Parity
- No changes to `ChatWindow`.
- Providers, stores, hooks, and utilities remain identical: `ProtectedRoute`, `SocketProvider`, `useChatStore`, `useMessageStore`, `useUIStore`, `useUserStore`, `useSocketContext`, `useMediaQuery`, etc.
- Styling remains Tailwind-based; class names and structure mirror the original page.
- Mobile/desktop handling preserved via `ChatWindow` and the unchanged sidebar toggle logic.

## Validation
- Unit/E2E tests: No assertions should require changes; visiting `/` redirects to `/chat` and renders the same UI.
- Manual QA: Verify
  - `/chat` shows sidebar + window + floating button identical to root.
  - `/chat/[id]` loads the same view and joins the correct socket room (query param ensured).
  - Theme switching applies to `document.body` exactly as before.
  - Performance and interactions (typing indicator, latest message, message list pagination) remain unchanged.

## Rollout Steps
1. Implement the three new files and update `app/page.tsx` to redirect.
2. Run tests and manual checks described above.
3. If anything diverges, adjust only the routing glue (never `ChatWindow`).