import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { AuthMiddleware, GuardDescriptions, Guards } from "@hono-libs";
import { commonResponse } from "@hono-libs/schemas";
import { ResponseToolkit } from "@utils";
import {
	UserCreateSchema,
	UserDetailResponseSchema,
	UserListResponseSchema,
	UserUpdateSchema,
} from "./schema";
import { Env, ZodDatatableSchema } from "@types";

const UserRoutes = new OpenAPIHono<Env>();

UserRoutes.use(AuthMiddleware);

// -------------------
// GET /settings/users
// -------------------
const UserGetRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Settings/Users"],
	security: [{ Bearer: [] }],
	request: {
		query: ZodDatatableSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: UserListResponseSchema,
				},
			},
			description: GuardDescriptions.userManagement.list(),
		},
		...commonResponse(UserListResponseSchema, "UserGetResponse", {
			exclude: [200, 201],
		}),
	},
});

UserRoutes.openapi(UserGetRoute, async (c) => {
	const queryParam = c.req.valid("query");
	const service = c.get("userService");
	const users = await service.findAll(queryParam);

	return ResponseToolkit.success(c, users, "Fetched users successfully", 200);
});

UserRoutes.use("/", Guards.userManagement.list());

// -------------------
// POST /settings/users
// -------------------
const UserCreateRoute = createRoute({
	method: "post",
	path: "/",
	tags: ["Settings/Users"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: UserCreateSchema,
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
			description: GuardDescriptions.userManagement.create(),
		},
		...commonResponse(z.object({}), "UserCreateResponse", {
			exclude: [200, 201],
		}),
	},
});

UserRoutes.openapi(UserCreateRoute, async (c) => {
	const data = c.req.valid("json");
	const userService = c.get("userService");
	await userService.create(data);

	return ResponseToolkit.created(c, {}, "User created successfully");
});

UserRoutes.use("/", Guards.userManagement.create());

// -------------------
// GET /settings/users/:id
// -------------------
const UserDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags: ["Settings/Users"],
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
					schema: UserDetailResponseSchema,
				},
			},
			description: GuardDescriptions.userManagement.detail(),
		},
		...commonResponse(UserDetailResponseSchema, "UserDetailResponse", {
			exclude: [200, 201],
		}),
	},
});

UserRoutes.openapi(UserDetailRoute, async (c) => {
	const { id } = c.req.valid("param");
	const service = c.get("userService");
	const user = await service.findOne(id);

	return ResponseToolkit.success(c, user, "Fetched user successfully", 200);
});

UserRoutes.use("/:id", Guards.userManagement.detail());

// -------------------
// PUT /settings/users/:id
// -------------------
const UserUpdateRoute = createRoute({
	method: "put",
	path: "/{id}",
	tags: ["Settings/Users"],
	security: [{ Bearer: [] }],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: {
			content: {
				"application/json": {
					schema: UserUpdateSchema,
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
			description: GuardDescriptions.userManagement.edit(),
		},
		...commonResponse(z.object({}), "UserUpdateResponse", {
			exclude: [200, 201],
		}),
	},
});

UserRoutes.openapi(UserUpdateRoute, async (c) => {
	const { id } = c.req.valid("param");
	const data = c.req.valid("json");
	const service = c.get("userService");
	await service.update(data, id);

	return ResponseToolkit.success(c, {}, "User updated successfully", 200);
});

UserRoutes.use("/:id", Guards.userManagement.edit());

// -------------------
// DELETE /settings/users/:id
// -------------------
const UserDeleteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags: ["Settings/Users"],
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
			description: GuardDescriptions.userManagement.delete(),
		},
		...commonResponse(z.object({}), "UserDeleteResponse", {
			exclude: [200, 201],
		}),
	},
});

UserRoutes.openapi(UserDeleteRoute, async (c) => {
	const { id } = c.req.valid("param");
	const service = c.get("userService");
	await service.delete(id);

	return ResponseToolkit.success(c, {}, "User deleted successfully", 200);
});

UserRoutes.use("/:id", Guards.userManagement.delete());

export default UserRoutes;
