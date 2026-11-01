# Clean Hono Prisma

A clean-architecture backend API starter built with Hono, TypeScript, Bun, and Prisma. It ships
authentication (with refresh tokens) and a settings domain — users, roles, permissions — guarded by
RBAC.

## Features

- Route → service → repository layering, with services resolved from a small DI container
- Hono 4 with `@hono/zod-openapi`: one route definition drives validation and the OpenAPI spec
- PostgreSQL with Prisma 7 (`@prisma/adapter-pg`)
- JWT access (1 day) and refresh (7 days) tokens with separate secrets
- RBAC with per-route permission and role guards; 15 seeded permissions
- Redis-cached user information, invalidated on every access-changing write
- Paginated lists with allow-listed sort and `filter[<key>]` parameters
- BullMQ queued mail with English and Indonesian templates; `en` / `id` i18n
- Rate limiting, CORS, security headers, body limit
- Scalar API docs behind `ENABLE_API_DOCS`
- Optional ClickHouse; optional cluster mode
- Multi-stage Dockerfile and compose stack

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono + `@hono/zod-openapi`
- **Language**: TypeScript (strict)
- **Databases**: PostgreSQL, Redis, ClickHouse (optional)
- **ORM**: Prisma
- **Queue**: BullMQ
- **Validation**: Zod
- **API Docs**: Scalar

## Prerequisites

- Bun 1.3 or higher
- PostgreSQL
- Redis
- Docker (optional)

## Installation

```sh
bun install
```

## Configuration

```sh
cp .env.example .env
```

Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` (both required, `openssl rand -base64 48`). Every other
value in `.env.example` works as-is for local development. See
[docs/CONFIGURATION.md](./docs/CONFIGURATION.md) for every variable.

## Database Setup

```sh
docker compose up -d postgres redis   # or point DATABASE_URL / REDIS_* at your own
make db-generate                      # generate the Prisma client into prisma/generated
make db-migrate                       # apply migrations
make db-seed                          # permissions, roles, and two users
```

Seeded accounts (change or remove them before any public deployment):

| Email                   | Role        | Password          |
| ----------------------- | ----------- | ----------------- |
| `superuser@example.com` | `superuser` | `S3crEtP4ssw0rd!` |
| `admin@example.com`     | `admin`     | `S3crEtP4ssw0rd!` |

The seeder is idempotent. Schema changes: edit `prisma/schema.prisma`, then `make db-migrate-dev`.

## Development

```sh
make dev
```

The API listens on `http://localhost:3000`.

## Production

```sh
bun run build    # typecheck + bundle to dist/
bun run start    # bun run dist/index.js
```

Set `APP_CLUSTER_MODE=true` to run one worker per CPU core. See
[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Docker

```sh
make docker-up        # postgres, redis, clickhouse, app
make docker-migrate
make docker-seed
```

Inside compose, use service hostnames in `.env` (`@postgres:5432`, `REDIS_HOST=redis`).

## Project Structure

```
prisma/
├── schema.prisma            # models (Prisma default names)
└── migrations/
src/
├── index.ts                 # entry: cluster primary or server
├── cluster.ts               # spawns workers sharing the port
├── server.ts                # Bun.serve + BullMQ worker
├── app.ts                   # global middleware, error handler, routes
├── bootstrap.ts             # DI container registrations
├── bull/                    # BullMQ queues and workers
├── libs/
│   ├── cache/               # Redis cache + keys
│   ├── config/              # envalid env + config objects
│   ├── database/
│   │   ├── postgres/        # Prisma client + repositories
│   │   ├── seed/            # seeders
│   │   ├── redis/
│   │   └── clickhouse/
│   ├── default/             # constants, token lifetimes
│   ├── hono/                # middlewares, guards, errors, schemas, DI container
│   ├── i18n/                # en / id catalogs
│   ├── mail/                # mail service + templates
│   ├── types/
│   └── utils/
└── modules/
    ├── auth/
    ├── home/
    ├── profile/
    └── settings/
        ├── permissions/
        ├── roles/
        ├── select-options/
        └── users/
```

## Code Quality

```sh
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run typecheck
```

There is no test runner configured yet.

## API Documentation

With `ENABLE_API_DOCS=true` (on in `.env.example`), the Scalar UI is at `http://localhost:3000/docs`
and the spec at `/docs/openapi.json`. The route map, envelope, and list-query rules are in
[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

## Scripts

### Development

- `bun run dev` — hot-reload dev server
- `bun run i18n:keys` — regenerate translation key types

### Build & Production

- `bun run build` — typecheck and bundle to `dist/` (mail templates copied to `dist/templates`)
- `bun run build:binary` — compile a standalone `server` binary
- `bun run start` — run `dist/index.js`
- `bun run start:cluster` — run `dist/index.js` in cluster mode

### Code Quality

- `bun run lint` / `bun run lint:fix`
- `bun run format` / `bun run format:check`
- `bun run typecheck`

### Database (PostgreSQL/Prisma)

- `bun run db:generate` — `prisma generate`
- `bun run db:migrate` — `prisma migrate deploy`
- `bun run db:migrate:dev` — `prisma migrate dev`
- `bun run db:push` — `prisma db push` (dev only)
- `bun run db:pull` — `prisma db pull`
- `bun run db:studio` — `prisma studio`
- `bun run db:drop` — `prisma migrate reset --force` (destructive)
- `bun run db:seed` — run the seeders

### Database (ClickHouse)

- `bun run db:clickhouse:migrate`
- `bun run db:clickhouse:status`

### Makefile Commands

| Target                  | Does                                            |
| ----------------------- | ----------------------------------------------- |
| `help`                  | list targets                                    |
| `install`               | `bun install`                                   |
| `dev`                   | dev server                                      |
| `build`                 | typecheck + bundle                              |
| `start`                 | run the bundle                                  |
| `lint` / `lint-fix`     | ESLint                                          |
| `format`                | Prettier                                        |
| `typecheck`             | `tsc --noEmit`                                  |
| `db-generate`           | `prisma generate`                               |
| `db-migrate`            | `prisma migrate deploy`                         |
| `db-migrate-dev`        | `prisma migrate dev` + generate                 |
| `db-push`               | `prisma db push`                                |
| `db-pull`               | `prisma db pull`                                |
| `db-studio`             | `prisma studio`                                 |
| `db-drop`               | `prisma migrate reset --force`                  |
| `db-seed`               | seed                                            |
| `db-clickhouse-migrate` | ClickHouse migrations                           |
| `db-clickhouse-status`  | ClickHouse migration status                     |
| `fresh`                 | `db-drop` + `db-push` + `db-seed` (destructive) |
| `reset`                 | `db-generate` + `db-migrate` + `db-seed`        |
| `docker-build`          | compose images + migrator image                 |
| `docker-up`             | `docker compose up -d --build`                  |
| `docker-down`           | `docker compose down`                           |
| `docker-restart`        | restart the app container                       |
| `docker-logs`           | tail app logs                                   |
| `docker-ps`             | stack status                                    |
| `docker-migrate`        | migrate on the compose network                  |
| `docker-seed`           | seed on the compose network                     |
| `docker-deploy`         | git pull + up + migrate                         |

## Contributing

See [.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md). Security reports go through
[.github/SECURITY.md](./.github/SECURITY.md).

## License

MIT — see [LICENSE](./LICENSE).
