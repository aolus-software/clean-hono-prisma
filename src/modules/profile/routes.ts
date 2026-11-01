import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { defaultHook } from "@errors";
import { AuthMiddleware } from "@hono-libs/middlewares/security/auth.middleware";
import { commonResponse } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env, ZodUserInformation } from "@types";
import { ResponseToolkit } from "@utils";

import { UpdatePasswordSchema, UpdateProfileSchema } from "./schema";

const ProfileRoutes = new OpenAPIHono<Env>({ defaultHook });

const GetProfileRoute = createRoute({
	method: "get",
	path: "",
	tags: ["Profile"],
	summary: "Current user",
	description: "The authenticated user's identity, roles and permissions.",
	security: [{ Bearer: [] }],
	middleware: [AuthMiddleware] as const,
	responses: commonResponse(ZodUserInformation, "Profile", {
		include: [200, 401, 429, 500],
	}),
});

ProfileRoutes.openapi(GetProfileRoute, (c) =>
	ResponseToolkit.success(c, c.get("currentUser"), t("profile.retrieved"), 200),
);

const UpdateProfileRoute = createRoute({
	method: "patch",
	path: "",
	tags: ["Profile"],
	summary: "Update profile",
	description:
		"Update the authenticated user's name and email. An email used by another live account is 422.",
	security: [{ Bearer: [] }],
	middleware: [AuthMiddleware] as const,
	request: {
		body: {
			content: { "application/json": { schema: UpdateProfileSchema } },
			required: true,
		},
	},
	responses: commonResponse(ZodUserInformation, "Profile updated", {
		include: [200, 401, 422, 429, 500],
	}),
});

ProfileRoutes.openapi(UpdateProfileRoute, async (c) => {
	const user = await c
		.get("profileService")
		.updateProfile(c.get("currentUser").id, c.req.valid("json"));
	return ResponseToolkit.success(c, user, t("profile.updated"), 200);
});

const UpdatePasswordRoute = createRoute({
	method: "patch",
	path: "/password",
	tags: ["Profile"],
	summary: "Change password",
	description:
		"Change the authenticated user's password. A wrong `currentPassword` is 422. Success drops the cached user; refresh tokens are stateless, so ones already issued stay valid until they expire.",
	security: [{ Bearer: [] }],
	middleware: [AuthMiddleware] as const,
	request: {
		body: {
			content: { "application/json": { schema: UpdatePasswordSchema } },
			required: true,
		},
	},
	responses: commonResponse(z.null(), "Password changed", {
		include: [200, 401, 422, 429, 500],
	}),
});

ProfileRoutes.openapi(UpdatePasswordRoute, async (c) => {
	await c
		.get("profileService")
		.changePassword(c.get("currentUser").id, c.req.valid("json"));
	return ResponseToolkit.success(c, null, t("profile.passwordChanged"), 200);
});

export default ProfileRoutes;
