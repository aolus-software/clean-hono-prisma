import { env } from "./env";

type CorsConfigType = {
	// eslint-disable-next-line no-unused-vars
	origin: string | string[] | ((origin: string) => string | undefined);
	methods: string[];
	allowedHeaders: string[];
	exposedHeaders: string[];
	maxAge: number;
	credentials: boolean;
};

/**
 * Parse and validate CORS origins
 * In production, never allow wildcard (*)
 */
const getCorsOrigin = (): string | string[] | (() => string | undefined) => {
	// Development: allow wildcard
	if (env.APP_ENV === "development") {
		return env.CORS_ORIGIN;
	}

	// Production: restrict to specific origins
	if (env.CORS_ORIGIN === "*") {
		// eslint-disable-next-line no-console
		console.warn(
			"⚠️  WARNING: CORS_ORIGIN is set to '*' in production! This is a security risk.",
		);
		// In production, default to CLIENT_URL if wildcard is configured
		return [env.CLIENT_URL, env.APP_URL];
	}

	// Parse comma-separated origins
	const origins = env.CORS_ORIGIN.split(",")
		.map((origin) => origin.trim())
		.filter((origin) => origin && origin !== "*");

	if (origins.length === 0) {
		// Fallback to CLIENT_URL
		return [env.CLIENT_URL, env.APP_URL];
	}

	return origins.length === 1 ? origins[0] : origins;
};

export const corsConfig: CorsConfigType = {
	origin: getCorsOrigin(),
	methods: env.CORS_METHODS.split(",").map((method) => method.trim()),
	allowedHeaders: env.CORS_ALLOWED_HEADERS.split(",").map((header) =>
		header.trim(),
	),
	exposedHeaders: env.CORS_EXPOSED_HEADERS.split(",").map((header) =>
		header.trim(),
	),
	maxAge: env.CORS_MAX_AGE,
	credentials: env.CORS_CREDENTIALS,
};
