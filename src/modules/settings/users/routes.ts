import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import { permissionGuard, roleGuard, withGuardDescription } from "@guards";
import { AuthMiddleware } from "@hono-libs/middlewares/security/auth.middleware";
import { commonResponse, IdParamSchema } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env } from "@types";
import { DatatableToolkit, ResponseToolkit } from "@utils";

import {
	UserCreateSchema,
	UserDetailSchema,
	UserListResponseSchema,
	UserQuerySchema,
	UserResetPasswordSchema,
	UserUpdateSchema,
} from "./schema";

const UserRoutes = new OpenAPIHono<Env>({ defaultHook });

const tags = ["Settings/Users"];
const security = [{ Bearer: [] }];

const UserListRoute = createRoute({
	method: "get",
	path: "",
	tags,
	security,
	summary: "List users",
	description: withGuardDescription(
		"Paginated live users. Search matches name, email and status.",
		{ permissions: ["user list"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["user list"])] as const,
	request: { query: UserQuerySchema },
	responses: commonResponse(UserListResponseSchema, "Users", {
		include: [200, 400, 401, 403, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserListRoute, async (c) => {
	const query = DatatableToolkit.parseFilter(c, c.req.valid("query"));
	const users = await c.get("userService").findAll(query);
	return ResponseToolkit.success(c, users, t("user.list"), 200);
});

const UserCreateRoute = createRoute({
	method: "post",
	path: "",
	tags,
	security,
	summary: "Create user",
	description: withGuardDescription(
		"Create a user with roles. An email used by a live account, or an unknown role id, is 422.",
		{ permissions: ["user create"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["user create"])] as const,
	request: {
		body: {
			content: { "application/json": { schema: UserCreateSchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "User created", {
		include: [201, 401, 403, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserCreateRoute, async (c) => {
	await c.get("userService").create(c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("user.created"), 201);
});

const UserDetailRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	security,
	summary: "User detail",
	description: withGuardDescription("One live user with roles.", {
		permissions: ["user detail"],
	}),
	middleware: [AuthMiddleware, permissionGuard(["user detail"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(UserDetailSchema, "User", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserDetailRoute, async (c) => {
	const user = await c.get("userService").findOne(c.req.valid("param").id);
	return ResponseToolkit.success(c, user, t("user.detail"), 200);
});

const UserUpdateRoute = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	security,
	summary: "Update user",
	description: withGuardDescription(
		"Full replace of name, email, status, remark and roles. No password.",
		{ permissions: ["user edit"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["user edit"])] as const,
	request: {
		params: IdParamSchema,
		body: {
			content: { "application/json": { schema: UserUpdateSchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "User updated", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserUpdateRoute, async (c) => {
	await c
		.get("userService")
		.update(c.req.valid("param").id, c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("user.updated"), 200);
});

const UserResetPasswordRoute = createRoute({
	method: "post",
	path: "/{id}/reset-password",
	tags,
	security,
	summary: "Set a user's password",
	description: withGuardDescription(
		"Administrative password reset. Privilege-granting, so role-gated.",
		{ roles: ["superuser"] },
	),
	middleware: [AuthMiddleware, roleGuard(["superuser"])] as const,
	request: {
		params: IdParamSchema,
		body: {
			content: { "application/json": { schema: UserResetPasswordSchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "Password reset", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserResetPasswordRoute, async (c) => {
	await c
		.get("userService")
		.resetPassword(c.req.valid("param").id, c.req.valid("json").newPassword);
	return ResponseToolkit.success(c, null, t("user.passwordReset"), 200);
});

const UserSendVerificationRoute = createRoute({
	method: "post",
	path: "/{id}/send-verification-email",
	tags,
	security,
	summary: "Send verification email",
	description: withGuardDescription(
		"Issue a new verification link and mail it to the user.",
		{ permissions: ["user create"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["user create"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(z.null(), "Email queued", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserSendVerificationRoute, async (c) => {
	await c.get("userService").sendVerificationEmail(c.req.valid("param").id);
	return ResponseToolkit.success(c, null, t("auth.verificationEmailSent"), 200);
});

const UserSendResetRoute = createRoute({
	method: "post",
	path: "/{id}/send-reset-password-email",
	tags,
	security,
	summary: "Send reset password email",
	description: withGuardDescription(
		"Issue a new reset link and mail it to the user.",
		{ permissions: ["user create"] },
	),
	middleware: [AuthMiddleware, permissionGuard(["user create"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(z.null(), "Email queued", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserSendResetRoute, async (c) => {
	await c.get("userService").sendResetPasswordEmail(c.req.valid("param").id);
	return ResponseToolkit.success(
		c,
		null,
		t("auth.resetPasswordEmailSent"),
		200,
	);
});

const UserDeleteRoute = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	security,
	summary: "Delete user",
	description: withGuardDescription("Soft delete.", {
		permissions: ["user delete"],
	}),
	middleware: [AuthMiddleware, permissionGuard(["user delete"])] as const,
	request: { params: IdParamSchema },
	responses: commonResponse(z.null(), "User deleted", {
		include: [200, 401, 403, 404, 422, 429, 500],
	}),
});

UserRoutes.openapi(UserDeleteRoute, async (c) => {
	await c.get("userService").delete(c.req.valid("param").id);
	return ResponseToolkit.success(c, null, t("user.deleted"), 200);
});

export default UserRoutes;
