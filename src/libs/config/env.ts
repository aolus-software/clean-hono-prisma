import { bool, cleanEnv, email, host, num, port, str, url } from "envalid";

export const env = cleanEnv(process.env, {
	APP_NAME: str({ default: "Hono Prisma API" }),
	APP_PORT: port({ default: 3000 }),
	APP_URL: url({ default: "http://localhost:3000" }),
	NODE_ENV: str({
		choices: ["development", "staging", "production"] as const,
		default: "development",
	}),
	APP_TIMEZONE: str({ default: "UTC" }),
	APP_KEY: str({ default: "your-app-key" }),
	LOG_LEVEL: str({
		choices: ["info", "warn", "debug", "error"] as const,
		default: "info",
	}),

	ENABLE_API_DOCS: bool({ default: false }),

	APP_CLUSTER_MODE: bool({ default: false }),
	APP_CLUSTER_WORKERS: num({ default: 0 }),
	APP_REUSE_PORT: bool({ default: false }),

	CLIENT_URL: url({ default: "http://localhost:3000" }),

	DATABASE_URL: str({
		default: "postgresql://postgres:postgres@localhost:5432/hono_clean",
	}),
	DB_POOL_MAX: num({ default: 10 }),
	DB_POOL_IDLE_TIMEOUT_MS: num({ default: 30000 }),
	DB_POOL_CONNECTION_TIMEOUT_MS: num({ default: 5000 }),
	DB_LOG_QUERIES: bool({ default: false }),

	REDIS_HOST: host({ default: "localhost" }),
	REDIS_PORT: port({ default: 6379 }),
	REDIS_PASSWORD: str({ default: "" }),
	REDIS_DB: num({ default: 0 }),

	MAIL_HOST: host({ default: "smtp.example.com" }),
	MAIL_PORT: port({ default: 587 }),
	MAIL_SECURE: bool({ default: false }),
	MAIL_USER: str({ default: "your_email@example.com" }),
	MAIL_PASS: str({ default: "your_email_password" }),
	MAIL_FROM: email({ default: "noreply@example.com" }),

	JWT_SECRET: str(),
	JWT_REFRESH_SECRET: str(),

	ALLOWED_HOST: str({ default: "" }),

	CLICKHOUSE_HOST: url({ default: "http://localhost:8123" }),
	CLICKHOUSE_USER: str({ default: "default" }),
	CLICKHOUSE_PASSWORD: str({ default: "" }),
	CLICKHOUSE_DATABASE: str({ default: "default" }),
});
