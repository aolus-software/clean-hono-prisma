# Rule: OpenAPI / Swagger documentation

The API spec is generated from Hono route metadata at runtime. It's served at `/docs` (Scalar UI) and `/docs/openapi.json`. Routes are defined using `createRoute()` from `@hono/zod-openapi`, which feeds both runtime validation and the spec.

You don't write OpenAPI YAML by hand. Every documentation field comes from how routes are declared.

## Mandatory per-route metadata

Every `createRoute({ ... })` MUST declare:

1. **Validation schemas** — `body`, `query`, `params` as applicable. Schemas come from `./schema.ts` (Zod with `.openapi(...)`) and feed both runtime validation and the spec.
2. **`responses`** — use `commonResponse(<DataSchema>, { include: [...] })` or `commonPaginatedResponse(...)` from `@utils`. The `include` array enumerates every status code this route can legitimately return:
   - `200` for successful GET/PATCH, `201` for POST that creates
   - `400` if input validation can fail in the service layer
   - `401` if `AuthMiddleware` is in use
   - `403` if any guard runs
   - `404` if any path param resolves to a row that may not exist
   - `422` if business-rule validation can fail
   - `500` for unexpected errors
3. **`tags`** — array for grouping. Top-level resources → single word (`["Authentication"]`, `["Profile"]`). Nested resources → `["Settings/Users"]`, `["Settings/Roles"]`.
4. **`summary`** and **`description`** — summary is short (≤80 chars), description explains auth/permission requirements and side effects.
5. **`security`** — protected routes declare `security: [{ bearerAuth: [] }]`. Public routes omit it or set `security: []`.

Example:

```ts
const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Settings/Users"],
  summary: "List all users",
  description: "Retrieve a list of all users. Requires 'user list' permission.",
  security: [{ bearerAuth: [] }],
  middleware: Guards.userManagement.list(),
  request: {
    query: DatatableQueryParams,
  },
  responses: commonPaginatedResponse(UserListSchema, {
    include: [200, 400, 401, 403, 500],
  }),
});
```

## Zod schemas

- Every field in a request/response schema gets `description` and at least one `example` via `.openapi(...)` — these become property docs in `/docs`.
- Use semantic Zod methods: `z.string().email()`, `z.string().uuid()`, `z.string().datetime()`.
- Reuse domain enums: `z.nativeEnum(UserStatus)` from `@database`.
- Strong-password fields use the `StrongPassword` pattern from `@default`.

## Don't

- Don't hand-edit any `openapi.json` — there isn't one to edit.
- Don't omit `include` codes that the route can actually return — the spec lies if you do.
- Don't return `ResponseToolkit.success(c, data)` while declaring a bare schema in `responses` — the toolkit wraps in `{ status, success, message, data }`, so always wrap with `commonResponse(...)`.
- Don't add `tags` inconsistently. Use the same casing and format across the codebase.
