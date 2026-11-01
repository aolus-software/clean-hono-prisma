# Rule: Feature modules (`src/modules/<name>/`)

Every feature module is a folder with four files:

```
src/modules/<name>/
├── routes.ts             # OpenAPIHono instance, createRoute definitions, handlers
├── schema.ts             # Zod request/response schemas with .openapi(...) metadata
├── service.interface.ts  # I<Name>Service
└── service.ts            # class <Name>Service implements I<Name>Service
```

The settings sub-modules (`settings/users`, `roles`, `permissions`, `select-options`) name the
implementation `services.ts`; match the folder you are in. `home` has only `routes.ts`. Group parents
(`src/modules/settings/index.ts`) only `.route(...)` their children.

## `routes.ts`

- `export default` an `new OpenAPIHono<Env>({ defaultHook })`.
- One `createRoute({...})` per endpoint, then `.openapi(route, handler)` (`handlers.md`).
- Protected routes carry `middleware: [AuthMiddleware, ...guards]` (`rbac.md`).
- Register a new module in `src/modules/index.ts` or its group parent.

## `schema.ts`

Pure Zod plus `.openapi(...)`. No runtime logic. See `validation.md`.

## `service.interface.ts` / `service.ts`

The interface lists every public method; the class implements it and is registered in the container
(`di.md`). Business rules, transactions, cache invalidation, and queue dispatch live here
(`services.md`, `services-crud.md`).

## Don't

- Don't import another module's files. Lift shared code to `src/libs/` (`shared-code.md`).
- Don't query Prisma from `routes.ts` or `service.ts` — go through a repository.
