/**
 * Example: Request Logger Plugin
 * Demonstrates middleware and configuration
 */

import { definePlugin } from "../plugin.builder";
import type { Context, Next } from "hono";
import { logger } from "@utils";

interface RequestLoggerConfig {
	logBody?: boolean;
	logHeaders?: boolean;
	excludePaths?: string[];
}

export const requestLoggerPlugin = definePlugin(
	{
		name: "request-logger",
		version: "1.0.0",
		description: "Logs detailed request information",
		tags: ["logging", "debug"],
	},
	// eslint-disable-next-line @typescript-eslint/require-await
	async (app, options) => {
		const config: RequestLoggerConfig =
			(options?.config as RequestLoggerConfig) || {};
		const excludePaths = config.excludePaths || [];

		app.use("*", async (c: Context, next: Next) => {
			const start = Date.now();
			const path = c.req.path;

			if (excludePaths.some((p) => path.startsWith(p))) {
				return next();
			}

			const logData: Record<string, unknown> = {
				method: c.req.method,
				path,
				requestId: c.get("requestId" as never),
			};

			if (config.logHeaders) {
				logData.headers = Object.fromEntries(c.req.raw.headers);
			}

			if (config.logBody && c.req.method !== "GET") {
				try {
					logData.body = await c.req.json();
				} catch {
					// Not JSON or no body
				}
			}

			logger.debug(logData, "Request received");

			await next();

			logger.info(
				{
					...logData,
					status: c.res.status,
					duration: Date.now() - start,
				},
				"Request completed",
			);
		});
	},
);
