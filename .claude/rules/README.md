# Project Rules

Coding rules for the `clean-hono-prisma` codebase (Bun + Hono + `@hono/zod-openapi` + Prisma +
PostgreSQL). Each file is a focused, enforceable contract — read the relevant one before writing code
in that area. Rules carry no frontmatter; the scope is stated below and in each file's opening line.

## Always in scope

| Rule                                             | Scope                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [contradiction-halt.md](./contradiction-halt.md) | A request that contradicts a rule, the architecture, or a security invariant is reported and halted. Lists the invariants |
| [documentation.md](./documentation.md)           | A doc your change makes wrong is fixed in the **same** change; lists every doc that must stay in sync       |
| [audit-findings.md](./audit-findings.md)         | How an audit finding is written — the writing contract for [`/audit-flow`](../commands/audit-flow.md)       |
| [clean-code.md](./clean-code.md)                 | Formatting, explicit types, no `any`, no `console.*`, comment density                                       |
| [hono.md](./hono.md)                             | Layering (`route → service → repository`), reuse-before-you-build, config, the global stack                 |

## Layer rules

Ordered outside-in, the way a request travels.

| Rule                                   | Applies to                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [middleware.md](./middleware.md)       | `src/libs/hono/middlewares/` and the global stack in `src/app.ts`                              |
| [rbac.md](./rbac.md)                   | `AuthMiddleware`, `permissionGuard` / `roleGuard`, per-route `middleware`, the seeded vocabulary |
| [modules.md](./modules.md)             | `src/modules/<name>/` — the four-file layout and how modules compose                           |
| [routes.md](./routes.md)               | Path and method conventions, and the **live route map**                                        |
| [handlers.md](./handlers.md)           | `routes.ts` — what a handler may do, the contract every route declares                         |
| [handlers-crud.md](./handlers-crud.md) | The canonical five-route CRUD module and its status codes                                      |
| [validation.md](./validation.md)       | `schema.ts` — Zod schemas, naming, formats, list queries                                       |
| [openapi.md](./openapi.md)             | Route metadata that generates `/docs`; the `ENABLE_API_DOCS` switch                            |
| [services.md](./services.md)           | Service classes, transactions, cache invalidation, queue-after-commit                          |
| [services-crud.md](./services-crud.md) | The canonical CRUD service, which **owns existence and uniqueness checks** (422)               |
| [repositories.md](./repositories.md)   | Prisma repository factories, `tx?`, soft delete, sort/filter allow-lists                       |
| [schema.md](./schema.md)               | `prisma/schema.prisma` — default names, enums, token tables, migrations                        |
| [shared-code.md](./shared-code.md)     | `src/libs/<bucket>/`, aliases, barrels, no cross-module imports                                |
| [di.md](./di.md)                       | The container, `src/bootstrap.ts`, `diMiddleware`, `Variables`                                 |

## Cross-cutting concerns

| Rule                                             | Scope                                                         |
| ------------------------------------------------ | ------------------------------------------------------------- |
| [errors-and-responses.md](./errors-and-responses.md) | The envelope, the error classes, the status code per case  |
| [i18n.md](./i18n.md)                             | Catalog keys, `en`/`id` together, `bun run i18n:keys`         |
| [mail.md](./mail.md)                             | Queued mail, templates, token mails                           |
| [queue.md](./queue.md)                           | BullMQ queue/worker pairs                                     |
| [rate-limiting.md](./rate-limiting.md)           | The global limiter; credential endpoints never loosened       |
| [imports-and-naming.md](./imports-and-naming.md) | Aliases, import order, file and symbol naming                 |
| [commit.md](./commit.md)                         | Conventional Commits and the pre-commit hook                  |

## How to use

- These rules complement `CLAUDE.md`. When a rule conflicts with `CLAUDE.md`, the rule wins (it is
  more specific) — and the conflict is a documentation bug to fix (`documentation.md`).
- Don't introduce a new pattern without updating or adding the rule first.

## Settled decisions

- **Uniqueness conflicts are 422**, never 409 or a raw Prisma 500 (`services-crud.md`).
- **The service owns existence and uniqueness checks**; repositories return `null`
  (`services-crud.md`).
- **Guards live in the route's `middleware` array**, never `.use()` (`rbac.md`).
