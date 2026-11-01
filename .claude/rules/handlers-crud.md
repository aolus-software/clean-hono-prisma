# Rule: The canonical CRUD module

`src/modules/settings/roles/` is the reference. A CRUD resource has five routes on one
`OpenAPIHono`, mounted under a plural kebab-case prefix. Updates are `PATCH`, never `PUT`.

| Route  | Method + path        | Guard                        | Body             | Success            |
| ------ | -------------------- | ---------------------------- | ---------------- | ------------------ |
| List   | `GET ""`             | `permissionGuard(["<g> list"])`   | — (query)        | 200 `{ data, meta }` |
| Create | `POST ""`            | `permissionGuard(["<g> create"])` | create schema    | **201** `data: null` |
| Detail | `GET "/{id}"`        | `permissionGuard(["<g> detail"])` | —                | 200 detail DTO     |
| Update | `PATCH "/{id}"`      | `permissionGuard(["<g> edit"])`   | update schema (full replace) | 200 `data: null` |
| Delete | `DELETE "/{id}"`     | `permissionGuard(["<g> delete"])` | —                | 200 `data: null`   |

Every route's `middleware` starts with `AuthMiddleware`.

## List

```ts
const RoleListRoute = createRoute({
	method: "get",
	path: "",
	tags: ["Settings/Roles"],
	summary: "List roles",
	description: "Paginated roles. Requires 'role list'.",
	security: [{ Bearer: [] }],
	middleware: [AuthMiddleware, permissionGuard(["role list"])] as const,
	request: { query: RoleQuerySchema },
	responses: { ... },
});

RoleRoutes.openapi(RoleListRoute, async (c) => {
	const query = DatatableToolkit.parseFilter(c, c.req.valid("query"));
	const roles = await c.get("roleService").findAll(query);
	return ResponseToolkit.success(c, roles, t("role.list"), 200);
});
```

`RoleQuerySchema` is `datatableQuerySchema({ sortFields: roleSortableFields, filterFields:
roleFilterableFields })` built from the repository's exports, so `/docs` and enforcement cannot drift.

## Create / Update

The body schema carries the full resource. Relation ids are camelCase arrays (`roleIds`,
`permissionIds`). The handler passes the validated body to the service and returns `null`.

## Detail / Delete

`params` uses the shared uuid param schema. The service throws `NotFoundError` for a missing (or
soft-deleted) row; the handler does not check.

## Status codes by route

| Route  | Codes                                  |
| ------ | -------------------------------------- |
| List   | 200, 400 (bad filter), 401, 403, 422 (bad page/sort), 500 |
| Create | 201, 401, 403, 422 (shape or uniqueness), 500 |
| Detail | 200, 401, 403, 404, 422 (bad uuid), 500 |
| Update | 200, 401, 403, 404, 422, 500           |
| Delete | 200, 401, 403, 404, 422, 500           |

## Sub-resource actions

Actions on one item are `POST "/{id}/<verb-noun>"` (`/settings/users/{id}/reset-password`,
`/{id}/send-verification-email`). Privilege-granting actions are role-gated `superuser`
(`rbac.md`).

## Checklist

- [ ] Five routes, `""` / `"/{id}"`, PATCH for update.
- [ ] `middleware: [AuthMiddleware, permissionGuard([...])]` on each, strings from the seeder.
- [ ] Query schema from the repository's allow-lists.
- [ ] 201 + `null` on create; 200 + `null` on update/delete.
- [ ] `routes.md` route map and `docs/API_DOCUMENTATION.md` updated.
