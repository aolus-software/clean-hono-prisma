import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
	RoleCreateSchema,
	RoleDetailResponseSchema,
	RoleListResponseSchema,
	RoleUpdateSchema,
} from "./schema";
import { Env, ZodDatatableSchema } from "@types";
import { AuthMiddleware, GuardDescriptions, Guards } from "@hono-libs";
import { commonResponse } from "@hono-libs/schemas";
import { ResponseToolkit } from "@utils";

const RoleRoutes = new OpenAPIHono<Env>();

RoleRoutes.use(AuthMiddleware);

// -------------------
// GET /settings/roles
// -------------------
const RoleGetRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Settings/Roles"],
	security: [{ Bearer: [] }],
	request: {
		query: ZodDatatableSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: RoleListResponseSchema,
				},
			},
			description: GuardDescriptions.roleManagement.list(),
		},
		...commonResponse(RoleListResponseSchema, "RoleGetResponse", {
			exclude: [200, 201],
		}),
	},
});

RoleRoutes.openapi(RoleGetRoute, async (c) => {
	const queryParam = c.req.valid("query");
	const roleService = c.get("roleService");
	const roles = await roleService.findAll(queryParam);

	return ResponseToolkit.success(c, roles, "Fetched roles successfully", 200);
});

RoleRoutes.use("/", Guards.roleManagement.list());

// -------------------
// POST /settings/roles
// -------------------
const RoleCreateRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Settings/Roles"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: RoleCreateSchema,
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
			description: GuardDescriptions.roleManagement.create(),
		},
		...commonResponse(z.object({}), "RoleCreateResponse", {
			exclude: [200, 201],
		}),
	},
});

RoleRoutes.openapi(RoleCreateRoute, async (c) => {
	const data = c.req.valid("json");
	const roleService = c.get("roleService");
	await roleService.create(data);

	return ResponseToolkit.created(c, {}, "Role created successfully");
});

RoleRoutes.use("/", Guards.roleManagement.create());

// -------------------
// GET /settings/roles/:id
// -------------------
const RoleDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags: ["Settings/Roles"],
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
					schema: RoleDetailResponseSchema,
				},
			},
			description: GuardDescriptions.roleManagement.detail(),
		},
		...commonResponse(RoleDetailResponseSchema, "RoleDetailResponse", {
			exclude: [200, 201],
		}),
	},
});

RoleRoutes.openapi(RoleDetailRoute, async (c) => {
	const { id } = c.req.valid("param");
	const roleService = c.get("roleService");
	const role = await roleService.findOne(id);

	return ResponseToolkit.success(c, role, "Fetched role successfully", 200);
});

RoleRoutes.use("/:id", Guards.roleManagement.detail());

// -------------------
// PUT /settings/roles/:id
// -------------------
const RoleUpdateRoute = createRoute({
	method: "put",
	path: "/{id}",
	tags: ["Settings/Roles"],
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: {
			content: {
				"application/json": {
					schema: RoleUpdateSchema,
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
			description: GuardDescriptions.roleManagement.edit(),
		},
		...commonResponse(z.object({}), "RoleUpdateResponse", {
			exclude: [200, 201],
		}),
	},
});

RoleRoutes.openapi(RoleUpdateRoute, async (c) => {
	const { id } = c.req.valid("param");
	const data = c.req.valid("json");
	const roleService = c.get("roleService");
	await roleService.update(data, id);

	return ResponseToolkit.success(c, {}, "Role updated successfully", 200);
});

RoleRoutes.use("/:id", Guards.roleManagement.edit());

// -------------------
// DELETE /settings/roles/:id
// -------------------
const RoleDeleteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags: ["Settings/Roles"],
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
			description: GuardDescriptions.roleManagement.delete(),
		},
		...commonResponse(z.object({}), "RoleDeleteResponse", {
			exclude: [200, 201],
		}),
	},
});

RoleRoutes.openapi(RoleDeleteRoute, async (c) => {
	const { id } = c.req.valid("param");
	const roleService = c.get("roleService");
	await roleService.delete(id);

	return ResponseToolkit.success(c, {}, "Role deleted successfully", 200);
});

RoleRoutes.use("/:id", Guards.roleManagement.delete());

export default RoleRoutes;
