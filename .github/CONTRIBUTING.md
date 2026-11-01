# Contributing

Thanks for considering a contribution. This repository is a **starter template**, so changes are
judged by whether most projects built on it would benefit — not by whether they are useful in one
specific application.

## Before you start

Read these first; they are the source of truth for how code is written here:

- **`CLAUDE.md`** — bootstrap order, layering, the middleware chain, and the non-obvious behaviours
  worth knowing (DI registration, worker boot via `@bull`, the error → status mapping, cluster mode).
- **`.claude/rules/`** — area-scoped standards. Read the matching one before you touch that area. The
  index is `.claude/rules/README.md`; the most used are:
  - `shared-code.md` — which `src/libs/<bucket>/` a shared thing belongs in, and the barrel rule
  - `modules.md` — the four-file feature module (`routes.ts`, `schema.ts`, `service.interface.ts`,
    `service.ts`)
  - `repositories.md` — the factory-function repository shape and `tx?: Prisma.TransactionClient`
  - `rbac.md` — how guards are attached to a route, and the seeded permission vocabulary
  - `openapi.md` — the route metadata that generates `/docs`
  - `queue.md` — BullMQ queue/worker pairs under `src/bull/`
  - `di.md` — the container and `diMiddleware`
- **`docs/`** — `CONFIGURATION.md` (env vars), `MIDDLEWARE.md`, `ERROR_HANDLING.md`, `SECURITY.md`,
  `API_DOCUMENTATION.md`, `DEPLOYMENT.md`.
- `.github/copilot-instructions.md` has extended code-style examples that mirror the rules above.

For anything larger than a bug fix, open an issue first so the design can be agreed before you spend
time on it.

## Local setup

The runtime is **Bun**, not Node. Always use `bun run` / `bunx` — never `npm`, `pnpm`, or `yarn`.

```bash
git clone https://github.com/aolus-software/clean-hono-prisma.git
cd clean-hono-prisma
bun install
cp .env.example .env                  # then set JWT_SECRET and JWT_REFRESH_SECRET
docker compose up -d postgres redis   # Postgres 18 + Redis 8 (add clickhouse if you need it)
make db-generate                      # generate the Prisma client
make db-migrate                       # apply migrations (prisma migrate deploy)
make db-seed                          # superuser@example.com / S3crEtP4ssw0rd!
make dev
```

The API listens on `APP_PORT` (default 3000). The Scalar API reference is at `/docs` (spec at
`/docs/openapi.json`) only when `ENABLE_API_DOCS=true`, which `.env.example` sets for local work.

Useful commands — every `make` target wraps the matching `bun run` script or Prisma CLI call:

```bash
make help             # every available target
bun run dev           # hot-reload dev server
bun run lint          # eslint . --ext .ts,.js
bun run lint:fix
bun run format        # prettier --write .
bun run format:check  # prettier --check . (what CI runs)
bun run typecheck     # tsc --noEmit
bun run build         # typecheck + bundle to dist/ (+ mail templates)
bun run start         # run dist/index.js
make db-generate      # prisma generate
make db-migrate       # prisma migrate deploy
make db-migrate-dev   # prisma migrate dev (create a migration)
make db-push          # prisma db push (dev only)
make db-studio        # prisma studio
make db-seed          # idempotent
make fresh            # db-drop + db-push + db-seed (dev only, destroys data)
make reset            # db-generate + db-migrate + db-seed
```

There is **no test runner configured**. Don't add `bun test` commands to docs or CI unless you are
also adding the tests and the runner in the same PR.

### Running the whole stack in Docker

```bash
make docker-up        # docker compose up -d --build
make docker-migrate   # build the migrator target and run migrations on the compose network
make docker-seed
make docker-logs      # tail app logs
make docker-ps
make docker-down
make docker-deploy    # git pull + build + up + migrate (server deploy)
```

`docker-migrate` derives the network name from the directory name (`<dir>_app_network`); if you
renamed the directory, pass `DOCKER_NETWORK=...`. Keep `.env` values **unquoted** —
`docker run --env-file` passes quotes literally. Inside compose, use service hostnames (`postgres`,
`redis`, `clickhouse`), not `localhost`.

## Coding standards

The full set is in `.claude/rules/`. The parts that come up most:

- **Style** — tabs, double quotes, semicolons (Prettier). Let `bun run lint:fix` order imports.
- **Types** — TypeScript `strict`. `no-explicit-any` is an **error**.
- **Promises** — `no-floating-promises` is an error. Always `await` or `void`.
- **Logging** — never `console.*`; use the structured `logger` (pino) from `@utils`. The only
  exceptions are the boot banners that already carry `eslint-disable-next-line`.
- **Path aliases** — `@config`, `@cache`, `@default`, `@mail/*`, `@database`, `@hono-libs`, `@errors`,
  `@guards`, `@utils`, `@types`, `@modules`, `@bull`, `@i18n`, `@prisma-generated`. Import from the
  bucket root, never with a relative path that climbs out of a module.
