# Rule: BullMQ queues and workers (`src/bull/`)

Background work goes through BullMQ on Redis.

```
src/bull/
├── index.ts                     # side-effect imports the workers, re-exports the queues
├── queue/<job>.queue.ts         # one Queue per file
└── worker/<job>.worker.ts       # one Worker per file
```

`src/server.ts` imports `@bull`, so **the worker runs inside every API process** — in cluster mode,
inside every worker process. There is no separate worker entrypoint.

## Queue file

- One queue per file, `<job>.queue.ts`, export `<job>Queue` (`sendEmailQueue`).
- Connection from `RedisClient.getQueueConnection()` (`@database`); never a new client. BullMQ 6
  takes `ioredis` as an optional peer, so `ioredis` is a direct dependency; Bun's native client
  cannot back a queue.
- Queue name is kebab-case (`"send-email"`) and identical in queue and worker.
- Type the payload (`Queue<EmailOptions>`).
- The email queue sets `defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 2000 } }`:
  without `attempts` BullMQ tries a job once and the worker's re-throw retries nothing. A new
  queue sets its own `attempts` the same way.

## Worker file

- Same name and payload type as the queue.
- The processor wraps its work in try/catch, logs success and failure with `logger` from `@utils`, and
  **re-throws** so BullMQ retries.
- Attach `.on("failed", ...)` as the catch-all.
- Delegate to a service (`EmailService`) rather than doing the work inline.

## Producing jobs

Services produce, never handlers. Always `await queue.add(...)`. **Enqueue after the transaction
commits**: a job enqueued inside a `db.$transaction` callback survives a rollback and mails a token
that does not exist. Capture `getCurrentLocale()` into the payload (`lang`).

## Wiring up a new queue

1. `src/bull/queue/<job>.queue.ts`, re-exported from `src/bull/index.ts`.
2. `src/bull/worker/<job>.worker.ts`, side-effect-imported from `src/bull/index.ts`.
3. Payload type under `src/libs/types/`.

## Don't

- Don't open a Redis connection in a queue or worker file.
- Don't swallow errors in a processor.
- Don't import a worker from outside `@bull`.
- Don't use `console.*` in workers.
- Don't put a token or a token-bearing URL in a log line.
