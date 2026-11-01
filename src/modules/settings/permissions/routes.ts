import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import { permissionGuard, withGuardDescription } from "@guards";
import { AuthMiddleware } from "@hono-libs/middlewares/security/auth.middleware";
import { commonResponse, IdParamSchema } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env } from "@types";
import { DatatableToolkit, ResponseToolkit } from "@utils";

import {
	PermissionCreateSchema,
	PermissionListResponseSchema,
	PermissionQuerySchema,
	PermissionSchema,
	PermissionUpdateSchema,
} from "./schema";

const PermissionRoutes = new OpenAPIHono<Env>({ defaultHook });

const tags = ["Settings/Permissions"];
const security = [{ Bearer: [] }];

const PermissionListRoute = createRoute({
	method: "get",
	path: "",
	tags,
	security,
	summary: "List permissions",
	description: withGuardDescription(
		"Paginated permissions. Search matches name and group.",
		{ permissions: ["permission list"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["permission list"])] as const,
	request: { query: PermissionQuerySchema },
	responses: commonResponse(PermissionListResponseSchema, "Permissions", {
		include: [200, 400, 401, 403, 422, 429, 500],
	}),
});

PermissionRoutes.openapi(PermissionListRoute, async (c) => {
	const query = DatatableToolkit.parseFilter(c, c.req.valid("query"));
	const permissions = await c.get("permissionService").findAll(query);
	return ResponseToolkit.success(c, permissions, t("permission.list"), 200);
});

const PermissionCreateRoute = createRoute({
	method: "post",
	path: "",
	tags,
	security,
	summary: "Create permissions",
	description: withGuardDescription(
		'Create one permission per action in `name`, each stored as "<group> <name>". Any name that already exists is 422.',
		{ permissions: ["permission create"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["permission create"])] as const,
	request: {
		body: {
			content: { "application/json": { schema: PermissionCreateSchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "Permissions created", {
		include: [201, 401, 403, 422, 429, 500],
	}),
});

PermissionRoutes.openapi(PermissionCreateRoute, async (c) => {
	await c.get("permissionService").create(c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("permission.created"), 201);
});

const PermissionDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	security,
	summary: "Permission detail",
	description: withGuardDescription("One permission.", {
		permissions: ["permission detail"],
	}),
	middleware: [AuthMiddleware, permissionGuard(["permission detail"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(PermissionSchema, "Permission", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

PermissionRoutes.openapi(PermissionDetailRoute, async (c) => {
	const permission = await c
		.get("permissionService")
		.findOne(c.req.valid("param").id);
	return ResponseToolkit.success(c, permission, t("permission.detail"), 200);
});

const PermissionUpdateRoute = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	security,
	summary: "Update permission",
	description: withGuardDescription(
		'`name` is stored verbatim, unlike create: send the full "<group> <action>" string. A duplicate name is 422.',
		{ permissions: ["permission edit"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["permission edit"])] as const,
	request: {
		params: IdParamSchema,
		body: {
			content: { "application/json": { schema: PermissionUpdateSchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "Permission updated", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

PermissionRoutes.openapi(PermissionUpdateRoute, async (c) => {
	await c
		.get("permissionService")
		.update(c.req.valid("param").id, c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("permission.updated"), 200);
});

const PermissionDeleteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	security,
	summary: "Delete permission",
	description: withGuardDescription(
		"Hard delete; role assignments go with it.",
		{ permissions: ["permission delete"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["permission delete"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(z.null(), "Permission deleted", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

PermissionRoutes.openapi(PermissionDeleteRoute, async (c) => {
	await c.get("permissionService").delete(c.req.valid("param").id);
	return ResponseToolkit.success(c, null, t("permission.deleted"), 200);
});

export default PermissionRoutes;
