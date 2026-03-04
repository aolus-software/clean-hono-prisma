import { z } from "@hono/zod-openapi";

export type PaginationResponse<T> = {
	data: T[];
	meta: {
		page: number;
		limit: number;
		totalCount: number;
	};
};

export type PaginationKeySetResponse<T> = {
	data: T[];
	meta: {
		page: number;
		limit: number;
		totalCount: number;
		nextCursor: string | null;
		previousCursor: string | null;
	};
};

export const ZodPaginationResponseSchema = <T>(itemSchema: z.ZodType<T>) => {
	return z.object({
		data: z.array(itemSchema),
		meta: z.object({
			page: z.number(),
			limit: z.number(),
			totalCount: z.number(),
		}),
	});
};

export const ZodPaginationKeySetResponseSchema = <T>(
	itemSchema: z.ZodType<T>,
) => {
	return z.object({
		data: z.array(itemSchema),
		meta: z.object({
			page: z.number(),
			limit: z.number(),
			totalCount: z.number(),
			nextCursor: z.string().nullable(),
			previousCursor: z.string().nullable(),
		}),
	});
};
