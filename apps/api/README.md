# `@org/api` — Developer Guide (NestJS & Fastify Backend Server)

This application is the **real-time backend server** for your monorepo. It is built on **NestJS 11** with a high-performance **Fastify** HTTP adapter (`@nestjs/platform-fastify`), **SWC** compilation, and **Socket.IO** WebSockets powered by Redis.

---

## 📌 What is this application?

`@org/api` is the execution engine of your backend. It handles incoming HTTP REST requests and WebSocket connections, enforces authentication and validation rules, executes business logic, and coordinates data persistence.

---

## 🎯 What is its exact use?

Use `@org/api` to implement server-side endpoints and business workflows:

1. **REST API Controllers**: Define HTTP route endpoints, validate incoming request payloads using `@org/shared` DTOs, and serialize outgoing responses.
2. **Business Logic Services**: Orchestrate domain workflows (authentication, email notifications, calculations) and call `@org/dal` repositories to persist or retrieve records.
3. **Real-Time WebSocket Gateways**: Listen for and broadcast bidirectional Socket.IO events (`src/app/websocket/`).
4. **Distributed Caching**: Use the integrated Redis client (`src/app/redis/`) for session storage, token blacklisting, or pub/sub.

---

## ✍️ What should you write here?

When adding a new backend feature to your boilerplate, create a feature module under `src/app/<feature>/`:

- **`*.controller.ts`**: Define `@Controller()` routes, apply auth guards, and use Request DTOs from `@org/shared` to validate body payloads.
- **`*.service.ts`**: Define an `@Injectable()` service class that injects `@org/dal` Repositories to perform database CRUD and throw NestJS HTTP exceptions (`BadRequestException`, `NotFoundException`, etc.).
- **`*.module.ts`**: Wire together controllers, services, and any imported repository modules.
- **`*.gateway.ts`** *(if real-time)*: Define `@WebSocketGateway()` classes for real-time socket events.

### What should you NEVER write here?
- **No Database Schemas or Mongoose Models**: Do not define Mongoose schemas, DB indexes, or Mongoose `.model()` declarations in `apps/api`. Always put them in `@org/dal`.
- **No Duplicate DTOs**: Never write ad-hoc TypeScript interfaces for API request or response bodies—always put DTOs in `@org/shared`.

---

## 🏗️ Structure You Should Follow

```
apps/api/src/
├── app/                   # Feature domain modules
│   ├── auth/              # Authentication, Better-Auth & OTP logic
│   ├── chat/              # Chat room management
│   ├── message/           # Message persistence & queries
│   ├── websocket/         # Socket.IO Gateway & Redis adapter
│   ├── redis/             # Redis client connection pool
│   ├── mail/              # NodeMailer transactional email sender
│   ├── health/            # Diagnostic health checks
│   └── <your-new-module>/ # Add new NestJS feature modules here
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts
│       └── <feature>.module.ts
├── common/                # Global guards, filters, interceptors & decorators
├── config/                # Environment variable configuration loaders
├── swagger/               # OpenAPI Swagger documentation setup
└── main.ts                # Application bootstrap
```

---

## 💡 Example Workflow: Adding a New Backend Endpoint

1. Define `CreateProjectRequest` and `ProjectResponse` in `@org/shared`.
2. Define `ProjectEntity` and `ProjectRepository` in `@org/dal`.
3. Create `src/app/project/project.service.ts`:
   ```ts
   import { Injectable } from '@nestjs/common';
   import { ProjectRepository } from '@org/dal';
   import type { CreateProjectRequest, ProjectResponse } from '@org/shared';

   @Injectable()
   export class ProjectService {
     constructor(private readonly projectRepository: ProjectRepository) {}

     async create(input: CreateProjectRequest): Promise<ProjectResponse> {
       const entity = await this.projectRepository.create(input);
       return { id: entity._id, title: entity.title, description: entity.description };
     }
   }
   ```
4. Create `src/app/project/project.controller.ts`:
   ```ts
   import { Controller, Post, Body } from '@nestjs/common';
   import { ProjectService } from './project.service';
   import type { CreateProjectRequest, ProjectResponse } from '@org/shared';

   @Controller('projects')
   export class ProjectController {
     constructor(private readonly projectService: ProjectService) {}

     @Post()
     async create(@Body() body: CreateProjectRequest): Promise<ProjectResponse> {
       return this.projectService.create(body);
     }
   }
   ```
5. Register `ProjectModule` in `src/app/app.module.ts` and test with `pnpm nx dev @org/api`!
