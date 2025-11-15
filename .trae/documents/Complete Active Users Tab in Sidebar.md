## Overview
Implement the "Active Users" tab using the existing `useUserStore` state (`activeUsers`) and action (`setActiveUsers`). Create a reusable tab component that renders the active users list, supports filtering via the sidebar search input, and plugs into `ChatSidebar` instead of the current placeholder.

## Files To Add/Update
1. Add `apps/web/components/chat/ActiveUsersTab.tsx`
2. Update `apps/web/components/chat/ChatSidebar.tsx` to render `ActiveUsersTab` for the "users" tab

## ActiveUsersTab Implementation
- Props: `{ search?: string }`
- Behavior:
  - On mount, call `setActiveUsers()` to populate `activeUsers`.
  - Subscribe to `activeUsers` from `useUserStore` and filter client-side by `search`.
  - Render a scrollable list matching sidebar styles; use `AvatarDiv` for consistency.
  - Empty state: show a subtle message when no active users match.
- Structure: mirrors `ChatsTab` container with `flex-1 overflow-y-auto` and the bottom sentinel removed (no pagination).

## Sidebar Wiring
- Replace the placeholder UsersList with `<ActiveUsersTab search={search} />`.
- Keep sticky header (search + tabs) unchanged.

## Result
- "Active Users" tab shows currently online users, aligns with the existing design, and filters with the top search bar.

Confirm to proceed and I will implement these changes.