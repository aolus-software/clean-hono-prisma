# Rule: BullMQ queues and workers (`src/bull/`)

Background work goes through BullMQ on Redis. Layout:

```
src/bull/
├── index.ts                   # re-exports + side-effect imports workers
├── queue/
│   ├── index.ts               # re-exports all queues
│   └── <feature>.queue.ts     # one Queue per file
└── worker/
    ├── index.ts               # re-exports all workers
    └── <feature>.worker.ts    # one Worker per file
```

`src/bull/index.ts` side-effect-imports the workers, so simply importing anything from `@bull` boots the worker in the same process as the API. There is no separate worker entrypoint in this project — workers run in-process.

## Queue file

- One queue per file. Filename: `<job>.queue.ts`. Export name: `<job>Queue` (camelCase).
- Connection comes from `RedisClient.getQueueRedisClient()` (`@database`) — never `new IORedis(...)` directly.
- Queue name is a kebab-case string (`"send-email"`) and must match between the queue and its worker.
- Type the queue payload: `new Queue<EmailOptions>("send-email", { ... })`.
- Set sane `defaultJobOptions` if retries matter:
  ```ts
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  }
  ```

## Worker file

- One worker per queue, in `src/bull/worker/`. Filename matches: `<job>.worker.ts`.
- Same queue name and same payload type as the queue.
- The processor function **must** wrap its work in try/catch, log both success and failure with structured `log` from `@utils`, and **re-throw** on failure so BullMQ retries:
  ```ts
  async (job) => {
  	try {
  		await EmailService.sendEmail(job.data);
  		log.info({}, `Email job processed for ${job.data.to}`);
  	} catch (error) {
  		log.error(error, `Failed to process email job for ${job.data.to}`);
  		throw error;
  	}
  };
  ```
- Attach a `.on("failed", (job, err) => log.error(...))` handler — that's the catch-all if all attempts fail.
- Workers delegate to services (`EmailService`, `<Feature>Service`) so business rules stay in one place.

## Producing jobs

Services produce, never route handlers:

```ts
import { sendEmailQueue } from "@bull";

await sendEmailQueue.add("welcome", { to: user.email, subject: "Welcome", ... });
```

Always `await` `.add(...)` — `no-floating-promises` is an error.

## Wiring up a new queue

1. Add `src/bull/queue/<job>.queue.ts`, export from `src/bull/queue/index.ts`.
2. Add `src/bull/worker/<job>.worker.ts`, export from `src/bull/worker/index.ts`.
3. Define the payload type under `src/libs/types/` — never inline `Record<string, any>` job payloads.
4. Producer-side: import the queue from `@bull` and `.add(...)` from inside a service.

## Don't

- Don't open a new Redis client inside a queue or worker file. Reuse `RedisClient.getQueueRedisClient()`.
- Don't swallow errors inside the worker processor — re-throw so retries happen.
- Don't run blocking, multi-minute jobs without setting an explicit `lockDuration`.
- Don't import a worker from outside `@bull`. The only allowed entry point is the side-effect import at app startup.
- Don't enqueue inside a database transaction. If the transaction rolls back the job stays in Redis. Enqueue only after the transaction commits.
- Don't use `console.log` in workers. Use `log` from `@utils`.
