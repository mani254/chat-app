## Scope
Build a fully isolated Mux testing feature under `apps/web/app/mux` with two modules: `youtube` and `shorts`. Protect all routes using the existing auth model and keep backend/data completely separate from chat. Implement large-file direct uploads, resilient lifecycle handling via Mux webhooks, high-performance feeds, and a YouTube‑grade player UX.

## Guardrails & Existing Conventions
- **Auth guard**: Wrap all `/mux/*` pages in `ProtectedRoute` (`apps/web/components/providers/ProtectedRoute.tsx:7–26`).
- **HTTP auth**: Reuse cookie‑based JWT middleware `authorise` (`packages/server/middleware/authMiddleware.ts:6–25`) and axios refresh interceptor (`apps/web/lib/api.ts:10–31`).
- **Monorepo/Turbo**: Keep new code under the same app/package boundaries (`turbo.json`, `pnpm-workspace.yaml`).
- **UI library**: Use the shared shadcn/Radix wrappers from `@workspace/ui/components` (dialogs, drawers, tabs, dropdown, button, skeleton, sonner).
- **DB style**: Follow Mongoose schema patterns under `packages/database/src/schemas/*` and export via `packages/database/src/index.ts`.

## Frontend Architecture
- **Directory layout** (`apps/web/app/mux`):
  - `layout.tsx`: wraps children with `ProtectedRoute` and mounts global Toaster.
  - `youtube/page.tsx`: feed with uploader, filters, search, infinite scroll.
  - `shorts/page.tsx`: vertical swipe feed with prefetch and lightweight mounts.
  - `components/`: shared visuals for cards, player, upload UI, filters, modals.
  - `stores/`: two isolated Zustand stores `useMuxYouTubeStore` and `useMuxShortsStore`.
  - `hooks/`: upload, player, hover‑preview, virtualization helpers.
- **State management**:
  - Use `zustand` with `devtools` names, `subscribeWithSelector`, and carefully crafted selectors to minimize rerenders.
  - Persist critical slices:
    - Upload queue/state (resume/cancel/retry; survives reloads).
    - Continue‑watching progress per `playbackId`.
  - Derived state for filtered views, search debouncing, and visible range calculation.
- **Virtualized lists**:
  - Introduce `@tanstack/react-virtual` for high‑performance infinite feeds.
  - Only render visible items; windowed overscan tuned for hover‑preview needs.
- **UI components (shadcn)**:
  - Forms for metadata (title, description, thumbnail, category, visibility, type).
  - Dialogs/Drawer for upload details and retry controls.
  - Tabs for categories; Popover/Dropdown for sort/filters.
  - Sonner `toast` for progress/errors; Skeletons for loading.

## Upload System (Large Files)
- **Backend init**: `POST /api/videos/uploads` creates a Mux Direct Upload URL using `@mux/mux-node` with `{ cors_origin: '*', new_asset_settings: { playback_policy: ['public'] } }`.
- **Frontend upload**:
  - Use `@mux/mux-uploader-react` (per Mux docs) to stream directly to Mux.
  - Bind progress to store; expose cancel/retry; track resumable state.
  - Persist upload entries with statuses: `queued → uploading → uploaded → processing → ready`.
- **Processing tracking**:
  - Poll minimal status via backend until webhooks confirm `video.asset.ready`.
  - On ready, finalize metadata save to backend and update feed.
- **Edge cases**:
  - Slow networks: chunked uploads; exponential backoff; resume tokens saved in store.
  - Abandoned sessions: background cleanup job marks stale uploads, idempotent completion handlers.

## Player System (YouTube‑grade)
- **Core player**: `@mux/mux-player-react` for adaptive streaming and accessibility.
- **Controls**:
  - Playback speed control, keyboard shortcuts (space, arrows, `f`, `m`).
  - Quality/resolution feedback; ABR handled by HLS; expose user preference UI where possible.
- **Continue‑watching**:
  - Persist `currentTime` per `playbackId`; resume on next play.
- **Prefetching**:
  - Preload manifest and first segment when card becomes near‑visible; limit concurrent prefetch.
- **Hover preview (YouTube style)**:
  - On card hover, mount a muted, autoplay, looped lightweight preview using Mux Player or an HTML `<video>` sourcing the same playback stream with `preload='metadata'`.
  - Keep a small preview player pool; detach quickly to avoid stutter; throttle hover activation.
  - Fallback to thumbnail storyboard for extremely slow networks.

## Shorts Module (Vertical Swipe)
- **Navigation**: touch/keyboard swipe navigation with inertia; keep only 1–3 videos mounted.
- **Prefetch**: when entering a video, prefetch the next one’s manifest.
- **Autoplay/loop**: default autoplay muted, looped; minimal chrome; strong focus discipline.
- **State**: store active index, prefetch queue, and resume positions independently of YouTube module.

