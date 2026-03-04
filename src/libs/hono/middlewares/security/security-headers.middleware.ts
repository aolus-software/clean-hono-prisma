import { secureHeaders } from "hono/secure-headers";
import type { MiddlewareHandler } from "hono";
import { Env } from "@types";

/**
 * Security headers middleware
 * Adds various security-related HTTP headers to protect against common vulnerabilities
 * Includes CSP, HSTS, X-Content-Type-Options, etc.
 */
export const securityHeadersMiddleware: MiddlewareHandler<Env> = secureHeaders({
	contentSecurityPolicy: {},
	contentSecurityPolicyReportOnly: {},
	crossOriginEmbedderPolicy: true,
	crossOriginOpenerPolicy: true,
	crossOriginResourcePolicy: true,
	originAgentCluster: true,
	referrerPolicy: "no-referrer",
	strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
	xContentTypeOptions: true,
	permissionsPolicy: {},
	removePoweredBy: true,
});
