import { z } from "@hono/zod-openapi";
import { ZodPaginationResponseSchema } from "@types";

// Helper to wrap response in success structure
const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		message: z.string(),
		data: dataSchema,
	});

export const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	status: z.enum(["active", "inactive", "suspended", "blocked"]).nullable(),
	roles: z.array(z.string()).nullable(),
	created_at: z.coerce.date().nullable(),
	updated_at: z.coerce.date().nullable(),
});

export const UserDetailSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	status: z.enum(["active", "inactive", "suspended", "blocked"]).nullable(),
	remark: z.string().nullable(),
	roles: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
		}),
	),
	created_at: z.coerce.date().nullable(),
	updated_at: z.coerce.date().nullable(),
});

export const UserListResponseSchema = successResponse(
	ZodPaginationResponseSchema(UserSchema),
);

export const UserDetailResponseSchema = successResponse(UserDetailSchema);

export const UserCreateSchema = z.object({
	name: z.string().min(3).max(100),
	email: z.string().email(),
	password: z.string().min(8),
	status: z.enum(["active", "inactive", "suspended", "blocked"]).optional(),
	remark: z.string().optional(),
	role_ids: z.array(z.string().uuid()).optional(),
});

export const UserUpdateSchema = z.object({
	name: z.string().min(3).max(100),
	email: z.string().email(),
	status: z.enum(["active", "inactive", "suspended", "blocked"]).optional(),
	remark: z.string().optional(),
	role_ids: z.array(z.string().uuid()).optional(),
});
