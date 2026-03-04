import { z } from "zod";

// Base response schemas
export const createSuccessSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
	messageExample: string = "Success",
) => {
	return z.object({
		success: z.boolean().openapi({ example: true }),
		message: z.string().openapi({ example: messageExample }),
		data: dataSchema,
	});
};

export const createErrorSchema = (
	messageExample: string = "Error",
	includeErrors: boolean = false,
) => {
	const baseSchema = {
		success: z.literal(false),
		message: z.string().openapi({ example: messageExample }),
		data: z.null(),
	};

	if (includeErrors) {
		return z.object({
			...baseSchema,
			errors: z.array(z.any()).optional().openapi({ example: [] }),
		});
	}

	return z.object(baseSchema);
};

// Response definition type
type ResponseDefinition = {
	statusCode: number;
	messageExample: string;
	description: string;
	includeErrors?: boolean;
};

// Standard response definitions
const STANDARD_RESPONSES: Record<string, ResponseDefinition> = {
	success: {
		statusCode: 200,
		messageExample: "Success",
		description: "Success",
	},
	created: {
		statusCode: 201,
		messageExample: "Created",
		description: "Created",
	},
	badRequest: {
		statusCode: 400,
		messageExample: "Bad Request",
		description: "Bad Request",
		includeErrors: true,
	},
	unauthorized: {
		statusCode: 401,
		messageExample: "Unauthorized",
		description: "Unauthorized",
		includeErrors: true,
	},
	forbidden: {
		statusCode: 403,
		messageExample: "Forbidden",
		description: "Forbidden",
		includeErrors: true,
	},
	notFound: {
		statusCode: 404,
		messageExample: "Not Found",
		description: "Not Found",
		includeErrors: true,
	},
	validationError: {
		statusCode: 422,
		messageExample: "Validation Error",
		description: "Validation Error",
		includeErrors: true,
	},
	internalError: {
		statusCode: 500,
		messageExample: "Internal Server Error",
		description: "Internal Server Error",
		includeErrors: true,
	},
	serviceUnavailable: {
		statusCode: 503,
		messageExample: "Service Unavailable",
		description: "Service Unavailable",
		includeErrors: true,
	},
};

// Helper to create a single response definition
const createResponseDefinition = (
	schema: z.ZodTypeAny,
	description: string,
) => {
	return {
		content: {
			"application/json": {
				schema,
			},
		},
		description,
	};
};

/**
 * Create OpenAPI response schemas for common HTTP status codes
 * @param dataSchema - Zod schema for the success response data
 * @param successDescription - Description for the success response (200)
 * @param options - Configuration options
 * @returns Object with status code keys and OpenAPI response definitions
 */
export const commonResponse = <T extends z.ZodTypeAny>(
	dataSchema: T,
	successDescription: string = "Success",
	options: {
		exclude?: number[];
		include?: number[];
		customMessages?: Partial<Record<number, string>>;
		validationErrors?: { [key: string]: string[] };
	} = {},
) => {
	const {
		exclude = [],
		include,
		customMessages = {},
		validationErrors,
	} = options;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: Record<number, any> = {};

	// Success responses (200, 201)
	const successResponseDefs = [
		{ ...STANDARD_RESPONSES.success, description: successDescription },
		STANDARD_RESPONSES.created,
	];

	for (const def of successResponseDefs) {
		const shouldInclude =
			!exclude.includes(def.statusCode) &&
			(!include || include.includes(def.statusCode));

		if (shouldInclude) {
			const message = customMessages[def.statusCode] || def.messageExample;
			result[def.statusCode] = createResponseDefinition(
				createSuccessSchema(dataSchema, message),
				def.description,
			);
		}
	}

	// Error responses (400, 401, 403, 404, 422, 500, 503)
	const errorResponseDefs = [
		STANDARD_RESPONSES.badRequest,
		STANDARD_RESPONSES.unauthorized,
		STANDARD_RESPONSES.forbidden,
		STANDARD_RESPONSES.notFound,
		STANDARD_RESPONSES.validationError,
		STANDARD_RESPONSES.internalError,
		STANDARD_RESPONSES.serviceUnavailable,
	];

	for (const def of errorResponseDefs) {
		const shouldInclude =
			!exclude.includes(def.statusCode) &&
			(!include || include.includes(def.statusCode));

		if (shouldInclude) {
			const message = customMessages[def.statusCode] || def.messageExample;
			const schema =
				def.statusCode === 422
					? createErrorSchema(message, true).extend({
							errors: z
								.array(z.any())
								.optional()
								.openapi({
									example: validationErrors || [
										{
											email: ["Email is required"],
											password: [
												"Password must be at least 6 characters long",
												"Password must contain a number",
											],
										},
									],
								}),
						})
					: createErrorSchema(message, def.includeErrors);

			result[def.statusCode] = createResponseDefinition(
				schema,
				def.description,
			);
		}
	}

	return result;
};

/**
 * Create a custom OpenAPI response definition
 * @param schema - Zod schema for the response data
 * @param description - Description of the response
 * @param messageExample - Example message for the response
 */
export const createResponse = <T extends z.ZodTypeAny>(
	schema: T,
	description: string = "Response",
	messageExample: string = "Success",
) => {
	return createResponseDefinition(
		createSuccessSchema(schema, messageExample),
		description,
	);
};

/**
 * Create an error response definition
 * @param description - Description of the error
 * @param messageExample - Example error message
 * @param includeErrors - Whether to include errors array
 */
export const createErrorResponse = (
	description: string = "Error",
	messageExample: string = "Error",
	includeErrors: boolean = true,
) => {
	return createResponseDefinition(
		createErrorSchema(messageExample, includeErrors),
		description,
	);
};

/**
 * Helper to quickly create standard success responses
 */
export const successResponses = <T extends z.ZodTypeAny>(
	dataSchema: T,
	description: string = "Success",
) => {
	return commonResponse(dataSchema, description, {
		include: [200, 201],
	});
};

/**
 * Helper for quickly create validation error response
 */
export const validationErrorResponse = (errors: {
	[key: string]: string[];
}) => {
	return createResponseDefinition(
		createErrorSchema("Validation Error", true).extend({
			errors: z.array(z.any()).openapi({ example: errors }),
		}),
		"Validation Error",
	);
};

/**
 * Helper to quickly create standard error responses
 */
export const errorResponses = () => {
	return commonResponse(z.null(), "", {
		include: [400, 401, 403, 404, 422, 500],
	});
};
