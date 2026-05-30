# Rule: Validation — Zod Schemas

All HTTP I/O is validated via Zod schemas integrated with `@hono/zod-openapi`. Schemas live next to the route they describe.

## Location

- Per-module: `src/modules/<feature>/schema.ts`
- Cross-module response envelopes: `commonResponse(...)` from `@utils`

## Rules

1. **One `schema.ts` per module / sub-module.** Group schemas with sections — Body, Query, Data, Response.
2. **Name schemas by intent + role:**
   - Inputs: `LoginSchema`, `CreateUserSchema`, `UserQuerySchema`
   - Data shapes (what the handler returns inside `data`): `MeDataSchema`, `UserDetailSchema`
   - Full response envelopes are handled by `commonResponse(...)` — don't manually wrap.
3. **Always use `commonResponse(data, { include: [...] })` for the `responses` field on routes.** It wraps the data schema in the success envelope and adds error schemas for the listed status codes.
   ```ts
   responses: commonResponse(UserDetailSchema, {
   	include: [200, 404, 422, 500],
   }),
   ```
   `include` should match the codes the handler can actually return. Don't blindly list every code.
4. **Apply schemas in the route definition via `createRoute()`**, not by re-validating in the handler.
5. **Use `.openapi(...)` on Zod schemas** to add descriptions and examples for the OpenAPI spec:
   ```ts
   z.string().email().openapi({ description: "User email", example: "user@example.com" })
   ```
6. **String formats over regex when possible:** `z.string().email()`, `z.string().uuid()`, `z.string().datetime()`. Custom regex only when no standard format fits.
7. **Length & range constraints belong in the schema**, not in the service: `z.string().min(8)`. Business uniqueness lives in the service.
8. **Enum schemas reference single source of truth.** If Drizzle defines an enum, use `z.nativeEnum(...)` — don't redeclare string unions.
9. **Date fields use `z.string().datetime()`** or `z.coerce.date()` as appropriate.
10. **Optional fields use `z.optional(...)`** or `.optional()`. Be precise about nullable vs optional.
11. **No schemas declared inline in `routes.ts`** except trivial param objects. Anything reused or longer than a line goes in `schema.ts`.
12. **Never expose secrets in response schemas.** Password hashes, raw tokens, internal IDs that shouldn't be public — leave them out.
