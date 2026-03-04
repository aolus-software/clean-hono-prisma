# clean-hono-prisma - TODO

Build this project to match `clean-hono` feature-for-feature, replacing Drizzle ORM with Prisma.

Reference implementation: `../clean-hono/`

---

## Phase 1 - Project Setup

- [x] `tsconfig.json`
- [x] `.gitignore`
- [x] `.env.example`
- [x] `docker-compose.yml`
- [x] `Makefile`
- [x] Install all dependencies (runtime + dev)
- [x] Add ESLint config (`eslint.config.mjs`)
- [x] Add Prettier config (`.prettierrc`, `.prettierignore`)
- [x] Add Husky + lint-staged (`.husky/pre-commit`)
- [x] Expand `package.json` scripts (`build`, `start`, `typecheck`, `lint`, `lint:fix`, `format`, db scripts)

---

## Phase 2 - Core Infrastructure (libs/)

### Config

- [x] `src/libs/config/` (all files)

### Database - Prisma

- [x] `prisma/schema.prisma` — all models matching clean-hono's Drizzle schema
- [x] `src/libs/database/postgres/client.ts` — Prisma client singleton
- [x] `src/libs/database/postgres/repositories/user.repository.ts`
- [x] `src/libs/database/postgres/repositories/role.repository.ts`
- [x] `src/libs/database/postgres/repositories/permission.repository.ts`
- [x] `src/libs/database/postgres/repositories/forgot-password.repository.ts`
- [x] `src/libs/database/postgres/repositories/index.ts`

### Database - index

- [x] `src/libs/database/index.ts` — re-export Prisma client, Redis, ClickHouse

### Database - Seed

- [x] `src/libs/database/seed/index.ts` (runner)
- [x] `src/libs/database/seed/rbac.seed.ts`
- [x] `src/libs/database/seed/user.seed.ts`

### Database - Redis

- [x] `src/libs/database/redis/redis-client.ts`

### Database - ClickHouse

- [x] `src/libs/database/clickhouse/` (all files)

### Everything else

- [x] `src/libs/cache/`
- [x] `src/libs/default/`
- [x] `src/libs/hono/`
- [x] `src/libs/mail/`
- [x] `src/libs/plugins/`
- [x] `src/libs/types/`
- [x] `src/libs/utils/` (fixed: removed Drizzle `PgColumn` from `datatable.ts`)

---

## Phase 3 - Application Entry Points

- [x] `src/app.ts`
- [x] `src/bootstrap.ts`
- [x] `src/index.ts` (replace skeleton)

---

## Phase 4 - BullMQ

- [x] `src/bull/index.ts`
- [x] `src/bull/queue/send-email.queue.ts` (fixed: `RedisClient` import path)
- [x] `src/bull/worker/send-email.worker.ts` (fixed: `RedisClient` import path)

---

## Phase 5 - Feature Modules

### Copy as-is (no ORM imports)

- [x] `src/modules/index.ts`
- [x] `src/modules/home/routes.ts` _(fix: replace `db` import with Prisma client)_
- [x] `src/modules/auth/routes.ts`
- [x] `src/modules/auth/schema.ts`
- [x] `src/modules/auth/service.interface.ts`
- [x] `src/modules/profile/routes.ts`
- [x] `src/modules/profile/schema.ts`
- [x] `src/modules/profile/service.interface.ts`
- [x] `src/modules/settings/index.ts`
- [x] `src/modules/settings/permissions/routes.ts`
- [x] `src/modules/settings/permissions/schema.ts`
- [x] `src/modules/settings/permissions/service.interface.ts`
- [x] `src/modules/settings/roles/routes.ts`
- [x] `src/modules/settings/roles/schema.ts`
- [x] `src/modules/settings/roles/service.interface.ts`
- [x] `src/modules/settings/users/routes.ts`
- [x] `src/modules/settings/users/schema.ts`
- [x] `src/modules/settings/users/service.interface.ts`
- [x] `src/modules/settings/select-options/routes.ts`
- [x] `src/modules/settings/select-options/schema.ts`
- [x] `src/modules/settings/select-options/service.interface.ts`

### Copy then fix import path (repo imports from `@database` → postgres repos path)

- [x] `src/modules/settings/permissions/services.ts`
- [x] `src/modules/settings/roles/services.ts`
- [x] `src/modules/settings/users/services.ts`
- [x] `src/modules/settings/select-options/services.ts`

### Rewrite with Prisma (use clean-hono as reference for logic)

- [x] `src/modules/auth/service.ts` — replace `eq`/Drizzle queries with Prisma calls
- [x] `src/modules/profile/service.ts` — replace `db`, `usersTable`, `and/eq/isNull` with Prisma

---

## Phase 6 - DevOps

- [ ] `Dockerfile`

---

## Prisma vs Drizzle Reference

| Concern         | Drizzle (clean-hono)                     | Prisma (this project)      |
| --------------- | ---------------------------------------- | -------------------------- |
| Schema          | `src/libs/database/postgres/schema/*.ts` | `prisma/schema.prisma`     |
| Migrations      | `drizzle-kit generate` + `migrate`       | `prisma migrate dev`       |
| Push (dev)      | `drizzle-kit push`                       | `prisma db push`           |
| Reset           | `drizzle-kit drop`                       | `prisma migrate reset`     |
| Studio          | `drizzle-kit studio`                     | `prisma studio`            |
| Client          | `drizzle-orm`                            | `@prisma/client`           |
| Auto timestamps | `.$onUpdate(() => new Date())`           | `@updatedAt`               |
| Relations       | `.relations()` helper                    | inline relation fields     |
| Sort columns    | `PgColumn` objects                       | plain `string` field names |