## Backend (Separate & Clean)
- **Route namespace**: mount under `/api/videos/*` in `packages/server/app.ts` (`apps/server/app.ts:29–35` shows existing mounts; add new one similarly) with `authorise` on all endpoints.
- **Controllers/services** (new files):
  - `controllers/videoController.ts`: listing, detail, search, shorts feed, metadata save, visibility/moderation, delete/cleanup.
  - `controllers/muxController.ts`: upload init, upload completion hooks, asset status.
  - `controllers/muxWebhookController.ts`: validate payloads via `mux.webhooks.unwrap` and update lifecycle (`video.upload.asset_created`, `video.asset.ready`, etc.).
  - `services/videoService.ts`: DB access with idempotency guards.
- **Models**: `packages/database/src/schemas/video.ts`
  - Fields: `assetId`, `playbackId`, `title`, `description`, `thumbnailKey`, `category`, `visibility ('public'|'unlisted'|'private')`, `type ('long'|'short')`, `duration`, `status ('uploading'|'processing'|'ready'|'failed')`, `uploadedBy` (ref User), `createdAt`, `updatedAt`.
  - Indexes: `type`, `visibility`, `category`, `createdAt`, `uploadedBy`, `status`, text index on `title+description`.
  - Export via `packages/database/src/index.ts`.
- **Endpoints**:
  - `POST /api/videos/uploads` → create Direct Upload URL.
  - `POST /api/videos/uploads/finalize` → persist metadata post‑upload.
  - `GET /api/videos` → list (filters: type, category, visibility, search, pagination).
  - `GET /api/videos/shorts` → shorts feed (windowed/prefetch friendly).
  - `GET /api/videos/:id` → detail.
  - `PATCH /api/videos/:id` → visibility/moderation.
  - `DELETE /api/videos/:id` → deletion (Mux + DB).
  - `POST /api/videos/webhook` → Mux webhooks (validated, idempotent).
- **Webhooks**:
  - Validate with `MUX_WEBHOOK_SIGNING_SECRET` and `mux.webhooks.unwrap` (see examples in provided Mux docs).
  - Update status transitions and persist `playbackId` when ready.
- **Resilience**:
  - Idempotent handlers keyed by `uploadId/assetId`.
  - Retryable operations; race‑safe upserts.
  - Minimal polling; rely on webhooks for finalization.

## Performance & Quality
- **Feeds**: paginated endpoints, stable cursors, `ETag` for cache hints; client `react-virtual` reduces DOM pressure.
- **Stores**: selector‑driven subscriptions; memoized derived state; batched updates.
- **API calls**: dedupe via inflight keys; debounce search; cancel inflight on new queries.
- **UI polish**: consistent shadcn components; skeletons and toasts across flows.

## Config & Env
- Backend: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SIGNING_SECRET`, `FRONTEND_URL`.
- Frontend: `NEXT_PUBLIC_API_BACKEND_URL` already used by axios (`apps/web/lib/api.ts:3–8`).

## Deliverables (New Files/Changes)
- `apps/web/app/mux/layout.tsx` (Protected wrapper)
- `apps/web/app/mux/youtube/page.tsx`, `apps/web/app/mux/shorts/page.tsx`
- `apps/web/app/mux/components/*` (cards, player, uploader, filters)
- `apps/web/app/mux/stores/useMuxYouTubeStore.ts`, `useMuxShortsStore.ts`
- `packages/database/src/schemas/video.ts` + export in `src/index.ts`
- `packages/server/routes/videoRoutes.ts`
- `packages/server/controllers/{videoController,muxController,muxWebhookController}.ts`
- `packages/server/services/videoService.ts`
- Mount route in `packages/server/app.ts` under `/api/videos`

## Phased Implementation
1. Create DB model and server routes/controllers; mount `/api/videos/*`; health check endpoints.
2. Implement upload init + webhook validation; persist metadata and lifecycle.
3. Build `/mux/youtube` UI: uploader, feed, search, filters; virtualization and hover‑preview.
4. Add player UX: speed, shortcuts, continue‑watching, prefetch.
5. Build `/mux/shorts`: vertical swipe, limited mounts, prefetch, autoplay+loop.
6. Edge‑case hardening: idempotency, retries, abandoned uploads cleanup.
7. Stress testing: large upload simulations, feed scale, hover previews under load.

## Notes
- All `/api/videos/*` endpoints guarded by `authorise` (`packages/server/middleware/authMiddleware.ts:6–25`).
- All `/mux/*` pages guarded by `ProtectedRoute` (`apps/web/components/providers/ProtectedRoute.tsx:7–41`).
- Follow the existing import aliases for shared shadcn components from `@workspace/ui`.

Confirm and I’ll start implementing end‑to‑end.