# Rule: Dependency injection (DI container)

The project ships a tiny DI container at `src/libs/hono/core/container.ts` and exposes it two ways:

- as the exported singleton `container` (re-exported from `@hono-libs`)
- on the Hono context via `diMiddleware` (which is already in `app.ts`), injecting services into `c.var`

## When to use it

Default to **resolving from the Hono context** via `c.get("serviceName")` in route handlers. The `diMiddleware` sets all registered services onto the context.

Use `container.resolve<T>(name)` directly when one of these is true:

1. The service is referenced from a place that would create a **circular import** if it imported the concrete module (e.g. a middleware that lives "above" the services).
2. You need to **swap implementations** at runtime (tests, feature flags, environment-specific backends).
3. The consumer doesn't know which concrete service it should call until request time.

If none of those apply, just `c.get("authService")` in a handler — adding indirection costs more than it earns.

## Registration

All registrations live in **one** place: `src/bootstrap.ts`. That function is called once from `app.ts` **before** the Hono app is built. Any new service that needs to be DI-resolvable must be added there:

```ts
import { container } from "@hono-libs";

export const bootstrap = () => {
	container.register("authService", () => AuthService);
	container.register("fooService", () => FooService); // <-- new
};
```

Rules for registration keys:

- Use camelCase matching the service variable: `authService`, `userService`, `profileService`.
- Names must be unique across the whole container — collisions silently overwrite.
- The factory is `() => Service` (a thunk). Resolution memoizes the first return value, so subsequent `resolve("fooService")` calls hand back the same instance — keep factories pure.

## Wiring into context

After registering in `bootstrap.ts`, add the service to `diMiddleware` (`src/libs/hono/middlewares/core/di.middleware.ts`) so it's available on every request:

```ts
c.set("fooService", container.resolve<typeof FooService>("fooService"));
```

Then add the type to `Variables` in `src/libs/types/hono/app.types.ts`:

```ts
fooService: typeof FooService;
```

All four steps are required: interface → register → set in middleware → add to Variables type.

## Don't

- Don't register from inside a service file or a module's `routes.ts` — registration belongs only in `src/bootstrap.ts`.
- Don't call `container.resolve(...)` at module top level. The container is empty until `bootstrap()` runs.
- Don't `container.reset()` or `clearAll()` from application code. Those are escape hatches intended for tests.
- Don't use the container to inject repositories or utility functions. The container is for **services only**.
- Don't introduce a second DI library (tsyringe, inversify, awilix). The hand-rolled container is intentional.
