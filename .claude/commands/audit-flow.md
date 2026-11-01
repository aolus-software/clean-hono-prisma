---
name: audit-flow
description: "Read-only whole-codebase audit of this Hono + Prisma backend for auth/token flow contradictions, RBAC gaps, soft-delete correctness, secrets at rest, i18n parity, dead code/validation, shared-code placement, response-contract drift, and doc drift. Writes explained findings (what it is · why · what it costs · what to do) to docs/audit-findings.md. Never modifies application code."
risk: safe
source: local
---

# Audit Flow

Run a structured, **read-only** audit of this backend and record the results in
`docs/audit-findings.md`. This command **never changes application code, schemas, migrations, seeds,
or config** — its only output is the findings document.

`$ARGUMENTS` (optional) narrows scope to specific categories or paths (e.g. `audit-flow auth rbac`,
`audit-flow src/modules/settings`). **With no arguments, sweep the entire codebase** as defined under
"What a full sweep covers".

## How to run it

1. **Read the ground truth first**: `CLAUDE.md`, every `.claude/rules/*.md`, and
   `.claude/rules/audit-findings.md` in particular — the writing contract. A finding is always "code
   vs stated intent", never "code vs the auditor's taste". Where no rule states an intent, say so.
2. **Build the inventory before dispatching anything**: every folder under `src/modules/`, every
   bucket under `src/libs/`, every model in `prisma/schema.prisma`, every folder in
   `prisma/migrations/`, and every queue/worker pair in `src/bull/`. The Coverage section is written
   from this list.
3. **Dispatch parallel read-only `Explore` subagents** — one per category below, each given its slice
   of the inventory so every file has an owner.
4. **Each subagent returns evidence, not prose**: `file:line` for every claim, the intended behaviour
   per the rules, what the code does, the gap, and **CONFIRMED** (traced end to end) or **SUSPECT**
   (plus what would settle it).
5. **Write the findings up yourself, in the main thread**, with the five blocks required by
   `.claude/rules/audit-findings.md`: **Where** · **What this is** · **Why this can happen** ·
   **What it costs** · **What we should do**.
6. **Write the Coverage section** — what was reached, and what was deliberately not.
7. **Write "Top priorities" last**, ordered security → data integrity → correctness → hygiene/doc.
8. **Report a short summary to the user. Do not fix anything.**

## What a full sweep covers

| Area | Includes |
|---|---|
| `src/index.ts`, `src/server.ts`, `src/cluster.ts`, `src/app.ts`, `src/bootstrap.ts` | boot order, cluster mode and reuse-port, the global middleware stack, `registerException`, DI registrations |
| `src/modules/auth/**` | login, refresh, register, email verification, forgot/reset password, and their Zod schemas |
| `src/modules/settings/**` | `users`, `roles`, `permissions`, `select-options` — the RBAC catalogue every guard depends on |
| `src/modules/profile/**`, `src/modules/home/**` | self-service surface, the public surface, `/docs` gating |
| `src/libs/hono/**` | `AuthMiddleware`, guards, the other middlewares, errors and their status mapping, shared schemas, the container |
| `src/libs/database/postgres/**` | Prisma client, repositories: soft-delete filters, sort/filter allow-lists, transaction threading |
| `src/libs/database/seed/**` | permission catalogue, grants, idempotency, exit code |
| `prisma/**` | `schema.prisma`, `migrations/`, `prisma.config.ts` |
| `src/libs/database/redis/**`, `src/libs/cache/**` | cache keys, TTLs, invalidation on write |
| `src/libs/database/clickhouse/**` | optional analytics client and migration runner |
| `src/libs/utils/**`, `src/libs/default/**` | `Hash`, `JWTToolkit`, `StrToolkit.random`, `ResponseToolkit`, `DatatableToolkit`, token lifetimes |
| `src/libs/config/**` | `env.ts` validation and the derived config objects |
| `src/libs/i18n/**` | `locales/en.json` and `locales/id.json` parity |
| `src/libs/mail/**`, `src/bull/**` | templates, send-email queue/worker: retry, re-throw, failure logging |
| repo root | `Makefile`, `.env.example`, `Dockerfile`, `docker-compose.yml`, `package.json` scripts, `.husky/`, `.github/workflows/ci.yml` |

**Deliberately out of scope** (state this in Coverage): `node_modules/`, `dist/`, `prisma/generated/`,
`storage/`, lockfiles, and `.agents/skills/` (vendored; `.claude/skills` symlinks to it).

## Categories to cover

1. **Auth & token flows** — register → verify-email → login, forgot-password → reset-password, and
   login → refresh: expiry and `usedAt` checks, revoke-on-issue, lifetimes from `@default` computed at
   issue time, crypto RNG for tokens, the `type` claim separating access from refresh, the refresh
   secret, what `AuthMiddleware` puts on the context.
2. **Access control** — every route's `createRoute({ middleware })`: a protected route missing
   `AuthMiddleware`, an authenticated route with no guard, a guard attached with `.use()`, a
   permission string the seeder does not produce, the `superuser` short-circuit.
3. **Ownership & self-service boundaries** — `src/modules/profile/**` and any route taking an
   arbitrary `{id}`. Privilege escalation is 🔴 and sorts first.
4. **Soft delete & data integrity** — every `User` read filtering `deletedAt: null`, live-email
   uniqueness enforced in the service, cascade behaviour on join and token tables, transactions opened
   by the service.
5. **Secrets & sensitive data** — password hashes, JWT secrets, tokens, `APP_KEY` absent from logs,
   responses, response schemas, OpenAPI examples, and repository `select`s; env read only via
   `@config`.
6. **i18n parity** — same keys and placeholders in both catalogues; user-facing literals that bypassed
   `t()`.
7. **Response-contract completeness** — routes whose `responses` omit a status the handler can return;
   missing `summary` / `description` / `tags` / `security`; hand-built envelopes.
8. **Dead code, unused fields & validation** — Zod fields the service never reads, enum unions
   restated instead of reused from Prisma, allow-lists that drifted from the schema.
9. **Shared-code placement** — module code another module needs, cross-module relative imports, a
   bucket export missing from its `index.ts`.
10. **Caching & queues** — a cached `UserInformation` not invalidated when status, roles, or
    permissions change (a **security** finding); mail enqueued inside a transaction.
11. **Data model & migrations** — `schema.prisma` versus the migrations, an edited applied migration,
    missing indexes on columns repositories filter or sort by.
12. **Documentation drift** — `CLAUDE.md`, `README.md`, `docs/*`, `.claude/rules/*` versus the code:
    env var names, permission strings, aliases, `Makefile` targets, the route map in `routes.md`.

## Rules for this command

- **Read-only.** Report, do not act (`.claude/rules/contradiction-halt.md`). The findings document is
  the one file this command writes.
- **Writing format is governed by `.claude/rules/audit-findings.md`.**
- **Prefer updating the existing `docs/audit-findings.md`** over a new file. Never renumber.
- **Cite `file:line` for every finding.**
- **There is no test runner configured.** Do not report test results.
