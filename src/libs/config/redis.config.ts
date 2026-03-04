import { env } from "./env";
import type { RedisConfig as IRedisConfig } from "@types";
import {
	validateRedisConfig,
	validateConfigWithLogging,
} from "./config.validator";
import { AppConfig } from "./app.config";

export const RedisConfig: IRedisConfig = {
	REDIS_HOST: env.REDIS_HOST || "localhost",
	REDIS_PORT: env.REDIS_PORT,
	REDIS_PASSWORD: env.REDIS_PASSWORD,
	REDIS_DB: env.REDIS_DB,
};

const validationResult = validateRedisConfig(RedisConfig);
validateConfigWithLogging(
	validationResult,
	"Redis",
	AppConfig.APP_ENV === "production",
);
