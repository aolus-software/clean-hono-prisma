# Configuration

Every environment variable is validated once, at boot, by envalid in `src/libs/config/env.ts`, and
read everywhere else through the config objects exported from `@config` (`AppConfig`,
`DatabaseConfig`, `RedisConfig`, `MailConfig`, `JWT_CONFIG`, `corsConfig`, `clickhouseConfig`).
Application code never reads `process.env` directly.

Copy `.env.example` to `.env` to start. Every value in it is copyable as-is except the two JWT secrets,
which you must replace.

## envalid and empty values

envalid treats `VAR=` as **provided and empty**, not as absent. An empty value defeats the default and
fails any `host()`, `url()`, `port()`, or `email()` validator, so the process refuses to boot. Either set
a real value or delete the line. Keep values **unquoted**: `docker run --env-file` passes quotes
literally.

## Application

| Variable          | Type   | Default                 | Notes                                                                                                                             |
| ----------------- | ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`        | enum   | `development`           | `development`, `staging`, `production`. Exposed as `AppConfig.APP_ENV`                                                            |
| `APP_NAME`        | string | `Hono Prisma API`       | Returned by `GET /`, used in mail subjects                                                                                        |
| `APP_PORT`        | port   | `3000`                  |                                                                                                                                   |
| `APP_URL`         | url    | `http://localhost:3000` | Public base URL of the API                                                                                                        |
| `APP_TIMEZONE`    | string | `UTC`                   | IANA zone; date filters resolve whole days in this zone                                                                           |
| `APP_KEY`         | string | `your-app-key`          | Key for `EncryptionToolkit`. **Change it** — the default boots                                                                    |
| `LOG_LEVEL`       | enum   | `info`                  | `info`, `warn`, `debug`, `error`                                                                                                  |
| `ENABLE_API_DOCS` | bool   | `false`                 | Serves `/docs` and `/docs/openapi.json`. The only switch; independent of `NODE_ENV`. `.env.example` sets it `true` for local work |
| `CLIENT_URL`      | url    | `http://localhost:3000` | Front-end base for mail links (`/auth/verify-email`, `/auth/reset-password`)                                                      |

## Process model

| Variable              | Type | Default | Notes                                                                                                                                        |
| --------------------- | ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_CLUSTER_MODE`    | bool | `false` | The entry process becomes a primary and spawns Bun worker processes that share `APP_PORT` via `reusePort`. Crashed workers respawn after 1 s |
| `APP_CLUSTER_WORKERS` | num  | `0`     | Worker count; `0` means one per CPU core                                                                                                     |
| `APP_REUSE_PORT`      | bool | `false` | Bind with `SO_REUSEPORT` without cluster mode, so you can run N processes yourself on one port. Cluster workers always enable it             |

## Authentication

| Variable             | Type   | Default  | Notes                                                                  |
| -------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| `JWT_SECRET`         | string | **none** | Required. Signs access tokens (1 day)                                  |
| `JWT_REFRESH_SECRET` | string | **none** | Required. Signs refresh tokens (7 days). Must differ from `JWT_SECRET` |

Generate each with `openssl rand -base64 48`. Token lifetimes are fixed in code
(`src/libs/config/jwt.config.ts`), not env.

## Database

| Variable       | Type   | Default                                                    | Notes                                                 |
| -------------- | ------ | ---------------------------------------------------------- | ----------------------------------------------------- |
| `DATABASE_URL` | string | `postgresql://postgres:postgres@localhost:5432/hono_clean` | Read by the app and by `prisma.config.ts` for the CLI |

`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` in `.env.example` are read only by
`docker-compose.yml` to provision the container. Keep them in sync with `DATABASE_URL`. Inside the
compose network the host is `postgres`, not `localhost`.

## Redis

| Variable         | Type   | Default     | Notes                                   |
| ---------------- | ------ | ----------- | --------------------------------------- |
| `REDIS_HOST`     | host   | `localhost` | `redis` inside compose                  |
| `REDIS_PORT`     | port   | `6379`      |                                         |
| `REDIS_PASSWORD` | string | `""`        | Compose starts Redis with `password123` |
| `REDIS_DB`       | num    | `0`         |                                         |

Redis backs the user cache and BullMQ.

## Mail

| Variable      | Type   | Default                  |
| ------------- | ------ | ------------------------ |
| `MAIL_HOST`   | host   | `smtp.example.com`       |
| `MAIL_PORT`   | port   | `587`                    |
| `MAIL_SECURE` | bool   | `false`                  |
| `MAIL_USER`   | string | `your_email@example.com` |
| `MAIL_PASS`   | string | `your_email_password`    |
| `MAIL_FROM`   | email  | `noreply@example.com`    |

## CORS

| Variable       | Type   | Default | Notes                                                    |
| -------------- | ------ | ------- | -------------------------------------------------------- |
| `ALLOWED_HOST` | string | `""`    | Comma-separated origins. Empty allows every origin (`*`) |

## ClickHouse (optional)

| Variable              | Type   | Default                 |
| --------------------- | ------ | ----------------------- |
| `CLICKHOUSE_HOST`     | url    | `http://localhost:8123` |
| `CLICKHOUSE_USER`     | string | `default`               |
| `CLICKHOUSE_PASSWORD` | string | `""`                    |
| `CLICKHOUSE_DATABASE` | string | `default`               |

ClickHouse is not required to boot and is not probed by `/health`. Migrations:
`make db-clickhouse-migrate`.

## Not configurable

- Rate limit: 100 requests per 60 s per client IP (`src/libs/hono/middlewares/security/rate-limiter.middleware.ts`).
- Body limit: 100KB.
- User cache TTL: 3600 s.
- Verification and reset token lifetime: 1 hour (`src/libs/default/token-lifetime.ts`).

## Adding a variable

1. Add it to the `cleanEnv(...)` schema in `src/libs/config/env.ts`.
2. Expose it through a config object in `src/libs/config/`.
3. Add it to `.env.example` with a copyable value and to this page.
