import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { AppConfig } from "@config";
import { defaultHook } from "@errors";
import { Env } from "@types";

import AuthRoutes from "./auth/routes";
import HomeRoutes from "./home/routes";
import ProfileRoutes from "./profile/routes";
import SettingsRoutes from "./settings/index";

const bootstrap = new OpenAPIHono<Env>({ defaultHook });

bootstrap.route("/", HomeRoutes);
bootstrap.route("/auth", AuthRoutes);
bootstrap.route("/profile", ProfileRoutes);
bootstrap.route("/settings", SettingsRoutes);

/* The only docs switch, independent of NODE_ENV and off by default. */
if (AppConfig.ENABLE_API_DOCS) {
	bootstrap.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
		type: "http",
		scheme: "bearer",
		description: "Access token from POST /auth/login or POST /auth/refresh.",
	});

	bootstrap.doc("/docs/openapi.json", {
		openapi: "3.0.0",
		info: {
			title: AppConfig.APP_NAME,
			version: "1.0.0",
			description: "Clean Architecture API built with Hono + Prisma",
		},
		servers: [{ url: AppConfig.APP_URL }],
	});

	bootstrap.get(
		"/docs",
		Scalar({
			theme: "mars",
			layout: "modern",
			pageTitle: `${AppConfig.APP_NAME} Documentation`,
			url: "/docs/openapi.json",
		}),
	);
}

export default bootstrap;
