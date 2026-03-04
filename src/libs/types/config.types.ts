/**
 * Type definitions for all application configurations
 * Provides strict typing and documentation for all config options
 */

import type { Environment, LogLevel, Email, URL } from "./common.types";

/**
 * Application configuration
 */
export interface AppConfig {
	APP_NAME: string;
	APP_PORT: number;
	APP_URL: URL;
	APP_ENV: Environment;
	APP_TIMEZONE: string;
	APP_SECRET: string;
	APP_JWT_SECRET: string;
	APP_JWT_EXPIRES_IN: number;
	LOG_LEVEL: LogLevel;
	CLIENT_URL: URL;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
	DATABASE_URL: URL;
}

/**
 * ClickHouse configuration
 */
export interface ClickHouseConfig {
	CLICKHOUSE_HOST: URL;
	CLICKHOUSE_USER: string;
	CLICKHOUSE_PASSWORD: string;
	CLICKHOUSE_DATABASE: string;
}

/**
 * Redis configuration
 */
export interface RedisConfig {
	REDIS_HOST: string;
	REDIS_PORT: number;
	REDIS_PASSWORD: string;
	REDIS_DB: number;
}

/**
 * Mail configuration
 */
export interface MailConfig {
	MAIL_HOST: string;
	MAIL_PORT: number;
	MAIL_SECURE: boolean;
	MAIL_USER: string;
	MAIL_PASS: string;
	MAIL_FROM: Email;
}

/**
 * CORS configuration options
 */
export interface CorsConfig {
	origin: string | string[] | ((_origin: string) => string | undefined);
	methods: string[];
	allowedHeaders: string[];
	exposedHeaders: string[];
	maxAge: number;
	credentials: boolean;
}

/**
 * Raw CORS environment variables
 */
export interface CorsEnvConfig {
	CORS_ORIGIN: string;
	CORS_METHODS: string;
	CORS_ALLOWED_HEADERS: string;
	CORS_EXPOSED_HEADERS: string;
	CORS_MAX_AGE: number;
	CORS_CREDENTIALS: boolean;
}

/**
 * Complete environment configuration
 * Union of all config interfaces
 */
export interface EnvironmentConfig
	extends
		AppConfig,
		DatabaseConfig,
		ClickHouseConfig,
		RedisConfig,
		MailConfig,
		CorsEnvConfig {}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
	valid: boolean;
	errors: ConfigValidationError[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
	key: string;
	value: unknown;
	expected: string;
	message: string;
}

/**
 * Configuration validator function type
 */
export type ConfigValidator<T> = (_config: T) => ConfigValidationResult;

/**
 * Configuration section names
 */
export type ConfigSection =
	| "app"
	| "database"
	| "clickhouse"
	| "redis"
	| "mail"
	| "cors";

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
	section: ConfigSection;
	key: string;
	description: string;
	required: boolean;
	default?: unknown;
	validation?: string;
	example?: string;
}
