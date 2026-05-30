# Rule: Imports & Naming

## Path aliases

Always use aliases for cross-layer imports. **Never** use relative paths like `../../libs/...`.

| Alias          | Maps to                          |
| -------------- | -------------------------------- |
| `@config`      | `src/libs/config/`               |
| `@cache`       | `src/libs/cache/`                |
| `@default`     | `src/libs/default/`              |
| `@mail/*`      | `src/libs/mail/`                 |
| `@database`    | `src/libs/database/`             |
| `@database/*`  | `src/libs/database/*/`           |
| `@hono-libs`   | `src/libs/hono/`                 |
| `@hono-libs/*` | `src/libs/hono/*/`               |
| `@errors`      | `src/libs/hono/errors/`          |
| `@guards`      | `src/libs/hono/guards/`          |
| `@utils`       | `src/libs/utils/`                |
| `@utils/*`     | `src/libs/utils/*/`              |
| `@types`       | `src/libs/types/`                |
| `@modules`     | `src/modules/`                   |
| `@modules/*`   | `src/modules/*/`                 |
| `@bull`        | `src/bull/`                      |
| `@bull/*`      | `src/bull/*/`                    |

Relative imports are allowed **only** within the same module (`./schema`, `./service`).

## Import order

Group imports in this order, separated by a blank line:

1. **External libraries** — `hono`, `@hono/zod-openapi`, `drizzle-orm`, `bullmq`, etc.
2. **Aliases**, ordered by dependency direction: `@config` → `@database` → `@errors` → `@types` → `@utils` → `@hono-libs` → `@guards` → others.
3. **Relative imports** — only from inside the current module.

## File naming

- **kebab-case + role suffix:**
  - `user.repository.ts`
  - `auth.service.ts`
  - `di.middleware.ts`
  - `send-mail-worker.ts`
  - `send-mail-queue.ts`
- Module entry: `routes.ts`, schemas: `schema.ts`, services: `service.ts`, interfaces: `service.interface.ts`.

## Symbol naming

- Repositories: `PascalCaseRepository` factory (`UserRepository`)
- Services: `PascalCaseService` plain-object export (`AuthService`)
- Middlewares: `camelCaseMiddleware` (`authMiddleware`, `diMiddleware`)
- Guards: `PascalCase` (`Guards.userManagement.list()`, `PermissionGuard`)
- Modules/Routers: route instance variable
- Schemas: `PascalCase` ending in `Schema` (`LoginSchema`, `UserListSchema`)
- Types: `PascalCase` (`UserInformation`, `DatatableType`)
- Cache key builders: `<Concept>CacheKey` function exported from `@cache`

## TypeScript

- Strict mode is on (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`).
- `any` is an **error** — use `unknown` + narrowing.
- `no-floating-promises` is an error — `await` or `void` every promise.
- No `console.log` — use `log` from `@utils`. Existing exceptions have `eslint-disable-next-line` comments.
- Comments only when the **why** is non-obvious. No inline narration of obvious code.
