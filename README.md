# ChatApp Monorepo Workspace

An enterprise-grade, scalable Nx workspace for ChatApp, built with TypeScript, MongoDB, NestJS (upcoming), and TanStack Query.

---

## 🏗️ Workspace Architecture

```
packages/
├── shared/   (@org/shared) — Standalone type contracts & DTOs (Zero runtime deps)
└── dal/      (@org/dal)    — Data Access Layer for MongoDB (Repositories & Entities)
```

### Dependency Graph

$$\text{Frontend (TanStack Query)} \longrightarrow \text{@org/shared} \longleftarrow \text{NestJS API} \longrightarrow \text{@org/dal} \longrightarrow \text{MongoDB}$$

---

## 📦 Packages Summary

### 1. [`@org/shared`](./packages/shared/README.md)

- **Role**: Single source of truth for TypeScript types across the monorepo.
- **Contents**: Common utility envelopes (`ApiResponse`, `PaginatedResult`), DB payload types, and Controller Request/Response DTOs.
- **Frontend Use**: Serves as exact TypeScript types for TanStack Query mutations and queries.

### 2. [`@org/dal`](./packages/dal/README.md)

- **Role**: Production-ready Data Access Layer for MongoDB.
- **Contents**: Schemas, Models, Repositories (`UserRepository`, `ChatRepository`, `MessageRepository`), Entities, and Connection Lifecycle management.
- **Rule**: Completely hides Mongoose, Models, Collections, and Schemas from application modules.

---

## ⚡ Development & Resolution Strategy

This workspace uses TS package exports with custom conditions (`@org/source`) for local development:

- **Instant Hot-Reloading**: Imports from `@org/shared` or `@org/dal` during development resolve directly to `./src/index.ts` source code.
- **No Manual Build Step**: You do **NOT** need to run `nx build` during local development when modifying code in `shared` or `dal`.

---

## 🛠️ Common Commands

```sh
# Typecheck packages
npx nx typecheck shared
npx nx typecheck dal

# Build packages
npx nx build shared
npx nx build dal

# Format workspace files
npx nx format:write
```
