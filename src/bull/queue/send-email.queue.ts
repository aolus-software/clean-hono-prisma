import { Queue } from "bullmq";
import { RedisClient } from "@database/redis/redis-client";

export const sendEmailQueue = new Queue("send-email", {
	connection: RedisClient.getQueueConnection(),
});
