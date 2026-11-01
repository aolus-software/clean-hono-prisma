import { z } from "@hono/zod-openapi";

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

export const RoleSelectOptionsSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
	}),
);
