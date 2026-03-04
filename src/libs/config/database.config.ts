import { env } from "./env";
import type { DatabaseConfig as IDatabaseConfig } from "@types";
import {
	validateDatabaseConfig,
	validateConfigWithLogging,
} from "./config.validator";
import { AppConfig } from "./app.config";

export const DatabaseConfig: IDatabaseConfig = {
	DATABASE_URL: env.DATABASE_URL,
};

const validationResult = validateDatabaseConfig(DatabaseConfig);
validateConfigWithLogging(
	validationResult,
	"Database",
	AppConfig.APP_ENV === "production",
);
