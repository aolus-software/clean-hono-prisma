# CLAUDE.md - clean-hono-prisma

Clean architecture backend API built with Hono, TypeScript, and Bun. Uses Prisma ORM with PostgreSQL, Redis for caching/rate limiting, BullMQ for background jobs, and ClickHouse for analytics.

This project mirrors `clean-hono` feature-for-feature — the only difference is the ORM: Prisma instead of Drizzle.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono with `@hono/zod-openapi`
- **Language**: TypeScript (strict)
- **Primary DB**: PostgreSQL via Prisma ORM
- **Cache / Rate limiting**: Redis (ioredis)
- **Queue**: BullMQ
- **Analytics**: ClickHouse (optional)
- **Validation**: Zod
- **API Docs**: Scalar (`@scalar/hono-api-reference`)
- **Logging**: pino via hono-pino

## Commands

```sh
# Development
bun run dev             # Start server with hot reload
bun run typecheck       # TypeScript type check (no emit)

# Build & Production
bun run build           # Build to dist/
bun run start           # Start production server

# Code Quality
bun run lint            # Run ESLint
bun run lint:fix        # Auto-fix ESLint issues
bun run format          # Format with Prettier

# Database - PostgreSQL / Prisma
bun run db:generate     # Generate Prisma client (prisma generate)
bun run db:migrate      # Create and apply migration (prisma migrate dev)
bun run db:push         # Push schema directly (prisma db push, dev only)
bun run db:pull         # Introspect database into schema (prisma db pull)
bun run db:studio       # Open Prisma Studio (prisma studio)
bun run db:seed         # Seed with initial data

# Database - ClickHouse
bun run db:clickhouse:migrate   # Run ClickHouse migrations
bun run db:clickhouse:status    # Check ClickHouse migration status
```

API available at `http://localhost:3000`. Docs at `http://localhost:3000/docs`.

## Project Structure

```
prisma/
└── schema.prisma                   # Prisma schema (models + datasource + generator)
src/
├── app.ts                          # Hono app setup
├── bootstrap.ts                    # Bootstrap configuration
├── index.ts                        # Entry point
├── bull/
│   ├── queue/                      # BullMQ job queues
│   └── worker/                     # BullMQ job workers
├── libs/
│   ├── cache/                      # Redis cache utilities
│   ├── config/                     # App, DB, Redis, mail configs + env validation
│   ├── database/
│   │   ├── clickhouse/             # ClickHouse client, repos, migrations
│   │   ├── postgres/
│   │   │   ├── client.ts           # Prisma client singleton
│   │   │   └── repositories/       # Prisma repository implementations
│   │   ├── redis/                  # Redis client
│   │   └── seed/                   # Database seeders
│   ├── default/                    # Default constants (pagination, sort, password rules, etc.)
│   ├── hono/
│   │   ├── core/                   # DI container
│   │   ├── errors/                 # Custom error classes + handler
│   │   ├── guards/                 # Permission and role guards
│   │   ├── middlewares/
│   │   │   ├── core/               # DI, logging, performance, request-id
│   │   │   └── security/           # Auth, CORS, rate-limiter, body-limit, security-headers
│   │   └── schemas/                # Shared response schemas
│   ├── mail/                       # Nodemailer service + templates
│   ├── plugins/                    # Plugin system (registry, builder, examples)
│   ├── types/                      # TypeScript types and interfaces
│   └── utils/                      # Date, string, number, security, hono helpers
└── modules/
    ├── auth/                       # Authentication (routes, schema, service)
    ├── home/                       # Health/home route
    ├── profile/                    # User profile (routes, schema, service)
    └── settings/
        ├── permissions/
        ├── roles/
        ├── select-options/
        └── users/
```

## Architecture Patterns

### Clean Architecture

- Services hold business logic; repositories handle data access; routes define HTTP endpoints
- Dependencies point inward — outer layers depend on inner layers, not the reverse
- Each module under `src/modules/` follows the same structure:
  - `routes.ts` - Route definitions with OpenAPI decorators
  - `schema.ts` - Zod schemas for validation and OpenAPI
  - `service.interface.ts` - Service contract
  - `service.ts` - Service implementation

### Dependency Injection

- Container is in `src/libs/hono/core/container.ts`
- Register all services and repositories in the container
- Use the DI middleware (`libs/hono/middlewares/core/di.middleware.ts`) to inject dependencies into routes

### Repository Pattern

- All database access goes through repository classes in `src/libs/database/postgres/repositories/`
- Repository interfaces are defined in `src/libs/types/repositories/`
- Use the Prisma client singleton from `src/libs/database/postgres/client.ts`
- Never write Prisma queries directly in services

### Error Handling

- Throw custom error classes from `src/libs/hono/errors/`
- Available: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `UnprocessableEntityError`, `ServiceUnavailableError`
- Error codes are in `src/libs/hono/errors/error-codes.constant.ts`
- Centralized handler in `src/libs/hono/errors/error.handler.ts` manages all responses

### Guards

- `permission.guard.ts` and `role.guard.ts` in `src/libs/hono/guards/`
- Apply to protected routes for RBAC authorization

## Prisma Usage

### Schema

All models are defined in `prisma/schema.prisma`. After any schema change:

```sh
bun run db:generate   # Regenerate Prisma client types
bun run db:migrate    # Create and apply a new migration (production-safe)
# or
bun run db:push       # Push directly without a migration file (dev only)
```

### Client

Import the singleton client, never instantiate `PrismaClient` directly:

```ts
import { db } from "@/libs/database/postgres/client";
```

### Repositories

Repositories wrap Prisma calls and implement the interfaces from `src/libs/types/repositories/`. Return plain objects or typed DTOs — do not leak Prisma types into services.

## Code Style

### TypeScript

- Strict mode — never use `any`; use proper types or `unknown` with type guards
- ESLint rules enforced: `@typescript-eslint/no-explicit-any: error`, `@typescript-eslint/no-floating-promises: error`, `no-console: warn`

### Comments

- Add comments only before function blocks or complex logic blocks
- For complex conditions, add a comment before the condition block, not inline
- Keep comments concise and meaningful — no line-by-line comments

### General

- No icons or emojis in any files
- Validate all inputs with Zod schemas
- Use caching where appropriate (see `src/libs/cache/`)
- Implement pagination for all list endpoints using types in `src/libs/types/hono/pagination.ts`
- Follow conventional commits format

## Key File Paths

| Purpose                 | Path                                           |
| ----------------------- | ---------------------------------------------- |
| Prisma schema           | `prisma/schema.prisma`                         |
| Prisma client singleton | `src/libs/database/postgres/client.ts`         |
| Environment validation  | `src/libs/config/env.ts`                       |
| Config validators       | `src/libs/config/config.validator.ts`          |
| DI container            | `src/libs/hono/core/container.ts`              |
| Error classes           | `src/libs/hono/errors/`                        |
| Error codes             | `src/libs/hono/errors/error-codes.constant.ts` |
| Response schemas        | `src/libs/hono/schemas/response.schemas.ts`    |
| Password rules          | `src/libs/default/strong-password.ts`          |
| Common types            | `src/libs/types/common.types.ts`               |
