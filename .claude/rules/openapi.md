# Rule: OpenAPI documentation

The spec is generated at runtime from `createRoute(...)` metadata by `@hono/zod-openapi` and rendered
by Scalar. Both `/docs` and `/docs/openapi.json` are registered in `src/modules/index.ts` **only when
`ENABLE_API_DOCS=true`** — the single switch, independent of `NODE_ENV`, default `false`.

You never write OpenAPI by hand.

## Mandatory per-route metadata

1. **Request schemas** — `body`, `query`, `params` as applicable, from `./schema.ts`.
2. **`responses`** — one entry per status code the route can actually return, built with
   `commonResponse(...)` from `@hono-libs/schemas` so every entry carries the real envelope:
   - `200` / `201` success,
   - `400` if the service or a list filter can reject input,
   - `401` if `AuthMiddleware` runs,
   - `403` if a guard runs,
   - `404` if an `{id}` may not exist,
   - `422` for Zod failures and uniqueness conflicts,
   - `500` always possible; `503` only on `/health`.
3. **`tags`** — `["Auth"]`, `["Profile"]`, `["Home"]`, `["Settings/Users"]`, ...
4. **`summary`** (short) and **`description`** — what it does, the permission or role required, side
   effects (mail sent, cache invalidated).
5. **`security: [{ Bearer: [] }]`** on protected routes; omit it on public ones. The `Bearer` scheme is
   registered once in `src/modules/index.ts`.

## Zod schemas

- Every field has `.openapi({ description, example })`.
- Name reusable components with `.openapi("ComponentName")`.
- List routes document their allow-lists through `datatableQuerySchema(...)`; never hand-write the
  allowed sort values.

## Don't

- Don't declare a status code the route cannot return, or omit one it can.
- Don't describe a response shape the handler does not produce.
- Don't serve `/docs` unconditionally.
- Don't put real credentials or tokens in examples.
