# Skills

Vendored Claude Code skills for this repository. `.claude/skills` is a relative symlink to this
directory (`ln -s ../.agents/skills .claude/skills`), so a skill added here is available immediately.
Each skill is a folder with a `SKILL.md` (frontmatter `name` + `description`, then instructions).

The bundle is tracked in git; `skills-lock.json` is gitignored, so drift from the sibling clean-arc
repositories is detected by diffing this directory. Do not edit these as part of unrelated work.

## Workflow and process

| Skill | Use it to |
| --- | --- |
| `brainstorming` | explore intent and design before building |
| `writing-plans` | turn a spec into a reviewable step-by-step plan |
| `executing-plans` | execute a written plan with checkpoints |
| `subagent-driven-development` | fan independent tasks out to subagents |
| `dispatching-parallel-agents` | run independent tasks in parallel |
| `test-driven-development` | write the failing test first (no runner is configured yet) |
| `systematic-debugging` | reproduce, isolate, and verify a fix |
| `verification-before-completion` | run the gates before claiming done |
| `requesting-code-review` / `receiving-code-review` | ask for and act on review |
| `finishing-a-development-branch` | decide how to integrate finished work |
| `using-git-worktrees` | isolate work in a worktree |
| `using-superpowers` | discover and use skills |
| `writing-skills` | author or change a skill |
| `find-skills` | find an installable skill |
| `grill-me` / `grill-with-docs` | stress-test a plan, optionally against the docs |
| `handoff` | compact a session into a handoff document |
| `caveman` | terse output mode |

## Engineering

| Skill | Use it for |
| --- | --- |
| `hono` | Hono routing, middleware, validation, testing |
| `prisma-client-api` | Prisma Client queries, filters, transactions |
| `postgres` / `postgresql-optimization` | PostgreSQL queries, indexes, tuning |
| `typescript-advanced-types` / `typescript-pro` | advanced TypeScript typing |
| `clean-code` | refactoring toward clean code |
