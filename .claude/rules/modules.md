# Rule: Feature modules (`src/modules/<name>/`)

Every feature module is a folder with these files:

```
src/modules/<name>/
├── routes.ts             # OpenAPIHono instance, createRoute definitions, handlers
├── schema.ts             # Zod request/response schemas (use .openapi(...) for docs)
├── service.interface.ts  # interface only (excluded from lint)
└── service.ts            # implementation; talks to repositories from @database
```

Nested feature groups (e.g. `settings/users/`, `settings/roles/`) follow the same shape. Group parents (`settings/index.ts`) only `.route(...)` their children — no routes there.

---

## `routes.ts` — routes

- Export an `OpenAPIHono` instance with `defaultHook` from `@errors`.
- Define routes using `createRoute({ ... })` then `app.openapi(route, handler)`.
- Route handlers receive the Hono context `c` and pull services via `c.get("serviceName")`. Don't import services dynamically.
- Wrap every successful return through `ResponseToolkit.success(c, data, message, status)`. Never hand-craft `{ status, success, data }` objects.
- Throw `BadRequestError`/`NotFoundError`/`UnauthorizedError`/etc. from `@errors`. Never `c.json({error: …}, 400)` by hand — let `registerException(app)` handle it.
- Apply authorization via `Guards.*` middleware:
  ```ts
  middleware: Guards.userManagement.list()
  ```
  Or use `requireGuards({ roles, permissions })` which returns a middleware array. Never inline permission checks inside the handler.
- Every route **must** declare `body` / `query` / `params` schemas where applicable, plus `responses` using `commonResponse(...)`.
- Every route needs `summary` and `description` — these flow into the OpenAPI spec.
- After defining a new module, **register it** in the appropriate parent:
  - Top-level → `src/modules/index.ts`
  - Nested → its group parent (e.g. `src/modules/settings/index.ts`)

## `schema.ts` — validation

- Pure Zod with `.openapi(...)` metadata. No runtime logic in this file.
- Every field gets a `description` and at least one `example` — these surface in `/docs`.
- Reuse domain enums from `@database` via `z.nativeEnum(...)` — don't redeclare string unions.
- Reuse shared patterns from `@default` (e.g. `StrongPassword` for password regexes).
- Export response schemas separately from request schemas.
- Naming: `<Entity>CreateSchema`, `<Entity>UpdateSchema`, `<Entity>ListSchema`, `<Entity>DetailSchema`.

## `service.interface.ts` — interface

- Export an `IXxxService` interface declaring every public method.
- Files matching `**/*.interface.ts` are excluded from ESLint — keep interfaces in these files.

## `service.ts` — business logic

- Export a plain object literal or a const, never a class:
  ```ts
  export const FooService = {
    doThing: async (...) => { ... },
  };
  ```
- Service methods own orchestration: validation that depends on DB state, transactions, cache invalidation, queue dispatch. They call `Repository().method(...)` — invoke the factory **each call**, never destructure once.
- Wrap multi-step mutations in `db.transaction(async (trx) => { ... })` and pass `trx` down to repository methods.
- Throw typed errors from `@errors` for business-rule failures.
- Cache invalidation: when mutating user-shaped data, refresh the cache so `AuthMiddleware` sees the new value.
- Log meaningful events with structured `log` from `@utils`. Never use `console.*`.
- If the service is reused outside its module, register it in `src/bootstrap.ts` (see `rules/di.md`).
