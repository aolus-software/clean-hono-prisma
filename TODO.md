# clean-hono-prisma - TODO

> Updated: 2026-10-31

The project started as a Prisma port of `clean-hono`. It now follows the shared clean-arc contract
(the `clean-elysia` route map, envelope, env vocabulary, and `.claude` layout), with Prisma physical
details taken from the Prisma sibling.

---

## Done

- [x] Project setup: TypeScript, ESLint, Prettier, Husky pre-commit hook, `package.json` scripts
- [x] Prisma schema with default names, migrations, seeder (15 permissions, superuser + admin, idempotent)
- [x] Repositories with sort/filter allow-lists and soft delete
- [x] Auth: login, refresh, register, verify email, resend verification, forgot/reset password
- [x] Profile, settings users / roles / permissions / select-options with per-route RBAC guards
- [x] BullMQ mail queue and worker, i18n (en / id)
- [x] Cluster mode (`APP_CLUSTER_MODE`)
- [x] `Dockerfile` (multi-stage), `docker-compose.yml` app service, Docker `make` targets
- [x] CI: lint, format check, typecheck, Prisma validate / migrate / drift check, build
- [x] `docs/`, `.github/` templates, `CONTRIBUTING.md`, `SECURITY.md`

## Pending

- [ ] Test runner and tests (deferred across the clean-arc repos)
- [ ] Shared rate-limit store so cluster workers share one budget
- [x] Refresh-token revocation (per-user `jti` in Redis, rotated on refresh)
