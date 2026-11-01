# Rule: Validation — Zod schemas

All HTTP input is validated by Zod schemas wired through `createRoute(...)` in `@hono/zod-openapi`.
The same schemas generate `/docs`.

## Location

- Per module: `src/modules/<feature>/schema.ts`.
- Shared building blocks: `@hono-libs/schemas` (`EmailSchema`, `StrongPasswordSchema`, `UUIDSchema`,
  the uuid param schema, response helpers) and `datatableQuerySchema` in `@types`.

## Rules

1. **One `schema.ts` per module.** Request bodies, query, response data shapes.
2. **Naming:** `<Entity>CreateSchema`, `<Entity>UpdateSchema`, `<Entity>QuerySchema`,
   `<Entity>ListSchema`, `<Entity>DetailSchema`; auth bodies by intent (`LoginSchema`,
   `RefreshTokenSchema`).
3. **Request fields are camelCase**: `roleIds`, `permissionIds`, `newPassword`, `refreshToken`.
4. **Formats over regex:** `z.string().email()`, `z.string().uuid()`. Passwords that set a credential
   use `StrongPassword` from `@default`; login takes any non-empty string.
5. **Enums come from Prisma:** use the generated `UserStatus`, not a restated union.
6. **Nullable vs optional is deliberate.** `remark` on user create/update is required-but-nullable
   (`z.string().max(255).nullable()`); update bodies are full replacements, so every field is
   required.
7. **Query numbers are coerced** (`z.coerce.number().int().min(1)`) — query strings are strings.
8. **List queries** come from `datatableQuerySchema({ sortFields, filterFields, filterExample })` fed
   by the repository's exported allow-lists. `sort` is a closed enum (422 when unknown);
   `filter[<key>]` entries are documentation, validated by the repository (400).
9. **`.openapi(...)` on every field** with a `description` and an `example`.
10. **Never put secrets in a response schema**: no password hash, no raw verification/reset token.
11. **No inline schemas in `routes.ts`** beyond trivial param objects.
