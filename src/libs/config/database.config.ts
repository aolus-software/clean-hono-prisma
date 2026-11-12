import { env } from "./env";
import type { DatabaseConfig as IDatabaseConfig } from "@types";
import {
	validateDatabaseConfig,
	validateConfigWithLogging,
} from "./config.validator";
import { AppConfig } from "./app.config";

export const DatabaseConfig: IDatabaseConfig = {
	DATABASE_URL: env.DATABASE_URL,
	DB_POOL_MAX: env.DB_POOL_MAX,
	DB_POOL_IDLE_TIMEOUT_MS: env.DB_POOL_IDLE_TIMEOUT_MS,
	DB_POOL_CONNECTION_TIMEOUT_MS: env.DB_POOL_CONNECTION_TIMEOUT_MS,
	DB_LOG_QUERIES: env.DB_LOG_QUERIES,
};

const validationResult = validateDatabaseConfig(DatabaseConfig);
validateConfigWithLogging(
	validationResult,
	"Database",
	AppConfig.APP_ENV === "production",
);
