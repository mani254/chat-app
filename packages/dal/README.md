# `@org/dal` — Data Access Layer

The `@org/dal` library is the **single source of truth for all database operations** in this Nx workspace. It encapsulates MongoDB access behind clean, reusable Repositories and Entities.

---

## 📌 Purpose & Responsibilities

- **Hide Database Implementation**: Applications, controllers, and services must never directly access Mongoose Models, Schemas, Collections, or Connections.
- **Provide Clean Public API**: Features interact exclusively through Repositories (for CRUD/Queries) and Entities (for data representation).
- **Enforce Consistent Data Flow**:
  $$\text{Application} \longrightarrow \text{DAL Repository} \longrightarrow \text{Mongoose Schema/Model} \longrightarrow \text{MongoDB}$$

---

## 🔑 Key Aspects & Guidelines

### 1. Public API & Export Rules

- Always import from `@org/dal`. Never perform deep imports into internal subfolders.
- **Exported**: Repositories (`UserRepository`, `ChatRepository`, `MessageRepository`), Entities (`UserEntity`, `ChatEntity`, `MessageEntity`), and Connection helpers (`connectDatabase`, `disconnectDatabase`).
- **Private (Never Exported)**: Mongoose Models (`UserModel`, `ChatModel`, `MessageModel`), Schema definitions, and internal helper functions.

### 2. Entity Strategy

- Entities represent the canonical application data shape.
- Defined as pure TypeScript type aliases mapped directly from schema types (`InferSchemaType`).
- All `ObjectId` instances (primary `_id` and reference fields) are typed as `string` in entities.

### 3. MongoDB Naming Convention

- Every MongoDB reference field must start with an underscore (`_`).
- Examples: `_id`, `_users`, `_groupAdmin`, `_latestMessage`, `_chat`, `_sender`, `_readBy`, `_replyTo`.
- Never use suffixes like `createdById` or `roomId`.

### 4. Connection Management

- The application bootstrap layer calls `connectDatabase()` once at startup.
- The DAL library itself does not auto-connect to the database.

---

## 📂 Folder Structure

```
packages/dal/src/
├── connection/
│   ├── database.constants.ts  # Collection name constants
│   ├── mongodb.ts             # Connection lifecycle manager
│   └── index.ts
├── users/
│   ├── user.schema.ts         # Mongoose schema, model & hooks (Private)
│   ├── user.entity.ts         # UserEntity type definition
│   ├── user.repository.ts     # UserRepository class
│   └── index.ts
├── chats/
│   ├── chat.schema.ts
│   ├── chat.entity.ts
│   ├── chat.repository.ts
│   └── index.ts
├── messages/
│   ├── message.schema.ts
│   ├── message.entity.ts
│   ├── message.repository.ts
│   └── index.ts
└── index.ts                   # Root public entry point
```
