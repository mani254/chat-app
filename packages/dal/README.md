# `@org/dal` — Developer Guide (MongoDB Data Access Layer)

This package is the **single source of truth for all database operations** in your monorepo. It isolates MongoDB and Mongoose implementation details from your application server.

---

## 📌 What is this package?

`@org/dal` is a specialized database abstraction layer. It manages database connections, Mongoose schemas, indexes, and queries. It exposes a clean **Repository pattern** and **Entity types** to the backend API (`@org/api`).

---

## 🎯 What is its exact use?

Use `@org/dal` to prevent database implementation details from leaking into your business logic:

1. **Repository Pattern**: Whenever your backend service needs to create, read, update, or delete records from MongoDB, it calls an injected Repository method (e.g., `userRepository.findById(id)`).
2. **Entity Types**: Returns pure TypeScript `Entity` objects representing stored documents, ensuring backend services never manipulate raw Mongoose document wrappers.
3. **Connection Lifecycle**: Centralizes connection pooling, database diagnostics (`check-db`), and graceful shutdowns.

---

## ✍️ What should you write here?

When adding a new database collection or entity to your boilerplate, add the following files to `src/<feature>/`:

- **`*.schema.ts`** *(Private)*: Define your Mongoose Schema, hooks, indexes, and Mongoose Model. **Do not export this file from `index.ts`**.
- **`*.entity.ts`** *(Public)*: Define the canonical TypeScript type for the entity (typically using `InferSchemaType`). Ensure `_id` and all references are typed as `string`.
- **`*.repository.ts`** *(Public)*: Define a Repository class encapsulating all Mongoose `.find()`, `.create()`, `.updateOne()`, and `.aggregate()` queries.

### What should you NEVER write here?
- **No HTTP Controllers or Services**: Do not import NestJS Controllers, Fastify request objects, or HTTP error handlers here.
- **No Direct Schema Exports**: Never export Mongoose Models or Schemas from `@org/dal`. Only export Repositories and Entities.

---

## 🚨 Mandatory Architectural & Naming Rules

> [!IMPORTANT]
> **MongoDB Reference Naming**: Every MongoDB reference field **must start with an underscore (`_`)**.
> - **Correct**: `_id`, `_users`, `_chat`, `_sender`, `_owner`
> - **Incorrect**: `userId`, `chatId`, `ownerId`

> [!NOTE]
> **Entity ObjectIds**: Always type MongoDB ObjectIds as `string` in public Entities so consumers in `@org/api` never have to call `.toString()`.

---

## 🏗️ Structure You Should Follow

```
packages/dal/src/
├── connection/            # Database connection lifecycle and collection constants
├── users/                 # Example domain collection
├── <your-new-collection>/ # Add new MongoDB collections here
│   ├── <feature>.schema.ts      # Private Mongoose schema & model
│   ├── <feature>.entity.ts      # Public TypeScript entity type
│   ├── <feature>.repository.ts  # Public repository query class
│   └── index.ts                 # Export ONLY entity and repository
└── index.ts               # Root public entry point
```

---

## 💡 Example Workflow: Adding a New Collection

1. Create a folder: `src/project/`
2. Define the schema in `src/project/project.schema.ts` with reference fields starting with an underscore (e.g., `_owner: { type: Schema.Types.ObjectId }`).
3. Define `ProjectEntity` in `src/project/project.entity.ts`.
4. Create `ProjectRepository` in `src/project/project.repository.ts` containing your DB query methods.
5. Export `ProjectEntity` and `ProjectRepository` from `src/index.ts`.
