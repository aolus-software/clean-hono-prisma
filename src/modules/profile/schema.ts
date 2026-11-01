import { z } from "@hono/zod-openapi";
import {
	EmailSchema,
	PasswordLoginSchema,
	StrongPasswordSchema,
} from "@hono-libs/schemas";

export const UpdateProfileSchema = z
	.object({
		name: z.string().min(1).max(255).openapi({ example: "Jane Doe" }),
		email: EmailSchema,
	})
	.openapi("UpdateProfileRequest");

export const UpdatePasswordSchema = z
	.object({
		currentPassword: PasswordLoginSchema,
		newPassword: StrongPasswordSchema,
	})
	.openapi("UpdatePasswordRequest");
