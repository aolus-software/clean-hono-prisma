# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`clean-hono-prisma` — a clean-architecture REST starter on **Hono 4** with `@hono/zod-openapi`
(Zod validation and the OpenAPI spec come from the same route definitions), **Prisma 7** with the
`@prisma/adapter-pg` driver on **PostgreSQL**, Redis (Bun's native `RedisClient`) for the user cache,
BullMQ for queued mail, JWT auth with access tokens and rotating, revocable refresh tokens, a hand-rolled `en`/`id`
i18n layer, Scalar docs, and optional ClickHouse. Runtime is **Bun**, with an optional cluster mode.
It ships an auth flow and a settings domain (users, roles, permissions, select options) with RBAC.

## Commands

Use **Bun** (`bun run`, `bunx`), never npm/pnpm/yarn. The `Makefile` is the entry point; every target
wraps a script or a Prisma CLI call.

```sh
# Development
make dev                 # bun run --hot src/index.ts
make build               # typecheck + bundle to dist/ (mail templates copied to dist/templates)
make start               # bun run dist/index.js
bun run start:cluster    # same, with APP_CLUSTER_MODE=true

# Quality
make lint                # eslint
make lint-fix
make format              # prettier --write
bun run format:check     # prettier --check (what CI runs)
make typecheck           # tsc --noEmit

# Tests
# There is no test runner. Do not invent `bun test` commands.

# Database (Prisma)
make db-generate         # prisma generate -> prisma/generated (run first on a fresh clone)
make db-migrate-dev      # prisma migrate dev: create + apply a migration, regenerate
make db-migrate          # prisma migrate deploy
make db-push             # prisma db push (dev only)
make db-studio
make db-drop             # prisma migrate reset --force (destructive)
make db-seed             # idempotent seeder
make fresh               # db-drop + db-push + db-seed (destructive)
make reset               # db-generate + db-migrate + db-seed
make db-clickhouse-migrate / db-clickhouse-status

# Deployment (Docker)
make docker-up | docker-down | docker-restart | docker-logs | docker-ps
make docker-build        # compose images + the migrator image
make docker-migrate      # migrator image on the compose network
make docker-seed
make docker-deploy       # git pull + up --build + migrate
```

The seeder (`src/libs/database/seed/index.ts`) creates the 15 permissions, the `superuser` and
`admin` roles (both granted the full catalogue), and `superuser@example.com` / `admin@example.com`
with password `S3crEtP4ssw0rd!`. Running it twice changes nothing; a failure exits 1.

## Architecture

| Alias               | Path                   | Purpose                                                                    |
| ------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `@config`           | `src/libs/config`      | envalid `env` and the config objects (`AppConfig`, `JWT_CONFIG`, ...)      |
| `@database`         | `src/libs/database`    | Prisma `db`, repositories, Redis client, ClickHouse                        |
| `@cache`            | `src/libs/cache`       | `Cache`, cache keys, `forgetUserInformation`, `revokeSessions`             |
| `@default`          | `src/libs/default`     | constants and token lifetime functions                                     |
| `@hono-libs`        | `src/libs/hono`        | middlewares, DI container, shared Zod schemas                              |
| `@errors`           | `src/libs/hono/errors` | error classes, `registerException`, `defaultHook`                          |
| `@guards`           | `src/libs/hono/guards` | `permissionGuard`, `roleGuard`                                             |
| `@types`            | `src/libs/types`       | DTOs, `DatatableType`, `datatableQuerySchema`, `Env`                       |
| `@utils`            | `src/libs/utils`       | `ResponseToolkit`, `DatatableToolkit`, `JWTToolkit`, `Hash`, `logger`, ... |
| `@i18n`             | `src/libs/i18n`        | `t`, `translate`, catalogs, locale store                                   |
| `@mail/*`           | `src/libs/mail`        | `EmailService`, transport, templates                                       |
| `@bull`             | `src/bull`             | queues; importing it boots the worker                                      |
| `@modules`          | `src/modules`          | feature modules                                                            |
| `@prisma-generated` | `prisma/generated`     | generated Prisma client (gitignored)                                       |

### Request flow

`routes.ts` (`createRoute` + handler, HTTP only) → service class (business rules, existence and
uniqueness checks, transactions via `db.$transaction`, cache invalidation, queue dispatch) →
repository factory (Prisma queries only). Boot: `src/index.ts` picks `src/cluster.ts` (primary spawns
workers) or `src/server.ts` (`Bun.serve` on `app.fetch`, imports `@bull`); `src/app.ts` runs
`bootstrap()` (DI registration), the global middleware stack, `registerException`, then mounts
`src/modules/index.ts`.

### The non-obvious bits

- **Guards are per route and must live in `createRoute({ middleware: [AuthMiddleware, ...] })`.**
  That middleware runs before validation and the handler. A guard attached with `.use()` after
  `.openapi()` never protects the handler, and `.use()` ignores the method. Nothing is gated by
  default: no `AuthMiddleware` means public; no guard means any logged-in user.
- **Guards are AND and superuser bypasses both.** `permissionGuard(["a","b"])` needs both;
  privilege-granting routes (admin password reset, select-options) are `roleGuard(["superuser"])`.
- **Two JWTs.** Access (`JWT_SECRET`, 1d) and refresh (`JWT_REFRESH_SECRET`, 7d), payload
  `{ id, type }` (refresh adds `jti`). `AuthMiddleware` accepts only `type: "access"`;
  `POST /auth/refresh` accepts only `type: "refresh"` whose `jti` matches
  `RefreshTokenCacheKey(id)` in Redis, re-checks the user, and rotates the `jti`. Password change or
  reset (own, link, admin), user delete, and a non-`ACTIVE` status update call `revokeSessions`.
  Any verification failure is 401.
- **`UserInformation` is cached** at `UserInformationCacheKey(id)` for 3600 s. The DB read requires
  `status: ACTIVE` and `deletedAt: null`. Every write that changes a user's status, roles, profile,
  password or deletion, and every role/permission update or delete, deletes the affected keys.
- **Repositories are factories**: `UserRepository()` or `UserRepository(tx)`. Reads return `null`; the
  service throws `NotFoundError`. Lists validate sort and filter keys against exported allow-lists
  (400 for an unknown filter key, 422 for a bad `sort`), and `filter[<key>]` params are read off the
  raw query by `DatatableToolkit.parseFilter(c, query)`.
- **Services are classes in the container.** Register in `src/bootstrap.ts`, inject in
  `diMiddleware`, type in `Variables`, read with `c.get("userService")`.
- **Envelope**: `{ status, success, message, data }`; 400/422 carry `errors: [{ field, message }]`.
  Uniqueness is 422; login and token failures are 400.
- **Env only through `@config`.** `src/libs/config/env.ts` validates with envalid; `JWT_SECRET` and
  `JWT_REFRESH_SECRET` are required.
- **`/docs` exists only when `ENABLE_API_DOCS=true`** (default false, independent of `NODE_ENV`).
- **Mail is queued after the transaction commits**; the worker runs in every API process.
- **Users are soft-deleted** (`deletedAt`); `User.email` has no DB unique constraint, so live
  uniqueness is the service's `findLiveByEmail` check.
- **Prisma default names**, camelCase columns, UPPERCASE `UserStatus` values on the wire. The build
  bundles to `dist/index.js`, so mail templates are copied to `dist/templates`.
- **Cluster mode** spawns `APP_CLUSTER_WORKERS` Bun processes sharing the port via `reusePort`. The rate
  limiter is in memory and per process.

## Conventions

- Tabs, double quotes, semicolons (Prettier). No `any`, no floating promises, no `console.*` (use
  `logger`), one block comment above non-obvious blocks only, no emojis.
- Permission strings are `<group> <action>`, space-separated, from the seeder.
- Updates are `PATCH`, never `PUT`; creates return 201 with `data: null`; deletes return 200.
- Uniqueness conflicts are 422; the service owns existence and uniqueness checks.
- Every user-facing string is an i18n key in both `en.json` and `id.json`.
- Rate limiting is global (100 / 60 s) and credential endpoints are never loosened.
- Routes are flat: no global prefix, no versioning.

Two rules apply to every change: `.claude/rules/contradiction-halt.md` and
`.claude/rules/documentation.md`. Read them first.

## Adding a new feature module

1. Create `src/modules/<name>/{routes.ts,schema.ts,service.interface.ts,service.ts}`.
2. Define each route with `createRoute(...)` (request schemas, `responses`, `summary`,
   `description`, `tags`, `security`, `middleware: [AuthMiddleware, ...guards]` when protected) and
   `.openapi(route, handler)` on an `OpenAPIHono<Env>({ defaultHook })`.
3. Mount the router in `src/modules/index.ts` (or `src/modules/settings/index.ts`).
4. Register the service in `src/bootstrap.ts`, inject it in `diMiddleware`, add it to `Variables`.
5. Put queries in a repository under `src/libs/database/postgres/repositories/` and re-export it.
6. Add i18n keys to both catalogs and run `bun run i18n:keys`.
7. Update `.claude/rules/routes.md` and `docs/API_DOCUMENTATION.md`.

## Deeper documentation

- [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) — envelope, auth, route map, list queries
- [`docs/CONFIGURATION.md`](./docs/CONFIGURATION.md) — every env var
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Docker, migrator, cluster mode
- [`docs/ERROR_HANDLING.md`](./docs/ERROR_HANDLING.md) — error classes and status mapping
- [`docs/SECURITY.md`](./docs/SECURITY.md) — auth, tokens, RBAC, rate limiting, headers
- [`docs/MIDDLEWARE.md`](./docs/MIDDLEWARE.md) — the middleware stack

## Skills, rules, and commands

- `.claude/skills` is a symlink to `../.agents/skills`, a vendored bundle (workflow skills plus
  `hono` and `prisma-client-api`); `.agents/skills/README.md` indexes it. `skills-lock.json` is
  gitignored.
- `.claude/rules/` — 26 rules, indexed with their scope in `.claude/rules/README.md`.
- `.claude/commands/` — `/commit`, `/audit-flow` (read-only sweep writing `docs/audit-findings.md`),
  `/update-todo` (reconciles `TODO.md`).
