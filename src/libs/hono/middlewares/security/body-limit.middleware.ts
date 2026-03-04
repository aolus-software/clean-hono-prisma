import { bodyLimit } from "hono/body-limit";
import type { MiddlewareHandler } from "hono";
import { Env } from "@types";

/**
 * Body size limit middleware
 * Restricts the maximum size of request payloads
 * Default: 100KB
 */
export const bodyLimitMiddleware: MiddlewareHandler<Env> = bodyLimit({
	maxSize: 100 * 1024, // 100KB
});
