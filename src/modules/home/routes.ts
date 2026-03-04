import { OpenAPIHono } from "@hono/zod-openapi";
import { commonResponse, createErrorResponse } from "@hono-libs/schemas";
import { ResponseToolkit, DateToolkit } from "@utils";
import { AppConfig } from "@config";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { defaultHook } from "@errors";
import { db, RedisClient, ClickHouseClientManager } from "@database";

const HomeRoutes = new OpenAPIHono({ defaultHook });

const HomeRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Home"],
	responses: {
		...commonResponse(
			z.object({
				app: z.string(),
			}),
			"Welcome to the API",
			{ exclude: [201, 422, 402, 404, 403] },
		),
	},
});

HomeRoutes.openapi(HomeRoute, (c) => {
	return ResponseToolkit.success(
		c,
		{
			app: AppConfig.APP_NAME,
		},
		"Welcome to the API",
		200,
	);
});

const HealthRoute = createRoute({
	method: "get",
	path: "/health",
	tags: ["Home"],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean().openapi({ example: true }),
						message: z.string().openapi({ example: "Service is healthy" }),
						data: z.object({
							status: z.string().openapi({ example: "healthy" }),
							timestamp: z.string(),
							services: z.object({
								database: z.object({
									status: z.string(),
									responseTime: z.number().optional(),
								}),
								redis: z.object({
									status: z.string(),
									responseTime: z.number().optional(),
								}),
								redisQueue: z.object({
									status: z.string(),
									responseTime: z.number().optional(),
								}),
								clickhouse: z.object({
									status: z.string(),
									responseTime: z.number().optional(),
								}),
							}),
						}),
					}),
				},
			},
			description: "Service is healthy",
		},
		503: createErrorResponse(
			"Service is unhealthy",
			"Service is unhealthy",
			false,
		),
	},
});

HomeRoutes.openapi(HealthRoute, async (c) => {
	const services = {
		database: {
			status: "unhealthy",
			responseTime: undefined as number | undefined,
		},
		redis: {
			status: "unhealthy",
			responseTime: undefined as number | undefined,
		},
		redisQueue: {
			status: "unhealthy",
			responseTime: undefined as number | undefined,
		},
		clickhouse: {
			status: "unhealthy",
			responseTime: undefined as number | undefined,
		},
	};

	// Check Database
	try {
		const start = Date.now();
		await db.$queryRaw`SELECT 1`;
		services.database = {
			status: "healthy",
			responseTime: Date.now() - start,
		};
	} catch {
		// Database remains unhealthy
	}

	// Check Redis
	try {
		const start = Date.now();
		await RedisClient.getRedisClient().ping();
		services.redis = {
			status: "healthy",
			responseTime: Date.now() - start,
		};
	} catch {
		// Redis remains unhealthy
	}

	// Check Redis Queue
	try {
		const start = Date.now();
		await RedisClient.getQueueRedisClient().ping();
		services.redisQueue = {
			status: "healthy",
			responseTime: Date.now() - start,
		};
	} catch {
		// Redis Queue remains unhealthy
	}

	// Check ClickHouse
	try {
		const start = Date.now();
		await ClickHouseClientManager.getInstance().ping();
		services.clickhouse = {
			status: "healthy",
			responseTime: Date.now() - start,
		};
	} catch {
		// ClickHouse remains unhealthy
	}

	// Determine overall health status
	const allHealthy = Object.values(services).every(
		(service) => service.status === "healthy",
	);

	if (!allHealthy) {
		const unhealthyData = {
			status: "unhealthy",
			timestamp: DateToolkit.getDateTimeInformativeWithTimezone(
				DateToolkit.now(),
			),
			services,
		};
		return ResponseToolkit.custom(
			c,
			false,
			unhealthyData,
			"One or more services are unhealthy",
			503,
		);
	}

	return ResponseToolkit.success(
		c,
		{
			status: "healthy",
			timestamp: DateToolkit.getDateTimeInformativeWithTimezone(
				DateToolkit.now(),
			),
			services,
		},
		"Service is healthy",
		200,
	);
});

export default HomeRoutes;
