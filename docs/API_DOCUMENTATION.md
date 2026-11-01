# API Documentation

## Base URL and content type

- Local: `http://localhost:3000` (`APP_PORT`). No global prefix and no version segment.
- Requests and responses are `application/json`.
- Send `Accept-Language: id` for Indonesian messages; the default is English.

## Interactive documentation

When `ENABLE_API_DOCS=true`:

- `GET /docs` — Scalar UI
- `GET /docs/openapi.json` — OpenAPI 3 spec, generated from the route definitions

Both routes do not exist when the flag is off (the default).

## Authentication

1. `POST /auth/login` with `{ email, password }` returns `{ user, accessToken, refreshToken }`.
2. Send `Authorization: Bearer <accessToken>` on protected routes. Access tokens live **1 day**.
3. When it expires, `POST /auth/refresh` with `{ refreshToken }` returns a new
   `{ accessToken, refreshToken }`. Refresh tokens live **7 days**.

A refresh token is rejected as a bearer token, and an access token is rejected by `/auth/refresh`.
Each refresh rotates the refresh token: the one presented is spent and rejected if sent again, and
logging in again replaces it. Changing or resetting a password (own, via reset link, or by an
admin), deleting a user, or setting a user's status to anything but `ACTIVE` revokes the stored
refresh token and stops access once the cached user is dropped, which every such write does.

## Envelope

`status` in the body always equals the HTTP status.

```jsonc
// success
{ "status": 200, "success": true, "message": "User detail retrieved", "data": { } }

// list
{
  "status": 200, "success": true, "message": "...",
  "data": { "data": [ ], "meta": { "page": 1, "limit": 10, "totalCount": 42 } }
}

// 400 / 422
{ "status": 422, "success": false, "message": "Validation failed",
  "errors": [ { "field": "email", "message": "Email is already registered" } ] }

// 401 / 403 / 404 / 500
{ "status": 403, "success": false, "message": "Forbidden", "data": null }

// 429
{ "status": 429, "success": false, "message": "Too many requests" }
```

Response field names are camelCase (`createdAt`, `updatedAt`, `isAssigned`). `status` enum values
are UPPERCASE: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `BLOCKED`.

## Route map

"Auth" means a bearer access token is required. Permission strings are `<group> <action>`.

