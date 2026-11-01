# Rule: Repositories (`src/libs/database/postgres/repositories/`)

Repositories are the **only** layer that talks to Prisma. Services consume them; route handlers never
import `db`.

## Shape — factory function

```ts
export function RoleRepository(tx?: Prisma.TransactionClient) {
	const dbClient = tx || db;

	return {
		async findById(id: string): Promise<{ id: string; name: string } | null> {
			return dbClient.role.findUnique({
				where: { id },
				select: { id: true, name: true },
			});
		},
	};
}
```

- Called each time: `await RoleRepository().findById(id)`, or `RoleRepository(tx)` inside
  `db.$transaction(async (tx) => ...)`. Never cache an instance at module scope.
- `db` is the singleton from `src/libs/database/postgres/client.ts`. Never instantiate `PrismaClient`
  elsewhere.
- Use `select` to return exactly the DTO in `@types`; never return a password hash from a method whose
  name does not say so (`findForAuth`, `findByEmail` used by login).

## Read methods return `null`, they do not throw

A miss is `null`. The service decides whether it is a 404 (`services-crud.md`).

## Soft delete

`User` is soft-deleted. **Every user read includes `deletedAt: null`**, including the
`UserInformation` lookup, which also requires `status: "ACTIVE"`.

## Lists — allow-lists, never raw keys

Each list repository exports, next to the factory:

```ts
export const userSortableFields = ["id", "name", "email", "status", "createdAt", "updatedAt"] as const;
export const userFilterableFields: FilterField[] = [
	{ field: "status", enum: Object.values(UserStatus) },
	"name",
	"email",
	{ field: "roleId", kind: "id" },
	{ field: "createdAt", kind: "date" },
	{ field: "updatedAt", kind: "date" },
];
```

`findAll(query: DatatableType)`:

1. `DatatableToolkit.assertSort(...)`, `assertFilterKeys(...)`, `assertFilterEnums(...)` — unknown or
   out-of-range input is a `BadRequestError` (400). A raw `sort` value never reaches `orderBy`.
2. Build one `where` from the soft-delete filter, the `search` OR-group, and **every** filter ANDed
   together (never let one filter overwrite another).
3. Run `count` and `findMany` in `Promise.all`, `skip: (page - 1) * perPage`, `take: perPage`.
4. Return `{ data, meta: { page, limit: perPage, totalCount } }`.

### Filter kinds

| Kind          | Value                                  | Match                               |
| ------------- | -------------------------------------- | ----------------------------------- |
| enum          | one value or a comma list              | `in`, each value checked            |
| `id`          | one uuid or a comma list               | `in` (uuids validated, 400 if not)  |
| `date`        | `YYYY-MM-DD` or `start,end`            | inclusive whole days in `APP_TIMEZONE` |
| plain         | any string; a comma is literal         | `contains`, `mode: "insensitive"`   |

Search over an enum column (users' `status`) matches the enum members whose name contains the term;
Prisma cannot run `contains` on an enum.

## What repositories should NOT do

- No `throw` for business rules, no `t()`.
- No cache reads or writes, no hashing, no JWT, no mail, no queues.
- No transaction the caller did not supply — accept `tx` and let the service open it.

## File layout

One repository per aggregate, `<entity>.repository.ts`, re-exported from
`src/libs/database/postgres/repositories/index.ts` and imported via `@database`.
