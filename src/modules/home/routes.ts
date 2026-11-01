import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { AppConfig } from "@config";
import { db, RedisClient } from "@database";
import { defaultHook } from "@errors";
import { commonResponse, successSchema } from "@hono-libs/schemas";
import { t } from "@i18n";
import { Env } from "@types";
import { DateToolkit, ResponseToolkit } from "@utils";

const HomeRoutes = new OpenAPIHono<Env>({ defaultHook });

const HealthSchema = z
	.object({
		status: z.enum(["healthy", "unhealthy"]),
		timestamp: z.string(),
		services: z.object({
			database: z.enum(["healthy", "unhealthy"]),
			redis: z.enum(["healthy", "unhealthy"]),
		}),
	})
	.openapi("Health");

const HomeRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Home"],
	summary: "API root",
	description: "Application name, environment and server time.",
	responses: commonResponse(
		z.object({ appName: z.string(), appEnv: z.string(), date: z.string() }),
		"API information",
		{ include: [200, 429, 500] },
	),
});

HomeRoutes.openapi(HomeRoute, (c) =>
	ResponseToolkit.success(
		c,
		{
			appName: AppConfig.APP_NAME,
			appEnv: AppConfig.APP_ENV,
			date: DateToolkit.getDateTimeInformativeWithTimezone(DateToolkit.now()),
		},
		t("home.welcome", { name: AppConfig.APP_NAME }),
		200,
	),
);

const HealthRoute = createRoute({
	method: "get",
	path: "/health",
	tags: ["Home"],
	summary: "Health check",
	description:
		"Probes PostgreSQL and Redis. 503 with the same body when either fails.",
	responses: {
		200: {
			content: {
				"application/json": { schema: successSchema(HealthSchema, 200) },
			},
			description: "Every dependency is healthy",
		},
		503: {
			content: {
				"application/json": { schema: successSchema(HealthSchema, 503) },
			},
			description: "A dependency is unhealthy",
		},
	},
});

const probe = async (check: () => Promise<unknown>) => {
	try {
		await check();
		return "healthy" as const;
	} catch {
		return "unhealthy" as const;
	}
};

HomeRoutes.openapi(HealthRoute, async (c) => {
	const [database, redis] = await Promise.all([
		probe(() => db.$queryRaw`SELECT 1`),
		probe(() => RedisClient.getRedisClient().ping()),
	]);
	const healthy = database === "healthy" && redis === "healthy";
	const data = {
		status: healthy ? ("healthy" as const) : ("unhealthy" as const),
		timestamp: DateToolkit.getDateTimeInformativeWithTimezone(
			DateToolkit.now(),
		),
		services: { database, redis },
	};

	if (healthy) {
		return ResponseToolkit.success(c, data, t("home.healthy"), 200);
	}
	return ResponseToolkit.success(c, data, t("home.unhealthy"), 503);
});

const LiveRoute = createRoute({
	method: "get",
	path: "/live",
	tags: ["Home"],
	summary: "Liveness",
	description:
		"Answers as long as the process serves requests. No dependency checks.",
	responses: commonResponse(z.object({ alive: z.literal(true) }), "Alive", {
		include: [200],
	}),
});

HomeRoutes.openapi(LiveRoute, (c) =>
	ResponseToolkit.success(c, { alive: true as const }, t("home.alive"), 200),
);

export default HomeRoutes;
