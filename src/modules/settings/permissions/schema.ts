import { z } from "@hono/zod-openapi";
import { ZodPaginationResponseSchema } from "@types";

// Helper to wrap response in success structure
const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		message: z.string(),
		data: dataSchema,
	});

export const PermissionSchema = z.object({
	id: z.string(),
	name: z.string(),
	group: z.string(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const PermissionListResponseSchema = successResponse(
	ZodPaginationResponseSchema(PermissionSchema),
);

export const PermissionDetailResponseSchema = successResponse(PermissionSchema);

export const PermissionCreateSchema = z.object({
	name: z.array(z.string().min(3).max(100)),
	group: z.string().min(3).max(100),
});

export const PermissionUpdateSchema = z.object({
	name: z.string().min(3).max(100),
	group: z.string().min(3).max(100),
});
