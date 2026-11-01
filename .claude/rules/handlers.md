# Rule: Route handlers (`src/modules/<name>/routes.ts`)

A route is a `createRoute({...})` definition plus `Router.openapi(route, handler)`. The definition
carries the contract (method, path, middleware, request schemas, responses, docs); the handler is
glue.

## Responsibility

A handler may:

1. read validated input: `c.req.valid("json" | "query" | "param")` — list routes turn the validated
   query into a `DatatableType` with `DatatableToolkit.parseFilter(c, c.req.valid("query"))`, which
   also picks the `filter[<key>]` params off the raw query string,
2. read the authenticated user: `c.get("currentUser")`,
3. read its service: `c.get("userService")`,
4. call one service method,
5. return `ResponseToolkit.success(c, data, t("..."), status)`.

It may not query Prisma, hash passwords, touch the cache, enqueue jobs, check permissions, or build
an error body.

## Every route declares its contract

1. `method` and `path` — collection routes use `""`, item routes `"/{id}"`.
2. `middleware` — `[AuthMiddleware, ...guards]` for protected routes (`rbac.md`). Route middleware runs
   **before** validation and the handler; that ordering is why guards live here.
3. `request` — `body` / `query` / `params` Zod schemas from `./schema.ts`. Every `{id}` param uses the
   shared uuid schema so a malformed id is a 422, not a database error.
4. `responses` — one entry per status code the route can return, built with `commonResponse(...)`
   from `@hono-libs/schemas`; plus `summary`, `description`, `tags`, and `security: [{ Bearer: [] }]`
   on protected routes (`openapi.md`).

## Success responses

```ts
return ResponseToolkit.success(c, user, t("user.detail"), 200);
return ResponseToolkit.success(c, null, t("user.created"), 201);
```

Creates return **201 with `data: null`**; updates and deletes return **200 with `data: null`**; lists
return the repository's `{ data, meta }` as `data`. Never 204.

## Errors

The service throws a class from `@errors`; `registerException` renders it. A handler never catches
to translate, never calls `ResponseToolkit.error(...)` for a business failure, and never returns
`c.json({ ... }, 4xx)`.

## Module composition

```ts
const UserRoutes = new OpenAPIHono<Env>({ defaultHook });
UserRoutes.openapi(UserListRoute, async (c) => { ... });
export default UserRoutes;
```

The parent mounts it: `SettingsRoutes.route("/users", UserRoutes)`. Every `OpenAPIHono` is created
with `defaultHook` so Zod failures render the 422 envelope.

## Don't

1. Don't call `Router.use(...)` to attach a guard or `AuthMiddleware`. `.use(path, mw)` matches every
   method and runs in registration order, so it either lands after the handler or gates the wrong
   routes.
2. Don't read `c.req.query()` by hand for list params; `DatatableToolkit.parseFilter` is the one
   place filters are collected, and the repository is the one place they are validated.
3. Don't put business logic in a handler, however small.
4. Don't return a field a response schema does not declare.
