import { z } from "@hono/zod-openapi";

// Helper to wrap response in success structure
const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		message: z.string(),
		data: dataSchema,
	});

export const PermissionSelectOptionsSchema = z.array(
	z.object({
		group: z.string(),
		permissions: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				group: z.string(),
			}),
		),
	}),
);

export const PermissionSelectOptionsResponseSchema = successResponse(
	PermissionSelectOptionsSchema,
);

export const RoleSelectOptionsSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
	}),
);

export const RoleSelectOptionsResponseSchema = successResponse(
	RoleSelectOptionsSchema,
);
