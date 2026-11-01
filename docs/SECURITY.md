# Security

How authentication, authorization, tokens, and the security middleware work in this template. To
report a vulnerability, see [`.github/SECURITY.md`](../.github/SECURITY.md).

## Authentication

### Tokens

| Token   | Secret               | Lifetime | `type` claim |
| ------- | -------------------- | -------- | ------------ |
| Access  | `JWT_SECRET`         | 1 day    | `access`     |
| Refresh | `JWT_REFRESH_SECRET` | 7 days   | `refresh`    |

Both are HS256 JWTs with payload `{ id, type, exp }` (the refresh token adds `jti`), signed by `JWTToolkit`
(`src/libs/utils/hono/jwt.ts`) from `JWT_CONFIG`. Both secrets are required at boot; there is no
fallback value.

- `AuthMiddleware` accepts only `type: "access"`. A refresh token sent as a bearer token is 401.
- `POST /auth/refresh` accepts only `type: "refresh"` whose `jti` matches the one stored for the
  user, re-loads the user (must be `ACTIVE` and not deleted), and issues a new pair.
- Every verification failure (signature, expiry, malformed token, wrong type) is 401, never 500.
- Refresh tokens are revocable. Each pair issued (login or refresh) carries a random `jti` that is
  stored in Redis at `RefreshTokenCacheKey(userId)` (`refresh_token:<id>`) for the refresh lifetime,
  so a user has one live refresh token at a time and `/auth/refresh` rotates it: the token just
  presented is rejected on its next use. Own password change, password reset, admin password
  reset, user delete, and a user update to any status other than `ACTIVE` delete that key and the
  cached user (`revokeSessions` in `@cache`). Access tokens stay stateless: one already issued
  works until it expires (1 day) unless the user's cache entry is dropped and the database read
  then fails (deleted or not `ACTIVE`). Logging out is a client-side discard.

### AuthMiddleware

`src/libs/hono/middlewares/security/auth.middleware.ts` reads `Authorization: Bearer <token>`,
verifies it, then loads `UserInformation` (`{ id, name, email, roles, permissions }`) cache-aside from
Redis at `UserInformationCacheKey(id)` (TTL 3600 s). The database lookup requires
`status = ACTIVE` and `deletedAt IS NULL`; otherwise 401.

### Cache invalidation

Every write that changes what a user may do deletes the affected cache entries so the change applies
on the next request: user update, delete, and admin password reset; profile update; role update and
delete (every holder of the role); permission update and delete (every holder of a role granting it).

### Login

1. Look up the live user by email.
2. Compare the password with bcrypt — against a fixed dummy hash when the email is unknown, so both
   paths take the same time.
3. Unknown email and wrong password return the **same** 400 message.
4. Only then: unverified → 400, status not `ACTIVE` → 400.

### Passwords

- bcrypt via `Hash` (`@utils`).
- Strong-password rule (`StrongPassword` in `@default`): at least 8 characters with upper, lower,
  digit, and symbol. Applied on register, reset, admin reset, admin create, and profile password
  change. Login accepts any non-empty string.

### Verification and reset tokens

- Random 255-character tokens from `crypto.getRandomValues` (`StrToolkit.random`), unique in the
  database.
- Expire 1 hour after issue (`verificationTokenLifetime()`, `resetPasswordTokenLifetime()`, computed
  at issue time).
- Issuing a new token marks the user's earlier unused tokens of that kind as used.
- Consuming one checks existence, expiry, and `usedAt`, then stamps `usedAt` on every unused token of
  that kind for the user in the same transaction as the write it authorises.
- `forgot-password` and `resend-verification` always return 200, so they do not reveal whether an
  address is registered.

## Authorization (RBAC)

- Guards are attached per route in `createRoute({ middleware: [AuthMiddleware, guard] })`, which runs
  before validation and the handler.
- `permissionGuard([...])` requires every listed permission; `roleGuard([...])` every listed role.
  `superuser` bypasses both.
- Permissions are `<group> <action>` over `user`, `role`, `permission` × `list`, `create`, `detail`,
  `edit`, `delete` (15). Seeded roles `superuser` and `admin` both hold all 15.
- Privilege-granting routes — `POST /settings/users/{id}/reset-password` and the select-options
  routes — require the `superuser` role.
- Routes with no guard are open to any authenticated user (profile routes act only on the caller).

## Rate limiting

Global, 100 requests per 60 s, keyed on the connection address (never `X-Forwarded-For`). The store is
in memory per process, so cluster workers each count separately, and behind a reverse proxy every
client shares the proxy's address — enforce a limit at the proxy in production.

## CORS

`ALLOWED_HOST` is a comma-separated origin list; empty means `*`. Methods `GET, POST, PATCH, DELETE,
OPTIONS`; headers `Content-Type, Authorization, Accept-Language`; `credentials: false`.

## Security headers

`hono/secure-headers` (`security-headers.middleware.ts`): CSP, HSTS, `X-Content-Type-Options`,
referrer policy `no-referrer`, cross-origin policies, `X-Powered-By` removed.

## Request size

Bodies over 100KB are rejected (`body-limit.middleware.ts`).

## Validation

Every body, query, and path parameter is validated by Zod before the handler runs; `{id}` must be a
uuid. List sort keys and filter keys are allow-listed in the repositories, so no raw query value
reaches Prisma `orderBy` or `where`.

## API docs exposure

`/docs` and `/docs/openapi.json` exist only when `ENABLE_API_DOCS=true` (default `false`). Leave it
off outside local development.

## Deployment checklist

- [ ] Strong, distinct `JWT_SECRET` and `JWT_REFRESH_SECRET`; `APP_KEY` changed.
- [ ] `ENABLE_API_DOCS` unset or `false`.
- [ ] `ALLOWED_HOST` set to real origins.
- [ ] Seeded accounts removed or their passwords changed.
- [ ] Redis and Postgres not reachable from the internet.
- [ ] TLS terminated in front of the app; a shared rate limit at the proxy.
