---
name: update-todo
description: "Reconcile TODO.md with the actual codebase state — mark done items, leave pending ones, refresh the date."
risk: safe
source: local
---

Analyze the current codebase state and update `TODO.md` at the project root to accurately reflect what is done and what is pending. If `TODO.md` does not exist, tell the user and stop — do not create one unless asked.

## Steps

### 1. Read TODO.md

Read the whole file.

### 2. Inspect codebase state (run in parallel)

```bash
git log --oneline -20
git status
```

Then read the sources each item refers to:

- `src/modules/` — feature modules (routes, schemas, services)
- `src/libs/` — shared code, repositories, config
- `prisma/schema.prisma` and `prisma/migrations/` — data model state
- repo files (`Dockerfile`, `Makefile`, `.github/`, `docs/`)

### 3. Update TODO.md

- Mark items `[x]` only when the implementation actually exists and is complete.
- Leave `[ ]` for not-started or partial items.
- Update the `> Updated: YYYY-MM-DD` line at the top to today's date.
- Do NOT add new items unless the user asks — only reflect actual state.
- Do NOT remove unfinished items.

### 4. Report

Summarize what changed: how many items were marked complete, which ones, and what remains. Do NOT commit unless the user explicitly asks.
