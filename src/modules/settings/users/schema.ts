import { z } from "@hono/zod-openapi";
import {
	userFilterableFields,
	userFilterExample,
	userSortableFields,
	UserStatus,
} from "@database";
import { EmailSchema, StrongPasswordSchema } from "@hono-libs/schemas";
import { paginatedSchema } from "@hono-libs/schemas";
import { datatableQuerySchema } from "@types";

export const UserQuerySchema = datatableQuerySchema({
	sortFields: userSortableFields,
	filterFields: userFilterableFields,
	filterExample: userFilterExample,
});

const StatusSchema = z.enum(UserStatus).openapi({ example: "ACTIVE" });

const RoleIdsSchema = z
	.array(z.string().uuid())
	.openapi({ example: ["550e8400-e29b-41d4-a716-446655440000"] });

export const UserListSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
		status: StatusSchema,
		remark: z.string().nullable(),
		roles: z.array(z.string()).openapi({ example: ["admin"] }),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.openapi("UserList");

export const UserListResponseSchema = paginatedSchema(UserListSchema);

export const UserDetailSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
		status: StatusSchema,
		remark: z.string().nullable(),
		roles: z.array(z.object({ id: z.string(), name: z.string() })),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.openapi("UserDetail");

export const UserCreateSchema = z
	.object({
		name: z.string().min(1).max(255).openapi({ example: "Jane Doe" }),
		email: EmailSchema,
		password: StrongPasswordSchema,
		status: StatusSchema,
		remark: z.string().max(255).nullable().openapi({ example: null }),
		roleIds: RoleIdsSchema,
	})
	.openapi("UserCreateRequest");

export const UserUpdateSchema = UserCreateSchema.omit({
	password: true,
}).openapi("UserUpdateRequest");

export const UserResetPasswordSchema = z
	.object({ newPassword: StrongPasswordSchema })
	.openapi("UserResetPasswordRequest");

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
