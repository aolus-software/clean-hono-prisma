import { z } from "@hono/zod-openapi";
import {
	permissionFilterableFields,
	permissionFilterExample,
	permissionSortableFields,
} from "@database";
import { paginatedSchema } from "@hono-libs/schemas";
import { datatableQuerySchema } from "@types";

export const PermissionQuerySchema = datatableQuerySchema({
	sortFields: permissionSortableFields,
	filterFields: permissionFilterableFields,
	filterExample: permissionFilterExample,
});

export const PermissionSchema = z
	.object({
		id: z.string(),
		name: z.string().openapi({ example: "user list" }),
		group: z.string().openapi({ example: "user" }),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.openapi("PermissionList");

export const PermissionListResponseSchema = paginatedSchema(PermissionSchema);

export const PermissionCreateSchema = z
	.object({
		name: z
			.array(z.string().min(1).max(255))
			.min(1)
			.openapi({
				description: 'Actions; each is stored as "<group> <name>"',
				example: ["export", "import"],
			}),
		group: z.string().min(1).max(100).openapi({ example: "user" }),
	})
	.openapi("PermissionCreateRequest");

export const PermissionUpdateSchema = z
	.object({
		name: z.string().min(1).max(255).openapi({
			description: 'Stored verbatim: send the full "<group> <action>" string',
			example: "user export",
		}),
		group: z.string().min(1).max(100).openapi({ example: "user" }),
	})
	.openapi("PermissionUpdateRequest");

export type PermissionCreateInput = z.infer<typeof PermissionCreateSchema>;
export type PermissionUpdateInput = z.infer<typeof PermissionUpdateSchema>;
