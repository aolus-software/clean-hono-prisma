# Rule: Route structure and the live route map

## Convention: flat, resource-named, composed by path

No global prefix and no version segment. `src/modules/index.ts` mounts `/`, `/auth`, `/profile`,
`/settings`; `src/modules/settings/index.ts` mounts `/users`, `/roles`, `/permissions`,
`/select-options`. Collections are plural kebab-case. Collection routes use path `""` (no trailing
slash); item routes `"/{id}"`, with `id` validated as a uuid (422 otherwise).

## Method conventions

- `GET` reads, `POST` creates (201, `data: null`) or performs an action, `PATCH` updates (full replace
  of the documented body), `DELETE` deletes (200, `data: null`). Never `PUT`, never 204.
- Actions on one item: `POST /{id}/<verb-noun>`.

## Current route map

```
# Home (src/modules/home) — tags ["Home"], public
GET    /                                   200 { appName, appEnv, date }
GET    /health                             200 { status, timestamp, services: { database, redis } }; 503 when a probe fails
GET    /live                               200 { alive: true }

# Auth (src/modules/auth, /auth) — tags ["Auth"], public
POST   /auth/login                         { email, password } -> 200 { user, accessToken, refreshToken }; 400 on bad credentials / unverified / inactive
POST   /auth/refresh                       { refreshToken } -> 200 { accessToken, refreshToken }; 401 if invalid, expired, not a refresh token, already rotated or revoked, or user inactive; rotates the refresh token
POST   /auth/register                      { name, email, password } -> 201 null; 422 duplicate email
POST   /auth/resend-verification           { email } -> 200 null (always)
POST   /auth/verify-email                  { token } -> 200 null; 400 invalid/expired/used
POST   /auth/forgot-password               { email } -> 200 null (always)
POST   /auth/reset-password                { token, newPassword } -> 200 null; 400 invalid/expired/used

# Profile (src/modules/profile, /profile) — tags ["Profile"], AuthMiddleware, no guard
GET    /profile                            200 UserInformation
PATCH  /profile                            { name, email } -> 200 UserInformation; 422 duplicate email
PATCH  /profile/password                   { currentPassword, newPassword } -> 200 null; 422 on currentPassword if wrong; revokes the refresh token and drops the cached user

# Settings / Users (/settings/users) — tags ["Settings/Users"], AuthMiddleware
GET    /settings/users                     permission "user list"     200 paginated UserList
POST   /settings/users                     permission "user create"   201 null
GET    /settings/users/{id}                permission "user detail"   200 UserDetail
PATCH  /settings/users/{id}                permission "user edit"     200 null
POST   /settings/users/{id}/reset-password role superuser             { newPassword } -> 200 null
POST   /settings/users/{id}/send-verification-email    permission "user create"   200 null
POST   /settings/users/{id}/send-reset-password-email  permission "user create"   200 null
DELETE /settings/users/{id}                permission "user delete"   200 null (soft delete)

# Settings / Roles (/settings/roles) — tags ["Settings/Roles"], AuthMiddleware
GET    /settings/roles                     permission "role list"     200 paginated RoleList
POST   /settings/roles                     permission "role create"   { name, permissionIds } -> 201 null
GET    /settings/roles/{id}                permission "role detail"   200 RoleDetail
PATCH  /settings/roles/{id}                permission "role edit"     { name, permissionIds } -> 200 null
DELETE /settings/roles/{id}                permission "role delete"   200 null

# Settings / Permissions (/settings/permissions) — tags ["Settings/Permissions"], AuthMiddleware
GET    /settings/permissions               permission "permission list"    200 paginated PermissionList
POST   /settings/permissions               permission "permission create"  { name: string[], group } -> 201 null (stores "<group> <name>")
GET    /settings/permissions/{id}          permission "permission detail"  200 PermissionList
PATCH  /settings/permissions/{id}          permission "permission edit"    { name, group } -> 200 null (name stored verbatim)
DELETE /settings/permissions/{id}          permission "permission delete"  200 null

# Settings / Select Options (/settings/select-options) — tags ["Settings/Select Options"], AuthMiddleware
GET    /settings/select-options/permissions  role superuser   200 [{ group, permissions: [{ id, name, group }] }]
GET    /settings/select-options/roles        role superuser   200 [{ id, name }] excluding superuser, by name

# Docs — only when ENABLE_API_DOCS=true
GET    /docs                               Scalar UI
GET    /docs/openapi.json                  OpenAPI 3 spec
```

`PATCH /profile/password` and `POST /auth/refresh` are additions beyond the base route map; keep
them documented here and in `docs/API_DOCUMENTATION.md`.

## OpenAPI tagging

Top-level resources use one word (`Auth`, `Profile`, `Home`); nested ones `Settings/<Resource>`.

## Registering a route

1. Define it in the module's `routes.ts` (`handlers.md`).
2. Mount a new module in `src/modules/index.ts` or its group parent.
3. Update this map and `docs/API_DOCUMENTATION.md` in the same change.
