## Overview
Generalize `ChatsTab` to support both chats and groups by toggling a single parameter (`isGroupChat`) based on a new `variant` prop. Wire it into `ChatSidebar` for the Groups tab and fix the `ChatsList` empty-state comparison.

## Changes
- Update `apps/web/components/chat/ChatsTab.tsx`:
  - Add prop `variant: 'chat' | 'group'` (default 'chat').
  - Compute `isGroup = variant === 'group'`.
  - Debounced search: call `loadChats({ search, userId, isGroupChat: isGroup, reset: true })`.
  - Infinite scroll: call `loadChats({ search, userId, isGroupChat: isGroup })`.
  - Render `<ChatsList ... type={isGroup ? 'group' : 'chat'} />`.
- Update `apps/web/components/chat/ChatSidebar.tsx`:
  - For the Groups tab render `<ChatsTab search={search} variant="group" />` instead of the placeholder.
- Fix `apps/web/components/chat/ChatsList.tsx`:
  - Change `if (type = "group")` to `if (type === "group")`.

## Result
- Selecting the Groups tab fetches group chats using existing store and pagination logic, with debounced search and infinite scroll identical to chats, and correct empty-state rendering.

Confirm to proceed and I will implement the changes.