# Contradiction Halt Rule

## Principle: the request can be wrong — surface it, don't silently "fix" it

The user (or a task, plan, or ticket) may ask for something that contradicts these rules, the
established architecture, or that would introduce a bug. **The user may be wrong, and that is
expected.** When you detect such a contradiction, **stop and tell the user, and do nothing else about
it** until they decide.

This applies whether the contradiction is with:

- a rule in `.claude/rules/*.md` or `CLAUDE.md`,
- the documented architecture or an existing pattern in the codebase — the
  `src/modules/<name>/routes.ts` → `service.ts` → `src/libs/database/postgres/repositories/*.repository.ts`
  layering, service classes registered in `src/bootstrap.ts`, the repository factory-function shape,
  barrel exports in every `src/libs/<bucket>/index.ts`,
- a latent bug the requested change would create or depend on, or
- a security / access-control invariant — guards attached through `createRoute({ middleware: [...] })`
  so they run before validation and the handler, `AuthMiddleware` rejecting anything that is not a
  valid **access** token, the soft-delete `deletedAt: null` filter on every user read, password
  hashing through `Hash` (`@utils`), token lifetimes from `@default` computed at issue time, the
  sort/filter allow-lists exported from each repository, and the `/docs` switch `ENABLE_API_DOCS`.

## What "do nothing" means

- **Do not implement the contradicting change**, not even a best-guess partial version.
- **Do not silently work around it** or quietly pick a different approach without saying so.
- **Do not fix the contradicting bug on your own initiative** as part of an unrelated task — report
  it and wait.

## What to do instead

1. State the contradiction plainly: what was requested, which rule / pattern / invariant it conflicts
   with (cite the rule file or `file:line`), and the concrete consequence — bug, data leak, broken
   contract, inconsistency.
2. If you have a compliant alternative, offer it as a recommendation — but still let the user choose.
3. Proceed once the user confirms. If they confirm the original request knowing the trade-off, that
   is their call to make, and you implement it in full.

## Scope

- This is a **halt-and-report** rule, not permission to refuse work. Once the user acknowledges the
  contradiction and decides, follow their decision.
- It does **not** apply to trivial style nits you can just conform to — match the surrounding code
  and move on. It applies to genuine contradictions with rules, architecture, security, or
  correctness.
- It does not license scope creep in the other direction either: noticing an unrelated defect means
  _reporting_ it, not fixing it inside the current change.

## Invariants and known sharp edges

Confirmed facts about this repository as it stands. Do not build on any of them without raising it
first:

- **Hono runs matching handlers in registration order, and `.use(path, mw)` ignores the method.** A
  guard registered with `.use()` after `.openapi(route, handler)` never protects that handler. Guards
  belong in the route's `middleware` array.
- **The in-memory rate limiter is per process.** In cluster mode every worker keeps its own counter.
- **Refresh tokens are stored, access tokens are not.** Each user has one live refresh-token id
  (`jti`) in Redis at `RefreshTokenCacheKey(id)`; `/auth/refresh` rejects any other `jti` and
  rotates it, and `revokeSessions` (`@cache`) deletes it on password change or reset, admin password
  reset, user delete, and a non-`ACTIVE` status update. An access token stays valid until it expires
  unless the user's cache entry is dropped and the database read then fails.
- **The `.agents/skills/` bundle is vendored.** `.claude/skills` is a symlink to `../.agents/skills`.
  Do not edit it as part of unrelated work.
- **There are no tests and no test runner.** `package.json` defines no test script. Do not cite a
  test as evidence that something is safe, and do not invent `bun test` commands.