- **File naming** — kebab-case with role suffixes (`.repository.ts`, `.middleware.ts`, `.guard.ts`,
  `.config.ts`), and the fixed `routes.ts` / `schema.ts` / `service.ts` inside modules.
- **Layering** — `routes.ts` handles HTTP only; `service.ts` owns business logic, existence and
  uniqueness checks, transactions, cache invalidation, and queue dispatch; repositories own Prisma
  queries and nothing else. Routes never import `db`.
- **Services** are classes implementing an `I<Name>Service` interface, registered in
  `src/bootstrap.ts` and read in handlers with `c.get("<name>Service")`. Repositories are **factory
  functions** invoked at each call site (`await UserRepository().findLiveByEmail(email)`).
- **Responses** — wrap successes with `ResponseToolkit`; throw error classes from `@errors` for
  failures. Never build an error envelope by hand.
- **Authorization** — attach guards in the route definition:
  `createRoute({ middleware: [AuthMiddleware, permissionGuard(["user list"])], ... })`. Never call
  `.use()` for a guard after the handler, and never check permissions inside the handler. Permission
  strings must match the seeded catalogue (`<group> <action>`).
- **OpenAPI** — every route needs its Zod schemas, `summary`, `description`, and `responses` for
  every status code it can really return.
- **Env** — never read `process.env` directly. Add the variable to the envalid schema in
  `src/libs/config/env.ts`, expose it through a `@config` object, and document it in `.env.example`
  and `docs/CONFIGURATION.md`.
- **i18n** — no hardcoded user-facing strings. Add the key to **both**
  `src/libs/i18n/locales/en.json` and `id.json`, then run `bun run i18n:keys` and commit the
  regenerated keys.

## Adding a feature module

1. Create `src/modules/<name>/{routes.ts,schema.ts,service.interface.ts,service.ts}`.
2. In `routes.ts`: `new OpenAPIHono<Env>({ defaultHook })`, one `createRoute(...)` per endpoint with
   `middleware: [AuthMiddleware, ...guards]` for protected routes, then `.openapi(route, handler)`.
3. Register the router in `src/modules/index.ts` (or its group parent, e.g.
   `src/modules/settings/index.ts`).
4. Register the service in `src/bootstrap.ts`, inject it in `diMiddleware`, and add it to `Variables`
   in `src/libs/types/hono/app.types.ts`.
5. New repositories go in `src/libs/database/postgres/repositories/` and are re-exported from that
   folder's `index.ts`.

## Database changes

Edit `prisma/schema.prisma` (Prisma default model and column names — no `@@map` / `@map`), then:

```bash
make db-migrate-dev   # prisma migrate dev: writes prisma/migrations/<timestamp>_<name>/ and applies it
make db-generate      # regenerate the client if you did not use db-migrate-dev
```

Commit the new migration folder. CI validates and formats the schema, applies every migration to a
real Postgres service, and **fails if `prisma migrate diff` finds drift** between the migrated
database and `schema.prisma`.

Never hand-edit a migration that has already been applied. Review every migration for destructive
operations before committing; a rename that Prisma renders as drop-and-create must be rewritten by
hand. Users are soft-deleted — new user read paths must include `deletedAt: null`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), lowercase after the colon, imperative
mood, under 72 characters, no trailing period:

```
feat(users): add bulk status update endpoint
fix(auth): reject refresh tokens on protected routes
docs: document the docker deploy targets
chore: bump hono to 4.12.24
```

Types used here: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `db`.

> **Warning — the pre-commit hook touches your database.** The Husky `pre-commit` hook runs, in
> order:
>
> ```sh
> bun install
> bun run format
> bun run lint:fix
> bunx --bun prisma validate
> bunx --bun prisma format
> bunx --bun prisma migrate dev
> bunx --bun prisma generate
> bun run tsc --noEmit
> bun run build
> ```
>
> `prisma migrate dev` **creates and applies migrations against the `DATABASE_URL` in your `.env`**.
> Know what that URL points at before you commit; never let it point at a shared or production
> database. `bun install` can also rewrite `bun.lock`, and the whole pipeline takes a while.
>
> If you have already run format, lint, typecheck, and build yourself and your change touches no
> schema, `git commit --no-verify` is reasonable.

## Pull requests

1. Branch off `main`.
2. Keep the PR focused — one concern per PR.
3. Fill in the pull request template, including the checklist.
4. Make sure `bun run lint`, `bun run format:check`, `bun run typecheck`, and `bun run build` pass.
   CI (`.github/workflows/ci.yml`) runs lint, prettier check, typecheck, the Prisma migration and
   drift checks against a real Postgres service, and the build.
5. Update the docs your change affects **in the same PR** — `README.md`, `CLAUDE.md`, the matching
   `.claude/rules/` file, `docs/CONFIGURATION.md` for new env vars, and the i18n catalogs for new
   strings.

## Reporting bugs and requesting features

Use the issue templates. Usage questions belong in
[Discussions](https://github.com/aolus-software/clean-hono-prisma/discussions), not issues. Security
vulnerabilities go through [SECURITY.md](SECURITY.md) — never a public issue.

## License

By contributing, you agree that your contributions are licensed under the MIT License that covers
this repository.
