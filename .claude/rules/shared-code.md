# Rule: Shared code lives in `src/libs/`

If a piece of code is used by **more than one module** — or could plausibly be reused — it does **not** live inside `src/modules/`. It lives in `src/libs/<bucket>/`, behind one of the dedicated path aliases.

`src/modules/<name>/` is for code that is **specific to that one feature**. Routes, that feature's Zod schemas, that feature's service — nothing else. The moment a helper, middleware, error class, type, or repository is referenced from a second place, move it to `libs/`.

## The buckets (and what belongs in each)

| Bucket              | Alias          | Belongs here                                                                                      |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `libs/cache/`       | `@cache`       | Cache wrapper and cache-key builders (`UserInformationCacheKey`, …)                               |
| `libs/config/`      | `@config`      | Env-derived config objects (`AppConfig`, `DatabaseConfig`, `MailConfig`, …)                       |
| `libs/database/`    | `@database`    | `db` instance, Drizzle `schema`, table exports, `DbTransaction`, `RedisClient`, ClickHouse client |
| `libs/default/`     | `@default`     | Stable cross-feature constants (`StrongPassword`, `paginationLength`, `defaultSort`, …)           |
| `libs/hono/errors/` | `@errors`      | Custom error classes (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, …)                 |
| `libs/hono/guards/` | `@guards`      | Authorization guards (`PermissionGuard`, `RoleGuard`, `Guards.*`)                                 |
| `libs/hono/`        | `@hono-libs`   | Hono middlewares, core container, and shared Hono utilities                                       |
| `libs/mail/`        | `@mail`        | Mail transport, templates, and mail services                                                      |
| `libs/types/`       | `@types`       | Shared TypeScript types (DTOs, query-param types, enums)                                          |
| `libs/utils/`       | `@utils`       | Pure helpers (`Hash`, `log`, `ResponseToolkit`, `DatatableToolkit`, date/number/string utilities)  |

The BullMQ tree (`@bull` → `src/bull/`) sits beside `libs/` but follows the same "no module-local imports" principle.

## Hard rules

1. **No relative imports across modules.** A file in `src/modules/auth/` may not `import "../../profile/..."`. If two modules need the same thing, lift it to `libs/`.
2. **No module-internal helpers leaking out.** Files in `src/modules/<name>/` may only be imported by other files in the **same** module folder. The exception is the module's exported router, consumed by `src/modules/index.ts`.
3. **Every shared thing imports through its alias**, never via relative path: `import { UserRepository } from "@database"`, not `import { UserRepository } from "../../libs/database/..."`. Aliases are defined in `tsconfig.json` `paths`.
4. **Every `libs/<bucket>/` folder has an `index.ts` barrel** that re-exports everything in the bucket. New files must be added to the barrel.

## Decision flow when adding a new file

1. Will exactly **one** module use it, ever? → put it in that module's folder.
2. Will two or more modules use it, **or** is it a cross-cutting concern? → put it in the appropriate `libs/<bucket>/` and re-export from that bucket's `index.ts`.
3. Doesn't fit any existing bucket but is genuinely shared? → think twice before adding a new bucket. A new bucket means a new `tsconfig.json` path entry and a new mental category. Prefer fitting it into `utils/` or `default/`.

## Don't

- Don't `import` from another module via relative path. If you're typing `../../modules/...`, stop.
- Don't duplicate a helper across modules "for now". Lift it on the first reuse.
- Don't import directly from a bucket's nested file when the barrel re-exports it — always import from the bucket root alias.
- Don't add a new top-level `src/` folder for shared code. The choices are `src/libs/<bucket>/`, `src/bull/`, or existing top-level files.
