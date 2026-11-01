import type { AppConfig as IAppConfig } from "@types";

import {
	validateAppConfig,
	validateConfigWithLogging,
} from "./config.validator";
import { env } from "./env";

export const AppConfig: IAppConfig = {
	APP_NAME: env.APP_NAME,
	APP_PORT: env.APP_PORT,
	APP_URL: env.APP_URL,
	APP_ENV: env.NODE_ENV,
	APP_TIMEZONE: env.APP_TIMEZONE,
	APP_KEY: env.APP_KEY,
	ENABLE_API_DOCS: env.ENABLE_API_DOCS,
	APP_CLUSTER_MODE: env.APP_CLUSTER_MODE,
	APP_CLUSTER_WORKERS: env.APP_CLUSTER_WORKERS,
	APP_REUSE_PORT: env.APP_REUSE_PORT,
	LOG_LEVEL: env.LOG_LEVEL,
	CLIENT_URL: env.CLIENT_URL,
};

const validationResult = validateAppConfig(AppConfig);
validateConfigWithLogging(
	validationResult,
	"App",
	AppConfig.APP_ENV === "production",
);
