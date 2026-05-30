# Project Rules

Coding rules for the `clean-hono` codebase. Each file is a focused, enforceable contract — read the relevant rule before writing code in that area.

## Rules

| Rule                                                 | Scope                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| [di.md](./di.md)                                     | Dependency injection container & `diMiddleware`              |
| [modules.md](./modules.md)                           | Feature module layout under `src/modules/`                   |
| [openapi.md](./openapi.md)                           | OpenAPI / Scalar documentation, `createRoute`, tags          |
| [queue.md](./queue.md)                               | BullMQ queues, workers, retries                              |
| [repositories.md](./repositories.md)                 | Drizzle repository factory pattern & transactions            |
| [shared-code.md](./shared-code.md)                   | Anything reusable across modules **must** live in `libs/`    |
| [services.md](./services.md)                         | Service interface + implementation, business logic           |
| [errors-and-responses.md](./errors-and-responses.md) | Custom errors + `ResponseToolkit` envelope                   |
| [imports-and-naming.md](./imports-and-naming.md)     | Path aliases, import order, file naming                      |
| [validation.md](./validation.md)                     | Zod schemas in `schema.ts`, request/response shape           |

## How to use

- These rules complement `CLAUDE.md` — they don't replace it.
- When a rule conflicts with `CLAUDE.md`, the rule file wins (it's more specific).
- Don't introduce a new pattern without updating the relevant rule first.
