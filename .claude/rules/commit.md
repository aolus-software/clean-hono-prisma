# Rule: Commits

## Message format

Conventional Commits: `feat`, `fix`, `chore`, `refactor`, `docs`, `db`, `test`. The summary is
lowercase after the colon, imperative mood, under 72 characters, no trailing period.

```
feat: add refresh token endpoint
fix: attach rbac guards before route handlers
chore: regenerate i18n translation keys
```

The full workflow — how to gather context, how to stage, how to write the body — lives in
`.claude/commands/commit.md`. It is the authority when the two ever drift.

## The pre-commit hook

There **is** a Husky hook at `.husky/pre-commit`. It runs, in order:

```
bun install
bun run format
bun run lint:fix
bunx --bun prisma validate
bunx --bun prisma format
bunx --bun prisma migrate dev
bunx --bun prisma generate
bun run tsc --noEmit
bun run build
```

Three things follow from that.

**It is not lint-staged.** There is no `lint-staged` dependency. The hook runs on the **whole tree**,
not on staged files.

**It touches the database and the migrations folder.** `prisma migrate dev` can create a new folder
under `prisma/migrations/` and applies it to whatever `DATABASE_URL` points at. Check `git status`
after the hook and stage or discard what it produced deliberately.

**It is slow.** `.claude/commands/commit.md` permits `--no-verify` on one condition: you have already
run `format`, `lint`, `typecheck`, and `build` in this session and they passed clean, and the change
touches no schema. Otherwise let the hook run, and if it fails, fix the cause, re-stage, and make a
**new** commit — never `--amend` over a failed hook.

## Before you commit

If you are skipping the hook, you owe it these manually:

```
bun run format:check
bun run lint
bun run typecheck
bun run build
```

## Never commit

1. `.env` or any `.env.*.local`.
2. Secrets, keys, tokens, or a real `DATABASE_URL` / SMTP credential in a config default or fixture.
3. `node_modules/`, `dist/`, `prisma/generated/`, or the compiled `server` binary.
4. Migration folders the hook generated as a side effect of an unrelated change.
5. A hand-edited `src/libs/i18n/locales/keys.generated.ts`. Regenerate with `bun run i18n:keys`.
6. Formatting churn in files the change did not otherwise touch.
7. `skills-lock.json` (gitignored).

## Staging

Stage by explicit path. `git add -A` and `git add .` are forbidden by `.claude/commands/commit.md` —
the hook generates files, and blanket staging picks them up silently.
