# Rule: Repositories (`src/libs/database/postgres/repositories/`)

Repositories are the **only** layer that talks to Drizzle directly. Services consume them; route handlers never import `db` for queries.

## Shape — factory function

A repository is a function that returns an object of methods. **Do not** export a class, singleton, or top-level method bag.

```ts
export const UserRepository = () => {
	const dbInstance = db;
	return {
		db: dbInstance,
		getDb: (tx?: DbTransaction) => tx || dbInstance,

		findByEmail: async (email: string): Promise<UserForAuth | null> => {
			const result = await dbInstance
				.select()
				.from(users)
				.where(eq(users.email, email))
				.limit(1);
			return result[0] || null;
		},
	};
};
```

Callers invoke the factory each time: `await UserRepository().findByEmail(email)`. Don't `const repo = UserRepository()` at module scope — the factory pattern exists so future DI overrides stay possible.

## Transaction support

Every mutating method (and read methods that participate in a transaction) accepts an optional `tx?: DbTransaction` and resolves the active connection at the top:

```ts
update: async (
	id: string,
	data: UserUpdate,
	tx?: DbTransaction,
): Promise<void> => {
	const database = tx || dbInstance;
	await database.update(users).set(data).where(eq(users.id, id));
};
```

`DbTransaction` is exported from `@database`. The convention is `const database = tx || dbInstance` at the top of the method, then use `database` throughout.

## Queries

- Use Drizzle's typed query builder. Prefer `db.query.<table>.findMany({ where, with, columns })` for relational reads; fall back to `select().from(...)` for joins/aggregates the relational API can't express.
- Compose `WHERE` clauses incrementally with `and(...)`, `or(...)`, `eq`, `ilike`, `isNull`, `exists` — keep a single `SQL | undefined` accumulator.
- **Soft delete**: most tables use `deleted_at` — every read starts with `let whereCondition: SQL | undefined = isNull(<table>.deleted_at);`. Don't forget this.
- **Datatable reads**: read pagination/search/sort from `DatatableType` (from `@types`). Default to `defaultSort` (`@default`) and `desc`. Whitelist sortable columns via a `validateOrderBy` map — never trust `queryParam.sort` directly.
- **Counts**: use `database.$count(table, whereCondition)` alongside the paged `findMany` — run both inside `Promise.all([...])`.
- **Returning**: paginated reads return `PaginationResponse<T>` from `@types`. Detail/list item DTOs are also in `@types`.

## What repositories should NOT do

- No `throw new BadRequestError(...)` for business rules. Throw `NotFoundError` when a row is genuinely missing; everything else belongs in the service.
- No cache reads/writes. Caching is the service's job (or `AuthMiddleware`'s).
- No password hashing / JWT signing / mail sending. Repositories only own SQL.
- No cross-table orchestration that requires a transaction the caller didn't supply — if you need a transaction, accept `tx` and let the caller open it.
- No interaction with BullMQ queues, Redis, or external HTTP. Those belong in services.

## File layout

- One repository per file: `<entity>.repository.ts`.
- Re-export from the repositories barrel so consumers `import { UserRepository } from "@database"`. Never import via relative path from outside `libs/database/`.
- One repository per **aggregate**, not per query. New filters/joins extend an existing repo.