| Method | Path                                             | Auth | Guard               | Body                                                                  | Success                                                                          |
| ------ | ------------------------------------------------ | ---- | ------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/`                                              | no   | —                   | —                                                                     | 200 `{ appName, appEnv, date }`                                                  |
| GET    | `/health`                                        | no   | —                   | —                                                                     | 200 `{ status, timestamp, services: { database, redis } }`; 503 if a probe fails |
| GET    | `/live`                                          | no   | —                   | —                                                                     | 200 `{ alive: true }`                                                            |
| POST   | `/auth/login`                                    | no   | —                   | `email`, `password`                                                   | 200 `{ user, accessToken, refreshToken }`                                        |
| POST   | `/auth/refresh`                                  | no   | —                   | `refreshToken`                                                        | 200 `{ accessToken, refreshToken }`                                              |
| POST   | `/auth/register`                                 | no   | —                   | `name` (1-255), `email`, `password` (strong)                          | 201 `null`                                                                       |
| POST   | `/auth/resend-verification`                      | no   | —                   | `email`                                                               | 200 `null` (always)                                                              |
| POST   | `/auth/verify-email`                             | no   | —                   | `token`                                                               | 200 `null`                                                                       |
| POST   | `/auth/forgot-password`                          | no   | —                   | `email`                                                               | 200 `null` (always)                                                              |
| POST   | `/auth/reset-password`                           | no   | —                   | `token`, `newPassword` (strong)                                       | 200 `null`                                                                       |
| GET    | `/profile`                                       | yes  | —                   | —                                                                     | 200 `UserInformation`                                                            |
| PATCH  | `/profile`                                       | yes  | —                   | `name`, `email`                                                       | 200 `UserInformation`                                                            |
| PATCH  | `/profile/password`                              | yes  | —                   | `currentPassword`, `newPassword` (strong)                             | 200 `null`; revokes the refresh token and drops the cached user                  |
| GET    | `/settings/users`                                | yes  | `user list`         | query                                                                 | 200 paginated `UserList`                                                         |
| POST   | `/settings/users`                                | yes  | `user create`       | `name`, `email`, `password`, `status`, `remark` (nullable), `roleIds` | 201 `null`                                                                       |
| GET    | `/settings/users/{id}`                           | yes  | `user detail`       | —                                                                     | 200 `UserDetail`                                                                 |
| PATCH  | `/settings/users/{id}`                           | yes  | `user edit`         | `name`, `email`, `status`, `remark`, `roleIds` (all required)         | 200 `null`                                                                       |
| POST   | `/settings/users/{id}/reset-password`            | yes  | role `superuser`    | `newPassword`                                                         | 200 `null`                                                                       |
| POST   | `/settings/users/{id}/send-verification-email`   | yes  | `user create`       | —                                                                     | 200 `null`                                                                       |
| POST   | `/settings/users/{id}/send-reset-password-email` | yes  | `user create`       | —                                                                     | 200 `null`                                                                       |
| DELETE | `/settings/users/{id}`                           | yes  | `user delete`       | —                                                                     | 200 `null` (soft delete)                                                         |
| GET    | `/settings/roles`                                | yes  | `role list`         | query                                                                 | 200 paginated `RoleList`                                                         |
| POST   | `/settings/roles`                                | yes  | `role create`       | `name`, `permissionIds`                                               | 201 `null`                                                                       |
| GET    | `/settings/roles/{id}`                           | yes  | `role detail`       | —                                                                     | 200 `RoleDetail`                                                                 |
| PATCH  | `/settings/roles/{id}`                           | yes  | `role edit`         | `name`, `permissionIds`                                               | 200 `null`                                                                       |
| DELETE | `/settings/roles/{id}`                           | yes  | `role delete`       | —                                                                     | 200 `null`                                                                       |
| GET    | `/settings/permissions`                          | yes  | `permission list`   | query                                                                 | 200 paginated `PermissionList`                                                   |
| POST   | `/settings/permissions`                          | yes  | `permission create` | `name` (string[] of actions), `group`                                 | 201 `null`, stores `"<group> <name>"` each                                       |
| GET    | `/settings/permissions/{id}`                     | yes  | `permission detail` | —                                                                     | 200 `PermissionList`                                                             |
| PATCH  | `/settings/permissions/{id}`                     | yes  | `permission edit`   | `name` (full `"<group> <action>"`), `group`                           | 200 `null`                                                                       |
| DELETE | `/settings/permissions/{id}`                     | yes  | `permission delete` | —                                                                     | 200 `null`                                                                       |
| GET    | `/settings/select-options/permissions`           | yes  | role `superuser`    | —                                                                     | 200 `[{ group, permissions: [{ id, name, group }] }]`                            |
| GET    | `/settings/select-options/roles`                 | yes  | role `superuser`    | —                                                                     | 200 `[{ id, name }]`, excluding `superuser`, by name                             |

Guards are AND across a list, and `superuser` passes every guard. `{id}` must be a uuid (422
otherwise). `PATCH /settings/permissions/{id}` stores `name` verbatim while `POST` prefixes the group,
so an update sends the full `"<group> <action>"` string.

## Data shapes

- `UserInformation` — `{ id, name, email, roles: string[], permissions: string[] }`
- `UserList` — `{ id, name, email, status, remark, roles: string[], createdAt, updatedAt }`
- `UserDetail` — `{ id, name, email, status, remark, roles: [{ id, name }], createdAt, updatedAt }`
- `RoleList` — `{ id, name, createdAt, updatedAt }`
- `RoleDetail` — `RoleList` + `permissions: [{ group, names: [{ id, name, isAssigned }] }]`, every
  permission in the system grouped, with `isAssigned` for this role
- `PermissionList` — `{ id, name, group, createdAt, updatedAt }`

## List query parameters

| Param                   | Default     | Invalid                                            |
| ----------------------- | ----------- | -------------------------------------------------- |
| `page`                  | `1`         | < 1 or not a number: 422                           |
| `perPage`               | `10`        | < 1 or not a number: 422                           |
| `search`                | —           | case-insensitive match over the searchable columns |
| `sort`                  | `createdAt` | not in the allow-list: 422                         |
| `sortDirection`         | `desc`      | not `asc` / `desc`: 422                            |
| `filter[<key>]=<value>` | —           | unknown key or bad value: 400                      |

Filters are separate flat query parameters, not JSON: `?filter[status]=ACTIVE&filter[name]=jane`.
Every filter is ANDed.

| Kind  | Comma means     | Match                                                              |
| ----- | --------------- | ------------------------------------------------------------------ |
| enum  | several values  | any of them, each checked against the enum                         |
| id    | several uuids   | any of them                                                        |
| date  | `start,end`     | inclusive whole days in `APP_TIMEZONE`; one date is that whole day |
| plain | a literal comma | case-insensitive contains                                          |

| Resource    | Sort                                                      | Filter                                                                                  | Search                    |
| ----------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| users       | `id`, `name`, `email`, `status`, `createdAt`, `updatedAt` | `status` (enum), `name`, `email`, `roleId` (id), `createdAt` (date), `updatedAt` (date) | `name`, `email`, `status` |
| roles       | `id`, `name`, `createdAt`, `updatedAt`                    | `name`, `createdAt` (date), `updatedAt` (date)                                          | `name`                    |
| permissions | `id`, `name`, `group`, `createdAt`, `updatedAt`           | `name`, `group`, `createdAt` (date), `updatedAt` (date)                                 | `name`, `group`           |

Soft-deleted users never appear in lists or lookups.

## Status codes

| Case                                                                                   | Status                           |
| -------------------------------------------------------------------------------------- | -------------------------------- |
| Missing, invalid, expired, or wrong-type bearer; user inactive or deleted              | 401                              |
| Guard refuses                                                                          | 403                              |
| `{id}` not found                                                                       | 404                              |
| Request shape, bad `sort` / `sortDirection`, malformed uuid                            | 422                              |
| Duplicate email (register, user create/update, profile), role name, or permission name | 422                              |
| Unknown filter key or bad filter value                                                 | 400                              |
| Login failure (unknown email, wrong password, unverified, not active)                  | 400, `errors[0].field = "email"` |
| Invalid, expired, or used verification / reset token                                   | 400, `errors[0].field = "token"` |
| Rate limited                                                                           | 429                              |

Login answers an unknown email and a wrong password with the same message, after a constant-time
password check, so it does not reveal which addresses are registered.

## Examples

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superuser@example.com","password":"S3crEtP4ssw0rd!"}'

curl "http://localhost:3000/settings/users?page=1&perPage=10&sort=name&sortDirection=asc&filter[status]=ACTIVE" \
  -H "Authorization: Bearer <accessToken>"

curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```
