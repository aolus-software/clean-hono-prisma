import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
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

bootstrap.doc("/docs/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "Clean Hono Prisma API",
		version: "1.0.0",
		description: "Clean Architecture API built with Hono + Prisma",
	},
	servers: [{ url: "/", description: "Development" }],
});

bootstrap.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
	type: "http",
	scheme: "bearer",
	description:
		"Bearer token authentication. Can be obtained via the /auth/login endpoint.",
});

bootstrap.get(
	"/docs",
	Scalar({
		theme: "mars",
		layout: "modern",
		pageTitle: "Clean Hono Prisma API Documentation",
		url: "/docs/openapi.json",
	}),
);

export default bootstrap;
