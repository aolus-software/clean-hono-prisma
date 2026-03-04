import { z } from "@hono/zod-openapi";
import { ZodPaginationResponseSchema } from "@types";

// Helper to wrap response in success structure
const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		message: z.string(),
		data: dataSchema,
	});

export const RoleSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const RoleDetailSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	permissions: z.array(
		z.object({
			group: z.string(),
			names: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					is_assigned: z.boolean(),
				}),
			),
		}),
	),
});

export const RoleListResponseSchema = successResponse(
	ZodPaginationResponseSchema(RoleSchema),
);

export const RoleDetailResponseSchema = successResponse(RoleDetailSchema);

export const RoleCreateSchema = z.object({
	name: z.string().min(3).max(100),
	permission_ids: z.array(z.string().uuid()),
});

export const RoleUpdateSchema = z.object({
	name: z.string().min(3).max(100),
	permission_ids: z.array(z.string().uuid()),
});
