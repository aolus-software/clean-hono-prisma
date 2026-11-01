import { Queue } from "bullmq";
import { RedisClient } from "@database/redis/redis-client";

export const sendEmailQueue = new Queue("send-email", {
	connection: RedisClient.getQueueConnection(),
	/* Without attempts BullMQ tries a job once, so one transient SMTP failure
	   permanently drops a verification or reset email. The worker re-throws,
	   which is what lets these retries fire. */
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: "exponential", delay: 2000 },
	},
});
