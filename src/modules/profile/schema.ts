import { z } from "@hono/zod-openapi";
import {
	EmailSchema,
	NameSchema,
	OptionalRemarksSchema,
	PasswordSchema,
	StrongPasswordSchema,
} from "@hono-libs";

/**
 * Update profile schema
 * @description Schema for updating user profile information
 * @example { name: "John Doe", email: "john@example.com", remarks: "Updated profile" }
 */
export const UpdateProfileSchema = z
	.object({
		name: NameSchema.openapi({
			description: "User's full name",
			example: "John Doe",
		}),
		email: EmailSchema.openapi({
			description: "User's email address",
			example: "john@example.com",
		}),
		remarks: OptionalRemarksSchema.openapi({
			description: "Optional additional information about the user",
			example: "Software developer with 5 years experience",
		}),
	})
	.openapi("UpdateProfileRequest", {
		description: "User profile update data",
	});

/**
 * Update password schema
 * @description Schema for changing user password (requires current password)
 * @example { current_password: "OldPass123!", new_password: "NewSecure123!" }
 */
export const UpdatePasswordSchema = z
	.object({
		current_password: PasswordSchema.openapi({
			description: "Current password for verification",
			example: "OldPass123!",
		}),
		new_password: StrongPasswordSchema.openapi({
			description:
				"New strong password (min 8 chars, uppercase, lowercase, number, special char)",
			example: "NewSecure123!",
		}),
	})
	.refine((data) => data.current_password !== data.new_password, {
		message: "New password must be different from current password",
		path: ["new_password"],
	})
	.openapi("UpdatePasswordRequest", {
		description: "Password change request with current and new password",
	});
