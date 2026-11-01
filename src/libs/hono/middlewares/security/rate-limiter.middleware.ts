import type { MiddlewareHandler } from "hono";
import { getConnInfo } from "hono/bun";
import { rateLimiter } from "hono-rate-limiter";
import { t } from "@i18n";
import { Env } from "@types";
import { ResponseToolkit } from "@utils";

/**
 * Global limit: 100 requests per 60 seconds per connection address. The
 * store is in memory, so each process (and each cluster worker) counts on
 * its own. Never keyed on a client-supplied header.
 */
export const rateLimiterMiddleware: MiddlewareHandler<Env> = rateLimiter<Env>({
	windowMs: 60 * 1000,
	limit: 100,
	keyGenerator: (c) => {
		try {
			return getConnInfo(c).remote.address ?? "unknown";
		} catch {
			return "unknown";
		}
	},
	handler: (c) => ResponseToolkit.rateLimited(c, t("errors.tooManyRequests")),
});
