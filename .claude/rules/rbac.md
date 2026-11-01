# Rule: Authorization (RBAC)

Authentication is `AuthMiddleware`; authorization is two guards from `@guards`. Both are Hono
middleware attached **per route** in `createRoute({ middleware: [...] })`. Nothing is gated by
default: a route without `AuthMiddleware` is public, and an authenticated route without a guard is
open to every logged-in user.

## AuthMiddleware

`src/libs/hono/middlewares/security/auth.middleware.ts`:

1. Reads `Authorization: Bearer <token>`; missing → 401.
2. Verifies it with `JWT_SECRET` and requires `type: "access"` — a refresh token is rejected. Any
   verification failure (bad signature, expired, malformed) → 401, never 500.
3. Loads `UserInformation` (`{ id, name, email, roles, permissions }`) cache-aside from
   `UserInformationCacheKey(id)` (TTL 3600 s). The database read requires `status: "ACTIVE"` and
   `deletedAt: null`; a miss → 401.
4. Sets `c.set("currentUser", user)`.

## The two guards

| Guard                         | Passes when                                   |
| ----------------------------- | --------------------------------------------- |
| `permissionGuard(["a", "b"])` | the user holds **every** listed permission    |
| `roleGuard(["superuser"])`    | the user holds **every** listed role          |

Both short-circuit for a `superuser` and throw `ForbiddenError` (403) otherwise.

## Where a guard goes

```ts
const UserCreateRoute = createRoute({
	method: "post",
	path: "",
	middleware: [AuthMiddleware, permissionGuard(["user create"])] as const,
	...
});
```

`AuthMiddleware` first, guards after it, all inside the route definition. Route middleware runs before
request validation and before the handler, so an unauthorised caller gets 401/403, not 422.

**Never** `Router.use(path, guard)`. Hono runs matches in registration order and `.use()` ignores the
HTTP method: a `.use()` after `.openapi()` never runs before that handler, and a `.use("/:id", ...)`
gates GET, PATCH, and DELETE alike.

## Permission names come from the seed

`src/libs/database/seed/rbac.seed.ts` builds the catalogue as `` `${group} ${action}` `` over groups
`user`, `role`, `permission` and actions `list`, `create`, `detail`, `edit`, `delete`: **15 permissions
and no others**, space-separated. Seeded roles: `superuser`, `admin` (both granted all 15).

A guard naming a string the seed does not produce fails closed — 403 for everyone but superuser. Grep
the seed before inventing a name; extend the seed in the same change if a new one is needed.

## Privilege-granting routes are gated on the role

`POST /settings/users/{id}/reset-password` and `GET /settings/select-options/*` use
`roleGuard(["superuser"])`. Gating password reset on a permission would let anyone holding it take
over any account, including a superuser's.

## `403` must be in the response schema

A guarded route lists 403 in its `responses`; an unguarded one does not.

## Cache

Granting or revoking access changes `UserInformation`. Every service write that does so deletes the
affected cache keys (`services.md` rule 7); otherwise the old grants live for up to an hour.

## Checklist for a new protected route

- [ ] `middleware: [AuthMiddleware, ...]` in `createRoute`.
- [ ] Permission strings exist in the seeder.
- [ ] `security: [{ Bearer: [] }]`, and 401 + 403 in `responses`.
- [ ] Route map in `routes.md` updated.

## Don't

1. Don't check permissions inside a handler or service.
2. Don't attach a guard with `.use()`.
3. Don't make `permissionGuard` "any of" — it is AND.
4. Don't accept a refresh token anywhere but `POST /auth/refresh`, and don't issue one except
   through `AuthService.issueTokens`, which stores its `jti`.
