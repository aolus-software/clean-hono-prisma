import { z } from "@hono/zod-openapi";
import {
	roleFilterableFields,
	roleFilterExample,
	roleSortableFields,
} from "@database";
import { paginatedSchema } from "@hono-libs/schemas";
import { datatableQuerySchema } from "@types";

export const RoleQuerySchema = datatableQuerySchema({
	sortFields: roleSortableFields,
	filterFields: roleFilterableFields,
	filterExample: roleFilterExample,
});

export const RoleListSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.openapi("RoleList");

export const RoleListResponseSchema = paginatedSchema(RoleListSchema);

export const RoleDetailSchema = RoleListSchema.extend({
	permissions: z.array(
		z.object({
			group: z.string(),
			names: z.array(
				z.object({ id: z.string(), name: z.string(), isAssigned: z.boolean() }),
			),
		}),
	),
}).openapi("RoleDetail");

export const RoleBodySchema = z
	.object({
		name: z.string().min(1).max(100).openapi({ example: "editor" }),
		permissionIds: z
			.array(z.string().uuid())
			.openapi({ example: ["550e8400-e29b-41d4-a716-446655440000"] }),
	})
	.openapi("RoleRequest");

export type RoleInput = z.infer<typeof RoleBodySchema>;
