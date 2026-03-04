import { Context, Next } from "hono";
import { logger } from "@utils";

/**
 * Performance logging middleware
 * Logs request duration and warns on slow requests
 */
export const performanceMiddleware = async (c: Context, next: Next) => {
	const start = Date.now();
	const requestId = c.get("requestId" as never);

	await next();

	const duration = Date.now() - start;
	const method = c.req.method;
	const path = c.req.path;
	const status = c.res.status;

	// Log performance metrics
	const logData = {
		method,
		path,
		status,
		duration: `${duration}ms`,
		requestId,
	};

	// Warn on slow requests (> 1 second)
	if (duration > 1000) {
		logger.warn(logData, "Slow request detected");
	} else if (duration > 500) {
		logger.info(logData, "Request completed");
	} else {
		logger.debug(logData, "Request completed");
	}
};
