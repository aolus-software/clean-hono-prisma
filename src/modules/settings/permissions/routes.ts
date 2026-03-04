import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { commonResponse } from "@hono-libs/schemas";
import { ResponseToolkit } from "@utils";
import {
	PermissionCreateSchema,
	PermissionDetailResponseSchema,
	PermissionListResponseSchema,
	PermissionUpdateSchema,
} from "./schema";
import { Env, ZodDatatableSchema } from "@types";
import { AuthMiddleware, GuardDescriptions } from "@hono-libs";

const PermissionRoutes = new OpenAPIHono<Env>();

PermissionRoutes.use(AuthMiddleware);

// -------------------
// GET settings/permissions
// -------------------
const PermissionGetRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Settings/Permissions"],
	security: [{ Bearer: [] }],
	request: {
		query: ZodDatatableSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: PermissionListResponseSchema,
				},
			},
			description: GuardDescriptions.superuserOnly("Fetch list of permissions"),
		},
		...commonResponse(PermissionListResponseSchema, "PermissionGetResponse", {
			exclude: [200, 201],
		}),
	},
});

PermissionRoutes.openapi(PermissionGetRoute, async (c) => {
	const queryParam = c.req.valid("query");
	const permissionService = c.get("permissionService");
	const permissions = await permissionService.findAll(queryParam);

	return ResponseToolkit.success(
		c,
		permissions,
		"Fetched permissions successfully",
		200,
	);
});

// -------------------
// POST settings/permissions
// -------------------
const PermissionCreateRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Settings/Permissions"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: PermissionCreateSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				"application/json": {
					schema: z.object({}),
				},
			},
			description: GuardDescriptions.superuserOnly("Create a permission"),
		},
		...commonResponse(z.object({}), "PermissionCreateResponse", {
			exclude: [200, 201],
		}),
	},
});

PermissionRoutes.openapi(PermissionCreateRoute, async (c) => {
	const data = c.req.valid("json");
	const permissionService = c.get("permissionService");
	await permissionService.create(data);

	return ResponseToolkit.created(c, {}, "Permission created successfully");
});

// -------------------
// GET settings/permissions/:id
// -------------------
const PermissionDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags: ["Settings/Permissions"],
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: PermissionDetailResponseSchema,
				},
			},
			description: GuardDescriptions.superuserOnly("Fetch a permission"),
		},
		...commonResponse(
			PermissionDetailResponseSchema,
			"PermissionDetailResponse",
			{
				exclude: [200, 201],
			},
		),
	},
});

PermissionRoutes.openapi(PermissionDetailRoute, async (c) => {
	const { id } = c.req.valid("param");
	const permissionService = c.get("permissionService");
	const permission = await permissionService.findOne(id);

	return ResponseToolkit.success(
		c,
		permission,
		"Fetched permission successfully",
		200,
	);
});

// -------------------
// PUT settings/permissions/:id
// -------------------
const PermissionUpdateRoute = createRoute({
	method: "put",
	path: "/{id}",
	tags: ["Settings/Permissions"],
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: {
			content: {
				"application/json": {
					schema: PermissionUpdateSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({}),
				},
			},
			description: GuardDescriptions.superuserOnly("Update a permission"),
		},
		...commonResponse(z.object({}), "PermissionUpdateResponse", {
			exclude: [200, 201],
		}),
	},
});

PermissionRoutes.openapi(PermissionUpdateRoute, async (c) => {
	const { id } = c.req.valid("param");
	const data = c.req.valid("json");
	const permissionService = c.get("permissionService");
	await permissionService.update(data, id);

	return ResponseToolkit.success(c, {}, "Permission updated successfully", 200);
});

// -------------------
// DELETE settings/permissions/:id
// -------------------
const PermissionDeleteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags: ["Settings/Permissions"],
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({}),
				},
			},
			description: GuardDescriptions.superuserOnly("Delete a permission"),
		},
		...commonResponse(z.object({}), "PermissionDeleteResponse", {
			exclude: [200, 201],
		}),
	},
});

PermissionRoutes.openapi(PermissionDeleteRoute, async (c) => {
	const { id } = c.req.valid("param");
	const permissionService = c.get("permissionService");
	await permissionService.delete(id);

	return ResponseToolkit.success(c, {}, "Permission deleted successfully", 200);
});

export default PermissionRoutes;
