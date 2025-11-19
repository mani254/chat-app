# OpenChat — Open Source WhatsApp for Developers

Build, customize, and deploy your own secure messaging platform with modern web technologies. Open source WhatsApp alternative for developers and communities.

## 1) Project Explanation
- OpenChat is a complete, production-ready chat application that includes authentication, real-time messaging, typing indicators, media uploads, and a clean, extensible architecture.
- The project is organized as a Turborepo monorepo with an isolated Next.js web app and an Express/Socket.IO backend, plus shared database schemas.
- It’s designed to be easy to adopt and extend—use it as-is, or tailor the database and UI to fit your product.

## 2) Why This Repository Helps
- Clear separation of concerns: web client, server API, sockets, and database schemas are modular and decoupled.
- Proven patterns: cookie-based JWT auth with refresh flow, robust validation, and clean service/controller layers.
- Extensibility: you can add features (reactions, read receipts, voice notes, etc.) without rewriting core modules.
- Purpose: serve as a ready-to-run reference implementation and a foundation you can integrate into new or existing apps.

Good things about this structure:
- Monorepo with shared tooling and consistent TypeScript standards.
- Isolated chat app that can run on its own subdomain or be embedded.
- Reusable database layer using Mongoose—extend schemas to match your needs.
- Socket-first design for real-time messaging and presence events.

## 3) Project Setup and Usage (Structure, not folders)
You can include this “chat-block” into your product with minimal changes. Two common strategies:

- Strategy A: Isolated app on a subdomain
  - Because this is a Turborepo and the chat app is isolated, you can deploy it as a separate application (e.g., `chat.yourdomain.com`).
  - Keep it independent, integrate with your main app via SSO/JWT or shared auth cookies.
  - This lets you maintain the chat feature as its own lifecycle and team, while sharing the same database if desired.

- Strategy B: Modify `web` and extend the database
  - You can directly customize the Next.js web app and extend the MongoDB schemas to fit your domain.
  - Authentication (credentials + Google OAuth), OTP verification, and refresh token handling are already implemented—most heavy lifting is done.
  - Focus your effort on chat UI/UX and additional features rather than rebuilding auth and messaging from scratch.

## 4) Contributions
I’m making this open source to help developers quickly ship reliable messaging features and to learn from real-world patterns. If this saves you time, consider contributing:
- Improve features, docs, tests, or accessibility.
- Follow the same folder structure and reuse existing code patterns to stay in sync.
- Open issues with clear steps; submit PRs with concise descriptions and screenshots for UI changes.

## 5) Run Locally and Environment Variables

### Requirements
- Node.js `>=22`
- pnpm `@10.x`
- MongoDB (local or Atlas)
- Optional: Cloudflare R2 for media uploads, Brevo SMTP for OTP emails, Google OAuth for social login

### Install & Start (Workspace)
```bash
pnpm install
pnpm dev
```

### Run Individually
```bash
# Backend (Express + Socket.IO)
pnpm --filter server dev

# Frontend (Next.js)
pnpm --filter web dev
```

### Environment Variables

Create `packages/server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/openchat
FRONTEND_URL=http://localhost:3000

# JWT secrets
JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-secret

# Cloudflare R2 (optional, for uploads)
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=openchat

# SMTP via Brevo (for OTP emails)
SMTP_USER=your-brevo-username
SIB_API_KEY=your-brevo-api-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_BACKEND_URL=http://localhost:5000
```

### Notes
- Cookies are HttpOnly and use `sameSite: 'lax'` locally; set `secure: true` and `sameSite: 'none'` in production behind HTTPS.
- CORS must include your frontend origin (e.g., `FRONTEND_URL=http://localhost:3000`).
- If socket connect errors with `Unauthorized`, the client auto-attempts a token refresh—verify your JWT secrets and cookie policies.

---

If you adopt this project, share what you built! Feedback and contributions help make OpenChat better for everyone.