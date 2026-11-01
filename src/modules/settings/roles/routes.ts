import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import { permissionGuard, withGuardDescription } from "@guards";
import { AuthMiddleware } from "@hono-libs/middlewares/security/auth.middleware";
import { commonResponse, IdParamSchema } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env } from "@types";
import { DatatableToolkit, ResponseToolkit } from "@utils";

import {
	RoleBodySchema,
	RoleDetailSchema,
	RoleListResponseSchema,
	RoleQuerySchema,
} from "./schema";

const RoleRoutes = new OpenAPIHono<Env>({ defaultHook });

const tags = ["Settings/Roles"];
const security = [{ Bearer: [] }];

const RoleListRoute = createRoute({
	method: "get",
	path: "",
	tags,
	security,
	summary: "List roles",
	description: withGuardDescription("Paginated roles. Search matches name.", {
		permissions: ["role list"],
	}),
	middleware: [AuthMiddleware, permissionGuard(["role list"])] as const,
	request: { query: RoleQuerySchema },
	responses: commonResponse(RoleListResponseSchema, "Roles", {
		include: [200, 400, 401, 403, 422, 429, 500],
	}),
});

RoleRoutes.openapi(RoleListRoute, async (c) => {
	const query = DatatableToolkit.parseFilter(c, c.req.valid("query"));
	const roles = await c.get("roleService").findAll(query);
	return ResponseToolkit.success(c, roles, t("role.list"), 200);
});

const RoleCreateRoute = createRoute({
	method: "post",
	path: "",
	tags,
	security,
	summary: "Create role",
	description: withGuardDescription(
		"Create a role with its permissions. A duplicate name or an unknown permission id is 422.",
		{ permissions: ["role create"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["role create"])] as const,
	request: {
		body: {
			content: { "application/json": { schema: RoleBodySchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "Role created", {
		include: [201, 401, 403, 422, 429, 500],
	}),
});

RoleRoutes.openapi(RoleCreateRoute, async (c) => {
	await c.get("roleService").create(c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("role.created"), 201);
});

const RoleDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	security,
	summary: "Role detail",
	description: withGuardDescription(
		"The role plus every permission in the system, grouped, with isAssigned for this role.",
		{ permissions: ["role detail"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["role detail"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(RoleDetailSchema, "Role", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

RoleRoutes.openapi(RoleDetailRoute, async (c) => {
	const role = await c.get("roleService").findOne(c.req.valid("param").id);
	return ResponseToolkit.success(c, role, t("role.detail"), 200);
});

const RoleUpdateRoute = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	security,
	summary: "Update role",
	description: withGuardDescription(
		"Full replace of name and permissions. Holders' cached access is dropped.",
		{ permissions: ["role edit"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["role edit"])] as const,
	request: {
		params: IdParamSchema,
		body: {
			content: { "application/json": { schema: RoleBodySchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "Role updated", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

RoleRoutes.openapi(RoleUpdateRoute, async (c) => {
	await c
		.get("roleService")
		.update(c.req.valid("param").id, c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("role.updated"), 200);
});

const RoleDeleteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	security,
	summary: "Delete role",
	description: withGuardDescription(
		"Hard delete; user and permission assignments go with it.",
		{ permissions: ["role delete"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["role delete"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(z.null(), "Role deleted", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

RoleRoutes.openapi(RoleDeleteRoute, async (c) => {
	await c.get("roleService").delete(c.req.valid("param").id);
	return ResponseToolkit.success(c, null, t("role.deleted"), 200);
});

export default RoleRoutes;
