import { RedisClient as BunRedisClient } from "bun";
import type { ConnectionOptions } from "bullmq";
import { RedisConfig } from "@config";

// Build a redis:// URL from the validated Redis config for the Bun client.
const buildRedisUrl = (): string => {
	const auth = RedisConfig.REDIS_PASSWORD
		? `:${encodeURIComponent(RedisConfig.REDIS_PASSWORD)}@`
		: "";
	return `redis://${auth}${RedisConfig.REDIS_HOST}:${RedisConfig.REDIS_PORT}/${RedisConfig.REDIS_DB}`;
};

export class RedisClient {
	private static redis: BunRedisClient | null = null;

	static getRedisClient(): BunRedisClient {
		if (!this.redis) {
			this.redis = new BunRedisClient(buildRedisUrl());
		}

		return this.redis;
	}

	// BullMQ requires an ioredis-compatible connection and cannot use Bun's
	// native client, so hand it plain connection options to manage internally.
	static getQueueConnection(): ConnectionOptions {
		return {
			host: RedisConfig.REDIS_HOST,
			port: RedisConfig.REDIS_PORT,
			password: RedisConfig.REDIS_PASSWORD || undefined,
			db: RedisConfig.REDIS_DB,
			maxRetriesPerRequest: null,
		};
	}
}
