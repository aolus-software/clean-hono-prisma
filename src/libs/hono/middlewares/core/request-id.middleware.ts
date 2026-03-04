import { getOrGenerateRequestId } from "@utils";
import { Context, Next } from "hono";

/**
 * Middleware to add request ID to context
 * Checks for X-Request-ID header or generates a new one
 */
export const requestIdMiddleware = async (c: Context, next: Next) => {
	const requestId = getOrGenerateRequestId(c.req.header("x-request-id"));
	c.set("requestId" as never, requestId);
	c.header("X-Request-ID", requestId);
	await next();
};
