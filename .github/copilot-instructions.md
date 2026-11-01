# Copilot Instructions

These mirror `CLAUDE.md` and `.claude/rules/`. When they disagree, the rule file wins.

## Code Style and Quality

### Type Safety

- Strict TypeScript. Never use `any`; use proper types or `unknown` with narrowing.
- ESLint enforces `@typescript-eslint/no-explicit-any` (error), `@typescript-eslint/no-floating-promises` (error), and `no-console`.
- Every promise is `await`ed or explicitly `void`ed.

### Comments

- No line-by-line comments. One block comment above a block whose _why_ is not obvious.
- Docblocks only on exported helpers that need clarification.

Good:

```typescript
/* Verify the password before looking at account state, and answer an unknown
   address and a wrong password with the same message, so an unauthenticated
   caller cannot tell a registered address from an unknown one. */
const isPasswordValid = await Hash.compareHash(
	password,
	user?.password ?? TIMING_EQUALISER_HASH,
);
```

Bad:

```typescript
// Find user
const user = await UserRepository().findByEmail(email);
// Check password
const isPasswordValid = await Hash.compareHash(password, user.password);
```

### Communication

- No icons or emojis in any file.

## Project Structure

- Hono 4 with `@hono/zod-openapi` (routes, validation, and the OpenAPI spec come from `createRoute`).
- Prisma 7 with `@prisma/adapter-pg`; schema in `prisma/schema.prisma`, migrations in `prisma/migrations/`, generated client in `prisma/generated` (import via `@prisma-generated`).
- PostgreSQL, Redis (Bun native `RedisClient`) for cache, BullMQ for queued mail, optional ClickHouse.
- Bun runtime. Cluster mode (`APP_CLUSTER_MODE`) spawns Bun workers that share the port.

## Architecture

### Request flow

`routes.ts` (HTTP only) → service class (business rules, existence and uniqueness checks, transactions, cache invalidation, queue dispatch) → repository factory (Prisma queries only).

### Modules

```
src/modules/<name>/
├── routes.ts             # OpenAPIHono<Env>({ defaultHook }), createRoute + .openapi(route, handler)
├── schema.ts             # Zod schemas with .openapi(...) metadata
├── service.interface.ts  # I<Name>Service
└── service.ts            # class <Name>Service implements I<Name>Service
```

### Routes and guards

Guards are attached in the route definition, so they run before validation and the handler:

```typescript
const UserListRoute = createRoute({
	method: "get",
	path: "",
	tags: ["Settings/Users"],
	summary: "List users",
	description: "Requires the 'user list' permission.",
	security: [{ Bearer: [] }],
	middleware: [AuthMiddleware, permissionGuard(["user list"])] as const,
	request: { query: UserQuerySchema },
	responses: {/* every status code the route can return */},
});
```

- Permission strings are `<group> <action>` and must exist in the seeder.
- `permissionGuard` and `roleGuard` are AND across their list; `superuser` bypasses both.
- Privilege-granting routes (admin password reset, select-options) use `roleGuard(["superuser"])`.
- Never register a guard with `.use()` after the handler; Hono runs matches in registration order.

### Dependency Injection

- Services are registered in `src/bootstrap.ts`, injected by `diMiddleware`, typed in `Variables` (`src/libs/types/hono/app.types.ts`), and read in handlers with `c.get("userService")`.

### Repositories

```typescript
export function UserRepository(tx?: Prisma.TransactionClient) {
	const dbClient = tx || db;
	return {
		async findLiveByEmail(email: string, excludeId?: string) {
			return dbClient.user.findFirst({
				where: {
					email,
					deletedAt: null,
					...(excludeId && { id: { not: excludeId } }),
				},
				select: { id: true },
			});
		},
	};
}
```

- Factory invoked per call; accepts an optional transaction client.
- Reads return `null` when a row is missing; the service throws `NotFoundError`.
- Every user read includes `deletedAt: null`.
- Sort keys and filter keys are exported allow-lists (`userSortableFields`, `userFilterableFields`); never pass a raw query value to `orderBy` or `where`.

### Responses and errors

- Success: `{ status, success: true, message, data }`; lists put `{ data, meta: { page, limit, totalCount } }` inside `data`.
- 400/422: `{ status, success: false, message, errors: [{ field, message }] }`.
- 401/403/404/500: `{ status, success: false, message, data: null }`.
- Throw error classes from `@errors` (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `UnprocessableEntityError`); never build an error body in a handler.
- Uniqueness conflicts are 422. Login and token failures are 400. Unknown filter keys are 400.
- Response fields are camelCase (`createdAt`, `updatedAt`, `isAssigned`); request id arrays are `roleIds` / `permissionIds`.

### Caching

- `UserInformation` is cached at `UserInformationCacheKey(id)` for 3600 s by `AuthMiddleware`.
- Any write that changes a user's profile, status, roles, password, or deletion, or a role's or permission's grants, deletes the affected cache entries.

### Queues

- Enqueue mail with `sendEmailQueue.add(...)` from a service, after the transaction commits.

## Prisma Conventions

- Prisma default model and column names (no `@@map` / `@map`); camelCase columns; enum values UPPERCASE.
- Change the schema, then `make db-migrate-dev` and commit the migration folder.
- Never hand-edit an applied migration.
- Never instantiate `PrismaClient` outside `src/libs/database/postgres/client.ts`.

## Configuration

- Env is validated with envalid in `src/libs/config/env.ts` and read only through `@config`.
- Never read `process.env` elsewhere. New vars go in `env.ts`, `.env.example`, and `docs/CONFIGURATION.md`.

## Security

- Validate every input with Zod; `:id` params are uuids.
- Strong passwords use `StrongPassword` from `@default`.
- Verification and reset tokens are random, single use (`usedAt`), and expire after 1 hour.
- Never log passwords, tokens, or secrets.

## i18n

- No hardcoded user-facing strings: add keys to both `src/libs/i18n/locales/en.json` and `id.json`, then run `bun run i18n:keys`.

## Testing

- There is no test runner configured yet. Do not add test commands to docs or CI without adding the runner and tests.

## Git Commits

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `db:`), imperative, under 72 characters.
