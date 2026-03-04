import { cors } from "hono/cors";
import { corsConfig } from "@config";
import type { MiddlewareHandler } from "hono";
import { Env } from "@types";

/**
 * CORS middleware
 * Configures Cross-Origin Resource Sharing headers
 */
export const corsMiddleware: MiddlewareHandler<Env> = cors({
	origin: corsConfig.origin,
	allowMethods: corsConfig.methods,
	allowHeaders: corsConfig.allowedHeaders,
	exposeHeaders: corsConfig.exposedHeaders,
	maxAge: corsConfig.maxAge,
	credentials: corsConfig.credentials,
});
