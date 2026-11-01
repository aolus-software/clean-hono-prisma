# Rule: Prisma schema (`prisma/schema.prisma`)

One schema file, one generated client (`prisma/generated`, gitignored, imported as
`@prisma-generated`), migrations in `prisma/migrations/`. `prisma.config.ts` points the CLI at both
and reads `DATABASE_URL`.

## Naming — Prisma defaults

- Models are PascalCase singular (`User`, `Role`, `Permission`, `UserRole`, `RolePermission`,
  `UserEmailVerification`, `PasswordReset`) and **are** the table names. No `@@map`.
- Fields are camelCase (`emailVerifiedAt`, `deletedAt`, `createdAt`, `userId`) and **are** the column
  names. No `@map`.
- Index and constraint names are Prisma's defaults (`User_email_deletedAt_status_idx`,
  `Role_name_key`). Don't name them by hand.

This matches the Prisma sibling repositories. Physical snake_case names belong to the Drizzle
siblings; do not introduce `@@map` without an owner decision.

## Enums

`UserStatus` has UPPERCASE members: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `BLOCKED`. The values go over
the wire as-is. Zod schemas reuse the generated enum (`z.enum(UserStatus)` / `Object.values(UserStatus)`)
rather than restating the strings.

## Standard fields

- `id String @id @default(uuid()) @db.Uuid` — real uuids, so `:id` params validate as uuid.
- `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` on every model, join tables
  included.
- Soft delete on `User` only: `deletedAt DateTime?`. Every read filters it (`repositories.md`).
- `User.email` has **no** unique constraint — a soft-deleted user keeps the address and a new account
  may reuse it. Live uniqueness is the service's check (`services-crud.md`). The composite index
  `@@index([email, deletedAt, status])` serves that lookup.

## Relations and cascade

- Join tables (`UserRole`, `RolePermission`) use a composite `@@id` and `onDelete: Cascade` on both
  sides, so hard-deleting a role or permission removes its assignments.
- Token tables cascade from `User`.
- New relations state `onDelete` explicitly; Prisma's default (`Restrict`) turns a delete into a 500.

## Token tables need expiry and single use

`UserEmailVerification` and `PasswordReset` share one shape:

| Field       | Rule                                                              |
| ----------- | ----------------------------------------------------------------- |
| `token`     | `@unique`, random from a crypto RNG (`StrToolkit.random`)         |
| `expiresAt` | required, set from a lifetime **function** in `@default` at issue time |
| `usedAt`    | nullable; stamped on consumption — the row is kept                |
| index       | `@@index([userId, usedAt])`                                       |

A consumer accepts a token only if it exists, `expiresAt > now`, and `usedAt` is null, then stamps
`usedAt` on **every** unused token of that kind for the user in the same transaction. Issuing a new
token stamps the user's earlier unused ones first (revoke on issue).

## Migrations

- `make db-migrate-dev` (`prisma migrate dev`) creates `prisma/migrations/<timestamp>_<name>/` and
  applies it locally. Commit the folder with the schema change.
- `make db-migrate` (`prisma migrate deploy`) applies pending migrations — CI, Docker migrator, deploy.
- **Read every generated migration.** A rename Prisma cannot detect becomes `DROP` + `CREATE` and loses
  data; rewrite it by hand as `ALTER ... RENAME` (the `20261031000000_sync_with_base` migration is the
  example). A new NOT NULL column on a table with rows needs a default or a deliberate data step.
- Never hand-edit a migration that has been applied anywhere.
- CI applies all migrations to a fresh Postgres and fails on drift between the result and
  `schema.prisma`.

## Don't

1. Don't add `@@map` / `@map`.
2. Don't make `User.email` unique.
3. Don't store a token without `expiresAt`, or delete a token row to mark it used.
4. Don't compute an expiry at module load.
5. Don't commit `prisma/generated/`.
