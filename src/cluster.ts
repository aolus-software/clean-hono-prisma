import type { Subprocess } from "bun";
import { AppConfig } from "@config";
import { logger } from "@utils";

const cpuCount = navigator.hardwareConcurrency || 1;
const workerCount =
	AppConfig.APP_CLUSTER_WORKERS > 0 ? AppConfig.APP_CLUSTER_WORKERS : cpuCount;
const entry = process.argv[1];
const workers = new Map<number, Subprocess>();
let shuttingDown = false;

const spawnWorker = (id: number): void => {
	const proc = Bun.spawn([process.execPath, "run", entry], {
		env: {
			...process.env,
			CLUSTER_WORKER_ID: String(id),
		},
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
		onExit: (_subprocess, exitCode, signalCode) => {
			workers.delete(id);
			if (shuttingDown) return;
			logger.warn(
				{ workerId: id, exitCode, signalCode },
				`Worker ${id} exited unexpectedly, respawning in 1s`,
			);
			setTimeout(() => {
				if (!shuttingDown) spawnWorker(id);
			}, 1000);
		},
	});
	workers.set(id, proc);
	logger.info(
		{ workerId: id, pid: proc.pid },
		`Spawned worker ${id} (pid ${proc.pid})`,
	);
};

logger.info(
	{ pid: process.pid, workerCount, cpuCount },
	`Primary ${process.pid} starting ${workerCount} worker(s)`,
);

// eslint-disable-next-line no-console
console.log(
	`Cluster primary (pid ${process.pid}) spawning ${workerCount} worker(s)`,
);

for (let i = 0; i < workerCount; i++) {
	spawnWorker(i);
}

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
	if (shuttingDown) return;
	shuttingDown = true;
	logger.info(
		{ signal, count: workers.size },
		"Primary shutting down — forwarding signal to workers",
	);
	for (const proc of workers.values()) {
		proc.kill(signal);
	}
	await Promise.allSettled(Array.from(workers.values()).map((p) => p.exited));
	process.exit(0);
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
