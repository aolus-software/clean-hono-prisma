# Documentation Upkeep Rule

## Principle: docs are part of the change, not an afterthought

When a change makes a documentation file wrong, fixing that doc belongs to the **same change** — not
a follow-up, not "later". Code and docs are committed together so the repository never carries
documentation that contradicts the code.

This is not a mandate to rewrite docs on every commit. It is: **if you changed something a doc
describes, update that doc in the same change.** If nothing a doc covers changed, leave it alone.

This is about _keeping existing documentation true_, not about _inventing_ new documentation. Do not
create new `.md` files nobody asked for — but never leave a doc contradicting the code you just
wrote.

## Docs that must stay in sync

| Doc                                     | Update it when…                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md`                             | setup steps, `package.json` scripts, env vars, the project-structure tree, the Docker section, or the architecture summary change — its "Scripts" and "Makefile Commands" sections quote both |
| `CLAUDE.md`                             | a path alias, the bootstrap order, the layering description, a convention, a `docs/` reference, or a new module / middleware / runtime surface changes                                      |
| `Makefile`                              | a command is added, renamed, or removed. The `.PHONY` line, the `help:` block, and the recipe move together, plus `README.md`, which quotes them                                            |
| `docker-compose.yml`, `Dockerfile`      | a service, port, volume, or build stage changes — `docker-migrate` / `docker-seed` build the `migrator` target and join `$(DOCKER_NETWORK)`, so a renamed stage or network breaks the `Makefile` |
| `.env.example`                          | any new env var — `docs/CONFIGURATION.md` and the `README.md` configuration section describe the same set                                                                                  |
| `src/libs/config/env.ts`                | a new env var is read. It is validated in `cleanEnv(...)` there or nowhere; `process.env` is never read directly elsewhere                                                                 |
| `prisma/schema.prisma` + `prisma/migrations/` | a model, field, enum, or relation changes — `make db-migrate-dev` and commit the new migration folder. Never hand-edit an applied migration. If a fresh database needs different data, `src/libs/database/seed/` moves with it |
| `docs/API_DOCUMENTATION.md`             | a route is added, renamed, re-gated, or removed, or its request/response shape changes                                                                                                     |
| `docs/CONFIGURATION.md`                 | the env var reference drifts from `env.ts` / `.env.example`                                                                                                                                |
| `docs/DEPLOYMENT.md`                    | the Docker/compose flow, the migrator image, cluster mode, or the deploy sequence changes                                                                                                  |
| `docs/ERROR_HANDLING.md`                | an error class is added to `src/libs/hono/errors/` or `registerException`'s status mapping / response shape changes                                                                       |
| `docs/MIDDLEWARE.md`                    | a middleware is added to `src/libs/hono/middlewares/`, or the global stack in `src/app.ts` gains, drops, or reorders one                                                                   |
| `docs/SECURITY.md`                      | auth, tokens, guards, rate limiting, CORS, headers, or body limits change                                                                                                                  |
| `docs/README.md`                        | a file is added to or removed from `docs/` — it is the index                                                                                                                               |
| `src/libs/i18n/locales/{en,id}.json`    | a user-facing string is added — **both languages, in the same change**, then `bun run i18n:keys` (`keys.generated.ts` is generated, never hand-edited)                                     |
| `tsconfig.json` `paths`                 | a new `src/libs/<bucket>/` is added — the alias list in `CLAUDE.md` and the bucket table in `shared-code.md` must match it                                                                  |
| `.claude/rules/*.md`                    | a coded convention changes, or a new pattern ships with no rule yet. The index is `README.md` in this folder                                                                               |
| `.claude/rules/routes.md`               | any route is added, removed, re-pathed, or re-gated — it holds the live route map                                                                                                          |
| `.claude/commands/*.md`                 | a command's workflow or scope changes                                                                                                                                                      |
| `.github/copilot-instructions.md`       | a convention it illustrates changes — it mirrors `CLAUDE.md` and drifts silently                                                                                                           |
| `TODO.md`                               | an item it tracks ships or is dropped (`/update-todo` reconciles it)                                                                                                                       |

## What "up to date" means

- **Exact facts.** Path aliases, route paths, model and field names, env var names, permission
  strings, `package.json` scripts, and `make` targets must match reality.
- **No orphan references.** If you rename, move, or delete a file, function, permission, alias, or
  rule, update every doc that names it.
- **Permission strings are quoted verbatim.** They are space-separated (`"user list"`,
  `"role create"`, `"permission delete"`), seeded as `<group> <action>`. A doc or a route that invents
  a different spelling is a defect.
- **New surfaces get docs.** A new middleware, guard, queue/worker pair, repository, or external
  integration that establishes a pattern needs its rule written, not just its code.
- **The OpenAPI spec is documentation.** It is generated from `createRoute(...)` metadata, so a route
  is undocumented unless it declares `summary`, `description`, its request schemas, and a `responses`
  entry for every status code it can return. See `openapi.md`.
- **Barrel exports are part of the contract.** A new file under `src/libs/<bucket>/` that is not
  re-exported from that bucket's `index.ts` will not resolve through its alias.

## When a doc is wrong but the current task didn't cause it

Per `contradiction-halt.md`, if you notice a doc contradicting the code but fixing it falls outside
the requested task, **report it to the user** — do not silently rewrite unrelated docs. The "update
in the same change" duty covers the docs your own change affects.
