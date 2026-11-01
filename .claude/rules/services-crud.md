# Rule: The canonical CRUD service

The five methods behind a CRUD module: `findAll`, `findOne`, `create`, `update`, `delete`.

## Where the checks live — the service owns them

Settled: **repositories return `null` for a miss and perform no uniqueness check; the service
throws.** A repository importing `NotFoundError` would make persistence depend on the HTTP layer.

| Check                    | Repository provides                        | Service throws                                        |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------- |
| Row exists (live)        | `findById(id)` → row or `null`             | `NotFoundError(t("<entity>.notFound"))` → 404         |
| Email unique among live users | `findLiveByEmail(email, excludeId?)`  | `UnprocessableEntityError(..., [{ field: "email", ... }])` → 422 |
| Role name unique         | `findByName(name, excludeId?)`             | 422 on `name`                                         |
| Permission name unique   | `findByName` / `findExistingByNames(names)`| 422 on `name`                                         |
| Related ids exist        | `countByIds(ids)`                          | 422 on `roleIds` / `permissionIds`                    |

**Uniqueness is 422, everywhere** — create, update, register, profile update. Never 409, never a
Prisma `P2002` surfacing as 500. The email check is a service check because `User.email` has no
database unique constraint (soft-deleted users keep their address).

## findAll

Pass the `DatatableType` straight to the repository; it validates sort and filter keys and returns
`{ data, meta: { page, limit, totalCount } }`.

## findOne

Repository read, `null` → `NotFoundError`.

## create

1. Uniqueness checks (422).
2. Related-id checks (422).
3. Hash a password if there is one (`Hash.generateHash`).
4. Write in `db.$transaction` when more than one table is touched.

## update

1. `findById` → 404.
2. Uniqueness checks excluding the current id.
3. Write in a transaction; full replace of relation ids.
4. Invalidate cache (`services.md` rule 7).

## delete

1. `findById` → 404.
2. Users are **soft-deleted** (`deletedAt` stamped). Roles and permissions are hard-deleted; their join
   rows go with them (`ON DELETE CASCADE`).
3. Invalidate cache.

## Permissions are composed, not typed

`POST /settings/permissions` takes `group` and a list of action `name`s and stores
`"<group> <name>"` for each. The uniqueness check composes the same strings before it queries.
`PATCH /settings/permissions/{id}` stores `name` verbatim, so an update sends the full
`"<group> <action>"` string — documented on the route.

## Checklist

- [ ] Every `findById` miss is a 404 thrown here.
- [ ] Every uniqueness conflict is a 422 with a `field`.
- [ ] Multi-table writes are in one transaction.
- [ ] Cache keys invalidated after writes that change a user's access.
- [ ] Messages come from `t(...)`.
