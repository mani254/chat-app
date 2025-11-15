## Overview
Implement a WhatsApp‑style, three‑step group creation flow inside `NewGroupModal.tsx` using the existing `ResponsiveModal` wrapper. Steps: 1) group identity (image URL, name, optional description), 2) member selection with search and chips, 3) review and create. Creation will call the existing chat API via `useChatStore.createChat` in `apps/web/store/useChatStore.ts:92` using the backend payload shape in `packages/database/src/types/chat.ts:3-8`, with server requirements validated in `packages/server/services/chatServices.ts:180-191`.

## Files To Update
1. `apps/web/components/chat/NewGroupModal.tsx` — replace the component implementation with a wizard UI and creation logic.

## Step 1: Group Details
1. Inputs: `name` (required), `description` (optional), `imageUrl` (optional).
2. Image: simple circular preview + input field for URL; offer suggested image chips (hardcoded URLs) for quick selection.
3. Validation: disable “Next” until `name.trim().length > 0`.
4. Store values via `useCreateGroupStore` (already implemented) for `name`, `description`, `image`.

## Step 2: Select Members
1. Use `UsersList` (`apps/web/components/users/UsersList.tsx`) with `search` state, `selectedUserIds`, and `highlightSelected=true` to visually mark selected.
2. Clicking a user toggles selection (add/remove) using `useCreateGroupStore.addUser` and `resetUsers` behaviors; prevent duplicates (store already enforces this).
3. Show a horizontal row of selected‑member chips at the top for quick removal (click to unselect).
4. Ensure the current user (admin) is included in final payload; show a hint that the creator is the admin.

## Step 3: Review & Create
1. Show image preview, name, description and a compact grid of selected members (avatars + names).
2. “Create Group” triggers `useChatStore.createChat` with payload: `{ users: [...selectedIds, currentUserId], isGroupChat: true, name, groupAdmin: currentUserId }`.
3. On success, navigate to the new chat: `router.push('/?chatId=' + chat._id)` (pattern used in existing modal prototype).
4. If creation fails, show a toast error (use `@workspace/ui/components/sonner` like `apps/web/lib/chatApi.ts:15-17`).

## State & Actions
- Use the existing store `useCreateGroupStore` for `name`, `description`, `image`, `users`.
- Local component state: `step` (1|2|3), `search` (string), loading flag during creation.
- Hooks: `useUserStore` to get `currentUser` (`apps/web/store/useUserStore.ts:83-90`), `useChatStore` to call `createChat` (`apps/web/store/useChatStore.ts:92-108`).

## Validation & UX
- Step 1: require name; allow empty description and image URL.
- Step 2: require at least one member (besides admin) for a meaningful group; still include admin automatically.
- Stepper header with three labeled steps; next/back controls anchored bottom.
- Consistent design tokens: `bg-background`, `border-border`, rounded containers, subtle shadows; match patterns used in `CreateChatButton.tsx` and `ResponsiveModal.tsx`.

## Navigation
- Close modal on success and route to the created chat.
- Preserve state when navigating steps; allow returning to previous steps to edit.

## Non‑Functional Notes
- Backend does not accept `description` or `avatar` in `CreateChatPayload`; those are kept client‑side for UX only and not sent (`packages/database/src/types/chat.ts:3-8`, `packages/server/services/chatServices.ts:175-191`).
- Image URL stays in client state for preview; server will use its default avatar (`packages/database/src/schemas/chat.ts:34-37`).

## Implementation Outline
- Replace the content of `NewGroupModal` with a wizard component that:
  - Renders step panels conditionally.
  - Uses `TextInput` for name and description; standard `<input type="url">` for image URL.
  - Uses `UsersList` for searching and picking members; pass `selectedUserIds` and `highlightSelected`.
  - Final step composes payload and calls `createChat`; handles loading and errors.

Confirm to proceed with implementing these changes in `NewGroupModal.tsx`.