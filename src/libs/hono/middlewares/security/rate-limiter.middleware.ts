import { rateLimiter } from "hono-rate-limiter";
import { ResponseToolkit } from "@utils";
import type { MiddlewareHandler } from "hono";
import { Env } from "@types";

/**
 * Rate limiter middleware
 * Limits the number of requests per IP address to prevent abuse
 * Default: 100 requests per 15 minutes
 */
export const rateLimiterMiddleware: MiddlewareHandler<Env> = rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per windowMs
	keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
	message: "Too many requests, please try again later.",
	handler: (c) => ResponseToolkit.error(c, "Too Many Requests", 429),
});
