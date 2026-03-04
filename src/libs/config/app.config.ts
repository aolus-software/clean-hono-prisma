import { env } from "./env";
import type { AppConfig as IAppConfig } from "@types";
import {
	validateAppConfig,
	validateConfigWithLogging,
} from "./config.validator";

export const AppConfig: IAppConfig = {
	APP_NAME: env.APP_NAME,
	APP_PORT: env.APP_PORT,
	APP_URL: env.APP_URL,
	APP_ENV: env.APP_ENV,
	APP_TIMEZONE: env.APP_TIMEZONE,
	APP_SECRET: env.APP_SECRET,
	APP_JWT_SECRET: env.APP_JWT_SECRET,
	APP_JWT_EXPIRES_IN: env.APP_JWT_EXPIRES_IN,
	LOG_LEVEL: env.LOG_LEVEL,
	CLIENT_URL: env.CLIENT_URL,
};

const validationResult = validateAppConfig(AppConfig);
validateConfigWithLogging(
	validationResult,
	"App",
	AppConfig.APP_ENV === "production",
);
