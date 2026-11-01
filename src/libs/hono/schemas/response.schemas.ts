import { z } from "@hono/zod-openapi";

const DESCRIPTIONS: Record<number, string> = {
	200: "Success",
	201: "Created",
	400: "Bad request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not found",
	422: "Validation failed",
	429: "Too many requests",
	500: "Internal server error",
	503: "Service unavailable",
};

const DEFAULT_CODES = [200, 400, 401, 403, 404, 422, 429, 500];

export const successSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
	status: number = 200,
) =>
	z.object({
		status: z.number().openapi({ example: status }),
		success: z.literal(true),
		message: z.string().openapi({ example: DESCRIPTIONS[status] }),
		data: dataSchema,
	});

export const fieldErrorSchema = (status: 400 | 422) =>
	z.object({
		status: z.number().openapi({ example: status }),
		success: z.literal(false),
		message: z.string().openapi({ example: DESCRIPTIONS[status] }),
		errors: z
			.array(z.object({ field: z.string(), message: z.string() }))
			.openapi({ example: [{ field: "email", message: "Invalid value" }] }),
	});

export const errorSchema = (status: number) =>
	z.object({
		status: z.number().openapi({ example: status }),
		success: z.literal(false),
		message: z.string().openapi({ example: DESCRIPTIONS[status] }),
		data: z.null(),
	});

export const rateLimitSchema = z.object({
	status: z.number().openapi({ example: 429 }),
	success: z.literal(false),
	message: z.string().openapi({ example: DESCRIPTIONS[429] }),
});

export const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		data: z.array(itemSchema),
		meta: z.object({
			page: z.number().openapi({ example: 1 }),
			limit: z.number().openapi({ example: 10 }),
			totalCount: z.number().openapi({ example: 42 }),
		}),
	});

const responseFor = (code: number, dataSchema: z.ZodTypeAny) => {
	if (code === 200 || code === 201) return successSchema(dataSchema, code);
	if (code === 400 || code === 422) return fieldErrorSchema(code);
	if (code === 429) return rateLimitSchema;
	return errorSchema(code);
};

/**
 * OpenAPI `responses` for a route, in the canonical envelope. `include`
 * replaces the default code list; `exclude` removes codes from it.
 */
export const commonResponse = <T extends z.ZodTypeAny>(
	dataSchema: T,
	successDescription: string = "Success",
	options: { include?: number[]; exclude?: number[] } = {},
) => {
	const codes = (options.include ?? DEFAULT_CODES).filter(
		(code) => !(options.exclude ?? []).includes(code),
	);

	return Object.fromEntries(
		codes.map((code) => [
			code,
			{
				content: {
					"application/json": { schema: responseFor(code, dataSchema) },
				},
				description:
					code === 200 || code === 201
						? successDescription
						: (DESCRIPTIONS[code] ?? "Error"),
			},
		]),
	);
};
