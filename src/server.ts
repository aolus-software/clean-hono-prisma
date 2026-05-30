import { AppConfig } from "@config";
import { logger } from "@utils";
import app from "./app";
import "@bull";

const workerId = process.env.CLUSTER_WORKER_ID ?? "single";

const server = Bun.serve({
	port: AppConfig.APP_PORT,
	fetch: app.fetch,
	reusePort: true,
});

logger.info(
	{ pid: process.pid, workerId, port: server.port },
	`Server listening on port ${server.port} (worker ${workerId})`,
);

// eslint-disable-next-line no-console
console.log(
	`Server running on http://localhost:${server.port} (worker ${workerId}, pid ${process.pid})`,
);

const shutdown = (signal: NodeJS.Signals): void => {
	logger.info({ pid: process.pid, workerId, signal }, "Server shutting down");
	void server.stop().then(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
