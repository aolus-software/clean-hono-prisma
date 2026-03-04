import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

// Type for validation errors
export type ValidationErrors = Record<string, string[]>;

// Type for the success response structure
export interface SuccessResponse<T> {
	success: true;
	message: string;
	data: T;
}

// Type for the error response structure
export interface ErrorResponse {
	success: false;
	message: string;
	data: null;
	errors?: ValidationErrors | string[];
}

// Type for the base response structure (union of success and error)
export type BaseResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Response toolkit for standardized API responses
 */
export class ResponseToolkit {
	/**
	 * Send a success response
	 */
	static success<T, Status extends ContentfulStatusCode = 200>(
		ctx: Context,
		data: T,
		message: string = "Success",
		statusCode: Status = 200 as Status,
	) {
		return ctx.json<SuccessResponse<T>, Status>(
			{
				success: true,
				message,
				data,
			},
			{ status: statusCode },
		);
	}

	/**
	 * Send an error response
	 */
	static error<Status extends ContentfulStatusCode = 400>(
		ctx: Context,
		message: string,
		statusCode: Status = 400 as Status,
		errors?: ValidationErrors | string[],
	) {
		const response: ErrorResponse = {
			success: false,
			message,
			data: null,
		};

		if (errors) {
			response.errors = errors;
		}

		return ctx.json<ErrorResponse, Status>(response, { status: statusCode });
	}

	/**
	 * Send a 404 Not Found response
	 */
	static notFound(ctx: Context, message: string = "Resource not found") {
		return this.error(ctx, message, 404);
	}

	/**
	 * Send a 401 Unauthorized response
	 */
	static unauthorized(ctx: Context, message: string = "Unauthorized") {
		return this.error(ctx, message, 401);
	}

	/**
	 * Send a 403 Forbidden response
	 */
	static forbidden(ctx: Context, message: string = "Forbidden") {
		return this.error(ctx, message, 403);
	}

	/**
	 * Send a 422 Validation Error response
	 */
	static validationError<Status extends ContentfulStatusCode = 422>(
		ctx: Context,
		errors: ValidationErrors,
		message: string = "Validation failed",
		statusCode: Status = 422 as Status,
	) {
		return ctx.json<ErrorResponse, Status>(
			{
				success: false,
				message,
				data: null,
				errors,
			},
			{ status: statusCode },
		);
	}

	/**
	 * Send a 201 Created response
	 */
	static created<T>(
		ctx: Context,
		data: T,
		message: string = "Resource created successfully",
	) {
		return this.success(ctx, data, message, 201);
	}

	/**
	 * Send a 204 No Content response
	 */
	static noContent(ctx: Context) {
		return ctx.body(null, 204);
	}

	/**
	 * Send a 400 Bad Request response
	 */
	static badRequest(
		ctx: Context,
		message: string = "Bad request",
		errors?: ValidationErrors | string[],
	) {
		return this.error(ctx, message, 400, errors);
	}

	/**
	 * Send a 500 Internal Server Error response
	 */
	static internalError(
		ctx: Context,
		message: string = "Internal server error",
	) {
		return this.error(ctx, message, 500);
	}

	/**
	 * Send a 503 Service Unavailable response
	 */
	static serviceUnavailable(
		ctx: Context,
		message: string = "Service unavailable",
	) {
		return this.error(ctx, message, 503);
	}

	/**
	 * Send a custom response with full control
	 */
	static custom<T, Status extends ContentfulStatusCode = 200>(
		ctx: Context,
		success: boolean,
		data: T | null,
		message: string,
		statusCode: Status,
		errors?: ValidationErrors | string[],
	) {
		if (success && data !== null) {
			return ctx.json<SuccessResponse<T>, Status>(
				{
					success: true,
					message,
					data,
				},
				{ status: statusCode },
			);
		}

		const response: ErrorResponse = {
			success: false,
			message,
			data: null,
		};

		if (errors) {
			response.errors = errors;
		}

		return ctx.json<ErrorResponse, Status>(response, { status: statusCode });
	}
}
