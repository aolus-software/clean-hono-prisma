import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { commonResponse } from "@hono-libs/schemas";
import { ResponseToolkit } from "@utils";
import { defaultHook } from "@errors";
import { UpdatePasswordSchema, UpdateProfileSchema } from "./schema";
import { ProfileService } from "./service";
import { Env, ZodUserInformation } from "@types";
import { AuthMiddleware } from "@hono-libs/middlewares/index";

const ProfileRoutes = new OpenAPIHono<Env>({ defaultHook });

// Apply auth middleware to all profile routes
ProfileRoutes.use("*", AuthMiddleware);

// ============================================================
// GET /profile
// ============================================================

const GetProfileRoute = createRoute({
	method: "get",
	path: "/",
	summary: "Get current user profile",
	description:
		"Retrieve the authenticated user's profile information including name, email, role, and other account details. Requires valid JWT token.",
	tags: ["Profile"],
	security: [
		{
			Bearer: [],
		},
	],
	responses: {
		...commonResponse(
			ZodUserInformation,
			"User profile retrieved successfully",
			{
				exclude: [201, 422, 402, 404, 403],
			},
		),
	},
});

ProfileRoutes.openapi(GetProfileRoute, (c) => {
	const user = c.get("currentUser");

	return ResponseToolkit.success(
		c,
		user,
		"User profile retrieved successfully",
		200,
	);
});

// ============================================================
// PUT /profile
// ============================================================

const UpdateProfileRoute = createRoute({
	method: "put",
	path: "",
	summary: "Update user profile",
	description:
		"Update the authenticated user's profile information. All fields are optional but at least one field should be provided. Email changes may require re-verification.",
	tags: ["Profile"],
	security: [
		{
			Bearer: [],
		},
	],
	request: {
		body: {
			content: {
				"application/json": {
					schema: UpdateProfileSchema,
					example: {
						name: "John Doe",
						email: "john.doe@example.com",
						remarks: "Senior Software Engineer",
					},
				},
			},
			description: "Updated profile information",
			required: true,
		},
	},
	responses: {
		...commonResponse(ZodUserInformation, "User profile updated successfully", {
			exclude: [201, 402, 404, 403],
			validationErrors: {
				name: ["Name must be at least 1 character", "Name is required"],
				email: ["Invalid email format", "Email is already in use"],
				remarks: ["Remarks must not exceed 500 characters"],
			},
		}),
	},
});

ProfileRoutes.openapi(UpdateProfileRoute, async (c) => {
	const user = c.get("currentUser");
	const updateData = c.req.valid("json");
	const service = c.get("profileService");
	const result = await service.updateUserProfile(user, updateData);

	return ResponseToolkit.success(
		c,
		result,
		"User profile updated successfully",
		200,
	);
});

// ============================================================
// PUT /profile/password
// ============================================================

const UpdatePasswordRoute = createRoute({
	method: "put",
	path: "/password",
	summary: "Change user password",
	description:
		"Change the authenticated user's password. Requires current password for verification. New password must meet security requirements: min 8 characters, uppercase, lowercase, number, and special character. New password must be different from current password.",
	tags: ["Profile"],
	security: [
		{
			Bearer: [],
		},
	],
	request: {
		body: {
			content: {
				"application/json": {
					schema: UpdatePasswordSchema,
					example: {
						current_password: "OldPass123!",
						new_password: "NewSecure123!",
					},
				},
			},
			description: "Current password and new password",
			required: true,
		},
	},
	responses: {
		...commonResponse(
			z.object({
				message: z
					.string()
					.openapi({ example: "Password updated successfully" }),
			}),
			"User password updated successfully",
			{
				exclude: [201, 402, 404, 403],
				validationErrors: {
					current_password: [
						"Current password is required",
						"Current password is incorrect",
					],
					new_password: [
						"New password must be at least 8 characters",
						"New password must contain uppercase, lowercase, number, and special character",
						"New password must be different from current password",
					],
				},
			},
		),
	},
});

ProfileRoutes.openapi(UpdatePasswordRoute, async (c) => {
	// ✨ Typed context - automatic type inference!
	const user = c.get("currentUser");

	await new ProfileService().changeUserPassword(user, c.req.valid("json"));

	return ResponseToolkit.success(
		c,
		{ message: "Password updated successfully" },
		"User password updated successfully",
		200,
	);
});

export default ProfileRoutes;
