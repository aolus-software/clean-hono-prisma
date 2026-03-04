import { cleanEnv, str, num, url, email, bool } from "envalid";

export const env = cleanEnv(process.env, {
	// App Configuration
	APP_NAME: str({ default: "Hono App" }),
	APP_PORT: num({ default: 3000 }),
	APP_URL: url(),
	APP_ENV: str({
		choices: ["development", "staging", "production"],
		default: "development",
	}),
	APP_TIMEZONE: str({ default: "UTC" }),
	APP_SECRET: str(),
	APP_JWT_SECRET: str(),
	APP_JWT_EXPIRES_IN: num({ default: 3600 }),

	// Database
	DATABASE_URL: url(),

	// ClickHouse
	CLICKHOUSE_HOST: url(),
	CLICKHOUSE_USER: str(),
	CLICKHOUSE_PASSWORD: str(),
	CLICKHOUSE_DATABASE: str(),

	// Redis
	REDIS_HOST: str(),
	REDIS_PORT: num({ default: 6379 }),
	REDIS_PASSWORD: str({ default: "" }),
	REDIS_DB: num({ default: 0 }),

	// Mail
	MAIL_HOST: str({ default: "" }),
	MAIL_PORT: num({ default: 587 }),
	MAIL_SECURE: bool({ default: false }),
	MAIL_USER: str({ default: "" }),
	MAIL_PASS: str({ default: "" }),
	MAIL_FROM: email({ default: "noreply@example.com" }),

	// CORS
	CORS_ORIGIN: str({ default: "*" }),
	CORS_METHODS: str({ default: "GET,POST,PUT,PATCH,DELETE,OPTIONS" }),
	CORS_ALLOWED_HEADERS: str({ default: "Content-Type,Authorization" }),
	CORS_EXPOSED_HEADERS: str({ default: "Content-Type,Authorization" }),
	CORS_MAX_AGE: num({ default: 3600 }),
	CORS_CREDENTIALS: bool({ default: true }),

	// Logging
	LOG_LEVEL: str({
		choices: ["info", "warn", "debug", "error"],
		default: "info",
	}),

	// Client
	CLIENT_URL: url(),
});
