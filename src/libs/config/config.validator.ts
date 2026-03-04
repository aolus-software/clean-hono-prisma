/**
 * Runtime configuration validation
 * Validates configuration values at runtime to ensure correctness
 */

import type {
	AppConfig,
	ConfigValidationResult,
	ConfigValidationError,
	DatabaseConfig,
	RedisConfig,
	MailConfig,
	ClickHouseConfig,
} from "@types";
import { logger } from "@utils";

/**
 * Validates a URL format
 */
const isValidUrl = (value: string): boolean => {
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

/**
 * Validates an email format
 */
const isValidEmail = (value: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value);
};

/**
 * Validates a port number
 */
const isValidPort = (value: number): boolean => {
	return Number.isInteger(value) && value > 0 && value <= 65535;
};

/**
 * Validates timezone format
 */
const isValidTimezone = (value: string): boolean => {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: value });
		return true;
	} catch {
		return false;
	}
};

/**
 * Creates a validation error
 */
const createError = (
	key: string,
	value: unknown,
	expected: string,
	message: string,
): ConfigValidationError => ({
	key,
	value,
	expected,
	message,
});

/**
 * Validates application configuration
 */
export const validateAppConfig = (
	config: AppConfig,
): ConfigValidationResult => {
	const errors: ConfigValidationError[] = [];

	if (!config.APP_NAME || config.APP_NAME.trim().length === 0) {
		errors.push(
			createError(
				"APP_NAME",
				config.APP_NAME,
				"non-empty string",
				"Application name is required",
			),
		);
	}

	if (!isValidPort(config.APP_PORT)) {
		errors.push(
			createError(
				"APP_PORT",
				config.APP_PORT,
				"valid port (1-65535)",
				"Invalid port number",
			),
		);
	}

	if (!isValidUrl(config.APP_URL)) {
		errors.push(
			createError(
				"APP_URL",
				config.APP_URL,
				"valid URL",
				"Invalid application URL",
			),
		);
	}

	if (!["development", "staging", "production"].includes(config.APP_ENV)) {
		errors.push(
			createError(
				"APP_ENV",
				config.APP_ENV,
				"development | staging | production",
				"Invalid environment",
			),
		);
	}

	if (!isValidTimezone(config.APP_TIMEZONE)) {
		errors.push(
			createError(
				"APP_TIMEZONE",
				config.APP_TIMEZONE,
				"valid IANA timezone",
				"Invalid timezone format",
			),
		);
	}

	if (!config.APP_SECRET || config.APP_SECRET.length < 32) {
		errors.push(
			createError(
				"APP_SECRET",
				"***",
				"string with at least 32 characters",
				"APP_SECRET must be at least 32 characters long",
			),
		);
	}

	if (!config.APP_JWT_SECRET || config.APP_JWT_SECRET.length < 32) {
		errors.push(
			createError(
				"APP_JWT_SECRET",
				"***",
				"string with at least 32 characters",
				"JWT secret must be at least 32 characters long",
			),
		);
	}

	if (config.APP_JWT_EXPIRES_IN <= 0) {
		errors.push(
			createError(
				"APP_JWT_EXPIRES_IN",
				config.APP_JWT_EXPIRES_IN,
				"positive number",
				"JWT expiration must be positive",
			),
		);
	}

	if (!["info", "warn", "debug", "error"].includes(config.LOG_LEVEL)) {
		errors.push(
			createError(
				"LOG_LEVEL",
				config.LOG_LEVEL,
				"info | warn | debug | error",
				"Invalid log level",
			),
		);
	}

	if (!isValidUrl(config.CLIENT_URL)) {
		errors.push(
			createError(
				"CLIENT_URL",
				config.CLIENT_URL,
				"valid URL",
				"Invalid client URL",
			),
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates database configuration
 */
export const validateDatabaseConfig = (
	config: DatabaseConfig,
): ConfigValidationResult => {
	const errors: ConfigValidationError[] = [];

	if (!config.DATABASE_URL || !isValidUrl(config.DATABASE_URL)) {
		errors.push(
			createError(
				"DATABASE_URL",
				config.DATABASE_URL,
				"valid PostgreSQL connection URL",
				"Invalid database URL",
			),
		);
	}

	if (
		config.DATABASE_URL &&
		!config.DATABASE_URL.startsWith("postgres://") &&
		!config.DATABASE_URL.startsWith("postgresql://")
	) {
		errors.push(
			createError(
				"DATABASE_URL",
				config.DATABASE_URL,
				"PostgreSQL URL (postgres:// or postgresql://)",
				"Database URL must be a PostgreSQL connection string",
			),
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates Redis configuration
 */
export const validateRedisConfig = (
	config: RedisConfig,
): ConfigValidationResult => {
	const errors: ConfigValidationError[] = [];

	if (!config.REDIS_HOST || config.REDIS_HOST.trim().length === 0) {
		errors.push(
			createError(
				"REDIS_HOST",
				config.REDIS_HOST,
				"non-empty string",
				"Redis host is required",
			),
		);
	}

	if (!isValidPort(config.REDIS_PORT)) {
		errors.push(
			createError(
				"REDIS_PORT",
				config.REDIS_PORT,
				"valid port (1-65535)",
				"Invalid Redis port",
			),
		);
	}

	if (config.REDIS_DB < 0 || config.REDIS_DB > 15) {
		errors.push(
			createError(
				"REDIS_DB",
				config.REDIS_DB,
				"number between 0 and 15",
				"Redis database index must be between 0 and 15",
			),
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates ClickHouse configuration
 */
export const validateClickHouseConfig = (
	config: ClickHouseConfig,
): ConfigValidationResult => {
	const errors: ConfigValidationError[] = [];

	if (!config.CLICKHOUSE_HOST || !isValidUrl(config.CLICKHOUSE_HOST)) {
		errors.push(
			createError(
				"CLICKHOUSE_HOST",
				config.CLICKHOUSE_HOST,
				"valid URL",
				"Invalid ClickHouse host URL",
			),
		);
	}

	if (!config.CLICKHOUSE_USER || config.CLICKHOUSE_USER.trim().length === 0) {
		errors.push(
			createError(
				"CLICKHOUSE_USER",
				config.CLICKHOUSE_USER,
				"non-empty string",
				"ClickHouse user is required",
			),
		);
	}

	if (
		!config.CLICKHOUSE_DATABASE ||
		config.CLICKHOUSE_DATABASE.trim().length === 0
	) {
		errors.push(
			createError(
				"CLICKHOUSE_DATABASE",
				config.CLICKHOUSE_DATABASE,
				"non-empty string",
				"ClickHouse database name is required",
			),
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates mail configuration
 */
export const validateMailConfig = (
	config: MailConfig,
): ConfigValidationResult => {
	const errors: ConfigValidationError[] = [];

	if (config.MAIL_HOST && config.MAIL_HOST.trim().length === 0) {
		errors.push(
			createError(
				"MAIL_HOST",
				config.MAIL_HOST,
				"valid hostname or empty",
				"Invalid mail host",
			),
		);
	}

	if (config.MAIL_PORT && !isValidPort(config.MAIL_PORT)) {
		errors.push(
			createError(
				"MAIL_PORT",
				config.MAIL_PORT,
				"valid port (1-65535)",
				"Invalid mail port",
			),
		);
	}

	if (config.MAIL_FROM && !isValidEmail(config.MAIL_FROM)) {
		errors.push(
			createError(
				"MAIL_FROM",
				config.MAIL_FROM,
				"valid email address",
				"Invalid sender email address",
			),
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validates all configuration sections
 */
export const validateAllConfig = (config: {
	app: AppConfig;
	database: DatabaseConfig;
	redis: RedisConfig;
	clickhouse: ClickHouseConfig;
	mail: MailConfig;
}): ConfigValidationResult => {
	const allErrors: ConfigValidationError[] = [];

	const appResult = validateAppConfig(config.app);
	const dbResult = validateDatabaseConfig(config.database);
	const redisResult = validateRedisConfig(config.redis);
	const clickhouseResult = validateClickHouseConfig(config.clickhouse);
	const mailResult = validateMailConfig(config.mail);

	allErrors.push(
		...appResult.errors,
		...dbResult.errors,
		...redisResult.errors,
		...clickhouseResult.errors,
		...mailResult.errors,
	);

	return {
		valid: allErrors.length === 0,
		errors: allErrors,
	};
};

/**
 * Validates configuration and logs errors
 * Throws error if validation fails in production
 */
export const validateConfigWithLogging = (
	result: ConfigValidationResult,
	section: string,
	throwOnError = false,
): void => {
	if (!result.valid) {
		logger.error(
			{
				section,
				errors: result.errors,
			},
			`Configuration validation failed for ${section}`,
		);

		if (throwOnError) {
			throw new Error(
				`Invalid ${section} configuration: ${result.errors.map((e) => e.message).join(", ")}`,
			);
		}
	} else {
		logger.info(`${section} configuration validated successfully`);
	}
};
