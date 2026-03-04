import "@bull/worker/send-email.worker";

export * from "./queue/send-email.queue";

// eslint-disable-next-line no-console
console.log("Bull modules loaded");
