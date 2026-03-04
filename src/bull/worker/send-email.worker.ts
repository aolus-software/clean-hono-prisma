import { Worker } from "bullmq";
import { RedisClient } from "@database/redis/redis-client";
import { logger } from "@utils";
import { EmailOptions, EmailService } from "@mail/mail.service";

const queueRedis = RedisClient.getQueueRedisClient();

const worker = new Worker<EmailOptions>(
	"send-email",
	async (job) => {
		try {
			await EmailService.sendEmail(job.data);
			logger.info({}, `Email job processed for ${job.data.to}`);
		} catch (error) {
			logger.error(error, `Failed to process email job for ${job.data.to}`);
			throw error;
		}
	},
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		connection: queueRedis as any,
	},
);

worker.on("failed", (job, err) => {
	logger.error(err, `Job ${job ? job.id : "unknown"} failed`);
});

export { worker };
