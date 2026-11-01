---
name: commit
description: "Stage and commit current changes with a Conventional Commit message derived from the diff. The Husky pre-commit hook runs install, format, lint, Prisma validate/format/migrate/generate, typecheck and build against the whole tree."
risk: safe
source: local
---

Commit the current working-tree changes.

Run these in parallel first to gather context:

- `git status` (no `-uall`)
- `git diff` (staged + unstaged)
- `git log --oneline -20` to match the existing commit-message style

Then:

1. Review the diff and decide the prefix by intent (`feat`, `fix`, `chore`, `refactor`, `docs`, `db`, `test`).
2. Stage files explicitly by path — **never** `git add -A` / `git add .`. Skip `.env`, credentials, `dist/`, `prisma/generated/`, `node_modules/`, `skills-lock.json`, and anything that looks sensitive or like build output.
3. Write a concise 1–2 sentence message focused on **why**, not a file list. Lowercase after the colon, imperative, under 72 characters.
4. Create the commit with a HEREDOC body (no `--amend`).
5. Run `git status` after to confirm the working tree is clean, and check whether the hook created a migration folder under `prisma/migrations/` that does not belong to this change.

If the pre-commit hook fails, **do not** `--amend` — fix the cause, re-stage, and create a new commit.

Do not push unless explicitly asked.

## Skipping the hook

`--no-verify` is allowed only if `bun run format`, `bun run lint`, `bun run typecheck`, and `bun run build` already ran clean in this session **and** the change touches no Prisma schema. See `.claude/rules/commit.md`.
