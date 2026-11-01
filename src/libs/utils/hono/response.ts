import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import type { FieldError } from "@types";

export interface SuccessResponse<T, Status extends number = number> {
	status: Status;
	success: true;
	message: string;
	data: T;
}

export interface ErrorResponse {
	status: number;
	success: false;
	message: string;
	data: null;
}

export interface FieldErrorResponse {
	status: 400 | 422;
	success: false;
	message: string;
	errors: FieldError[];
}

export interface RateLimitResponse {
	status: 429;
	success: false;
	message: string;
}

/**
 * Builds the canonical envelope: `status` in the body always equals the HTTP
 * status, success bodies carry `data`, field errors carry `errors[]`.
 */
export class ResponseToolkit {
	static success<T, Status extends ContentfulStatusCode = 200>(
		ctx: Context,
		data: T,
		message: string = "Success",
		statusCode: Status = 200 as Status,
	) {
		return ctx.json<SuccessResponse<T, Status>, Status>(
			{ status: statusCode, success: true, message, data },
			statusCode,
		);
	}

	static error<Status extends ContentfulStatusCode>(
		ctx: Context,
		message: string,
		statusCode: Status,
	) {
		return ctx.json<ErrorResponse, Status>(
			{ status: statusCode, success: false, message, data: null },
			statusCode,
		);
	}

	static fieldErrors<Status extends 400 | 422>(
		ctx: Context,
		message: string,
		statusCode: Status,
		errors: FieldError[],
	) {
		return ctx.json<FieldErrorResponse, Status>(
			{ status: statusCode, success: false, message, errors },
			statusCode,
		);
	}

	static rateLimited(ctx: Context, message: string) {
		return ctx.json<RateLimitResponse, 429>(
			{ status: 429, success: false, message },
			429,
		);
	}
}
