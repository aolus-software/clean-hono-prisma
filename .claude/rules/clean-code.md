# Rule: Clean code

Formatting and most type discipline are machine-enforced. This rule covers what the machine checks,
and the conventions it cannot check.

## The commands

| Task                  | Script                 | Make target      |
| --------------------- | ---------------------- | ---------------- |
| Lint                  | `bun run lint`         | `make lint`      |
| Lint and fix          | `bun run lint:fix`     | `make lint-fix`  |
| Format                | `bun run format`       | `make format`    |
| Check formatting only | `bun run format:check` | _(none)_         |
| Type check            | `bun run typecheck`    | `make typecheck` |

Run `bun run db:generate` first on a fresh clone: the Prisma client in `prisma/generated` is
gitignored, and every repository imports from it.

Reaching for `// eslint-disable-next-line` to silence a rule is a last resort. The existing disables
are `no-console` in code that runs before or outside the logger (`src/server.ts`, `src/cluster.ts`,
`src/bull/index.ts`, the seeder, and the standalone scripts under `src/libs/**/scripts/`), and a
small number of `no-explicit-any` at framework boundaries (the zod-openapi `defaultHook`). Application
code (modules, services, repositories) has none, and should stay that way.

## Formatting (Prettier, `.prettierrc`)

Tabs for indentation. Double quotes. Semicolons. Trailing commas. Don't hand-align, and don't
reformat a file you didn't otherwise touch.

## Types

- `@typescript-eslint/no-explicit-any` is an **error**. Use `unknown` and narrow.
- `strict` is on (`tsconfig.json`).
- **Explicit return types on every exported function and every service/repository method.** ESLint
  does not enforce this; it is on you.
- Use the Prisma-generated types (`Prisma.UserWhereInput`, `UserStatus`) inside repositories; services
  and routes see the DTOs in `@types`.

## Promises

`@typescript-eslint/no-floating-promises` is an **error**. Every promise is `await`ed, `return`ed, or
explicitly `void`ed. Background work goes to BullMQ (`queue.md`), which is itself awaited when
enqueued.

## Logging

Treat `console.*` as forbidden. Use the structured pino `logger` from `@utils`, **object first,
message second**:

```ts
logger.info({ userId: user.id }, "Verification email queued");
logger.error({ error, userId }, "Failed to queue verification email");
```

Never log a password, a token, or a token-bearing URL.

## Comments

One block comment above a function, class, or genuinely non-obvious block, explaining **what and
why**. No line-by-line narration. Delete commented-out code rather than shipping it.

## Don't

1. No emoji, icons, or decorative symbols — in code, comments, log messages, catalogs, templates, or
   generated files.
2. No `console.*` outside the listed boot paths.
3. No `any`.
4. No unawaited promise.
5. No `process.env` access outside `@config` (see `hono.md`).
6. No new README, CHANGELOG, or docs file unless it was asked for. Keeping an existing doc true is a
   different obligation — see `documentation.md`.
