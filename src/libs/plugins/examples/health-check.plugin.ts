/**
 * Example: Health Check Plugin
 * Demonstrates how to create a simple plugin
 */

import { createPlugin } from "../plugin.builder";
import type { AppType, PluginOptions } from "@types";

export const healthCheckPlugin = createPlugin()
	.withMetadata({
		name: "health-check",
		version: "1.0.0",
		description: "Provides health check endpoints",
		author: "Your Name",
		tags: ["health", "monitoring"],
	})
	.withHooks({
		// eslint-disable-next-line @typescript-eslint/require-await
		onAfterRegister: async () => {
			// eslint-disable-next-line no-console
			console.log("Health check plugin registered");
		},
		// eslint-disable-next-line @typescript-eslint/require-await
		onStart: async () => {
			// eslint-disable-next-line no-console
			console.log("Health check service started");
		},
	})
	.withRoutes((app: AppType, options?: PluginOptions) => {
		const prefix = options?.prefix || "/api";

		app.get(`${prefix}/health`, (c) => {
			return c.json({
				status: "ok",
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
			});
		});

		app.get(`${prefix}/ready`, (c) => {
			return c.json({
				status: "ready",
				checks: {
					database: "connected",
					redis: "connected",
				},
			});
		});
	})
	.build();
