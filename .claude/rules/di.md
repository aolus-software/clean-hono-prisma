# Rule: Dependency injection (DI container)

`src/libs/hono/core/container.ts` is a tiny container, exported as `container` from `@hono-libs`. It is
how module services reach handlers.

## The four steps for a new service

1. **Interface** — `src/modules/<name>/service.interface.ts` exports `I<Name>Service`.
2. **Register** — in `src/bootstrap.ts` (called once from `src/app.ts` before routes are mounted):
   ```ts
   container.register("fooService", () => new FooService());
   ```
3. **Inject** — in `diMiddleware` (`src/libs/hono/middlewares/core/di.middleware.ts`):
   ```ts
   c.set("fooService", container.resolve<IFooService>("fooService"));
   ```
4. **Type** — add `fooService: IFooService` to `Variables` in `src/libs/types/hono/app.types.ts`.

Handlers then read `c.get("fooService")`. All four steps are required; a missing one is a runtime
"not registered" error or an `unknown` type.

## Rules

- Keys are camelCase, unique across the container (a duplicate silently overwrites).
- `resolve` memoises the first instance, so one service instance serves every request — keep services
  stateless.
- The container holds **services only**. Repositories are factories called directly; utilities are
  imported.
- Registration happens only in `src/bootstrap.ts`, never at module load of a service or route file.
- `container.resolve(...)` is never called at module top level — the container is empty until
  `bootstrap()` runs.
- `reset()` / `clearAll()` are for tests; application code never calls them.
- Don't introduce a second DI library.
