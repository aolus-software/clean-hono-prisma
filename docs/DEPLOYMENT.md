# Deployment

The app is built into a single bundle, `dist/index.js` (`bun run build`, which also copies the mail
templates to `dist/templates`), and started with `bun run start`. It needs the generated Prisma client
(`prisma/generated`), PostgreSQL, and Redis.

## 1. Single process

```bash
bun install
bunx --bun prisma generate
bun run build
bunx --bun prisma migrate deploy
bun run start
```

## 2. Cluster mode (built in)

```bash
APP_CLUSTER_MODE=true APP_CLUSTER_WORKERS=0 bun run start   # 0 -> one worker per CPU core
```

`src/index.ts` runs `src/cluster.ts`, which spawns `APP_CLUSTER_WORKERS` Bun child processes running
the same entry. Each worker serves on `APP_PORT` with `reusePort`, and the kernel balances
connections (Linux). A crashed worker is respawned after 1 s; `SIGINT` / `SIGTERM` to the primary
stops every worker. Each worker also runs the BullMQ mail worker and keeps its own in-memory rate
limit counter.

## 3. Reuse-port without cluster mode

`APP_REUSE_PORT=true` binds with `SO_REUSEPORT`, so you can start N processes yourself (a process
manager, systemd, or `docker compose up --scale app=N` behind a load balancer) on one port. Do not
combine it with cluster mode.

## 4. Docker

The `Dockerfile` is multi-stage on `oven/bun:1.3-alpine`:

| Stage         | Purpose                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------- |
| `install`     | dev and prod `node_modules`, cached on `bun.lock`                                           |
| `development` | full source, `bun run dev`                                                                  |
| `build`       | `prisma generate` + `bun run build`                                                         |
| `migrator`    | Prisma CLI with dev deps; default command `prisma migrate deploy`                           |
| `release`     | prod deps + `dist/` + `prisma/generated`, non-root `bun` user, runs `bun run dist/index.js` |

```bash
docker build --target release -t clean-hono-prisma .
docker run --env-file .env -p 3000:3000 clean-hono-prisma
```

### Compose

`docker-compose.yml` runs `postgres`, `redis`, `clickhouse`, and `app` (the `release` target) on the
`app_network` bridge. `app` reads `.env`; inside the network use service hostnames:

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hono_clean
REDIS_HOST=redis
CLICKHOUSE_HOST=http://clickhouse:8123
```

```bash
make docker-up        # docker compose up -d --build
make docker-migrate   # build the migrator image, run migrate deploy on the compose network
make docker-seed      # same image, runs bun run db:seed
make docker-logs
make docker-down
```

`docker-migrate` and `docker-seed` join `<directory>_app_network`; pass `DOCKER_NETWORK=...` if you
renamed the directory.

### Git-pull deployment

```bash
make docker-deploy    # git pull, docker compose up -d --build, docker-migrate
```

## Migrations

- `prisma migrate deploy` applies pending migrations and never generates new ones — use it in every
  non-local environment (`make db-migrate`, the migrator image).
- `prisma migrate dev` (`make db-migrate-dev`) is for local development only.
- Run migrations before starting the new release.

## Checklist

See the deployment checklist in [`SECURITY.md`](./SECURITY.md).
