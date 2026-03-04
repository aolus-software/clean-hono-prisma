import { Queue } from "bullmq";
import { RedisClient } from "@database/redis/redis-client";

const queueRedis = RedisClient.getQueueRedisClient();

export const sendEmailQueue = new Queue("send-email", {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	connection: queueRedis as any,
});
