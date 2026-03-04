import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { formatZodError } from "./formatter";
import { AppError } from "./base.error";
import { Env } from "@types";
import { DateToolkit, logger } from "@utils";
import { AppConfig } from "@config";
import { ERROR_CODES } from "./error-codes.constant";

/**
 * Standard error response format
 */
interface ErrorResponse {
	success: false;
	message: string;
	code?: string;
	errors?: unknown;
	data: null;
	requestId?: string;
	trace?: string;
}

export const registerException = (app: Hono<Env>) => {
	app.notFound((c) => {
		const requestId = c.get("requestId");
		return c.json(
			{
				success: false,
				message: "Route not found",
				code: ERROR_CODES.ROUTE_NOT_FOUND,
				errors: [],
				data: null,
				requestId,
			} as ErrorResponse,
			404,
		);
	});

	app.onError((err, c) => {
		const requestId = c.get("requestId");

		if (err instanceof HTTPException && err.status === 422) {
			return c.json(
				{
					success: false,
					message: err.message,
					code: ERROR_CODES.VALIDATION_ERROR,
					errors: err.cause || [],
					data: null,
					requestId,
				} as ErrorResponse,
				422,
			);
		}

		logger.error(err, "[Internal Server Error]");

		if (err instanceof ZodError) {
			return c.json(
				{
					success: false,
					message: "Validation failed",
					code: ERROR_CODES.VALIDATION_ERROR,
					errors: formatZodError(err),
					data: null,
					requestId,
				} as ErrorResponse,
				422,
			);
		}

		// Handle custom AppError instances
		if (err instanceof AppError) {
			const requestContext = {
				method: c.req.method,
				url: c.req.url,
				userAgent: c.req.header("user-agent"),
				ip:
					c.req.header("x-forwarded-for") ||
					c.req.header("x-real-ip") ||
					"unknown",
				timestamp: DateToolkit.now().toISOString(),
				requestId,
			};

			logger.error(err, `${err.name}: ${err.message}`, requestContext);

			// Cast to any to avoid Hono's strict status code typing
			return c.json(
				{
					success: false,
					message: err.message,
					code: err.errorCode,
					errors: err.details || [],
					data: null,
					requestId,
				} as ErrorResponse,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				err.statusCode as any,
			);
		}

		if (err instanceof HTTPException) {
			// If the error is a 404 from Hono (e.g. route not found), ensure we return 404
			if (err.status === 404) {
				return c.json(
					{
						success: false,
						message: "Route not found",
						code: ERROR_CODES.ROUTE_NOT_FOUND,
						errors: [],
						data: null,
						requestId,
					} as ErrorResponse,
					404,
				);
			}
			return c.json(
				{
					success: false,
					message: err.message,
					code: ERROR_CODES.HTTP_ERROR,
					errors: [],
					data: null,
					requestId,
				} as ErrorResponse,
				err.status,
			);
		}

		const requestContext = {
			method: c.req.method,
			url: c.req.url,
			userAgent: c.req.header("user-agent"),
			ip:
				c.req.header("x-forwarded-for") ||
				c.req.header("x-real-ip") ||
				"unknown",
			timestamp: DateToolkit.now().toISOString(),
			requestId,
		};

		logger.error(err, "Internal Server Error", requestContext);

		return c.json(
			{
				success: false,
				message: "Internal server error",
				code: ERROR_CODES.INTERNAL_ERROR,
				errors: [],
				data: null,
				requestId,
				trace:
					err instanceof Error && AppConfig.APP_ENV !== "production"
						? err.stack
						: undefined,
			} as ErrorResponse,
			500,
		);
	});
};
