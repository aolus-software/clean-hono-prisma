import { AppConfig } from "@config";

const isFollower = process.env.CLUSTER_WORKER_ID !== undefined;

if (AppConfig.APP_CLUSTER_MODE && !isFollower) {
	await import("./cluster");
} else {
	await import("./server");
}

export {};
