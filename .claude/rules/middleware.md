# Rule: Middleware (`src/libs/hono/middlewares/`)

Hono middleware is this repo's extension mechanism (the Elysia siblings call theirs plugins).

## The files that exist

```
src/libs/hono/middlewares/
├── core/
│   ├── request-id.middleware.ts     # X-Request-Id in and out
│   ├── logger.middleware.ts         # hono-pino request logging
│   ├── performance.middleware.ts    # response timing
│   ├── locale.middleware.ts         # Accept-Language -> request locale
│   └── di.middleware.ts             # services from the container onto c.var
└── security/
    ├── body-limit.middleware.ts     # 100KB request bodies
    ├── cors.middleware.ts           # origins from ALLOWED_HOST
    ├── security-headers.middleware.ts
    ├── rate-limiter.middleware.ts   # 100 / 60 s per connection address
    └── auth.middleware.ts           # AuthMiddleware: per route, never global
```

Guards live beside them in `src/libs/hono/guards/` (`rbac.md`). `src/libs/plugins/` holds an optional
plugin registry with examples; nothing in the request path depends on it.

## Shape

```ts
export const fooMiddleware: MiddlewareHandler<Env> = async (c, next) => {
	// before
	await next();
	// after
};
```

camelCase name ending in `Middleware` (`AuthMiddleware` is the historical exception), typed
`MiddlewareHandler<Env>`, exported from the folder's `index.ts`.

## Composition — `src/app.ts`

The global stack, in order:

1. `requestIdMiddleware`
2. `loggerMiddleware`
3. `performanceMiddleware`
4. `localeMiddleware`
5. `diMiddleware`
6. `bodyLimitMiddleware`
7. `corsMiddleware`
8. `securityHeadersMiddleware`
9. `rateLimiterMiddleware`

then `registerException(app)` (`onError` + `notFound`) and `app.route("/", modules)`. Order matters:
the locale must be set before anything translates; DI before any handler; CORS before the limiter so
a preflight is answered with headers.

## Per-route middleware

Authentication and authorization are attached per route through `createRoute({ middleware })`, which
`@hono/zod-openapi` runs before its validators and the handler. That is the only correct place for
them (`rbac.md`).

## Don't

1. Don't register `AuthMiddleware` or a guard globally or with `.use()`.
2. Don't read `process.env` in middleware; use `@config`.
3. Don't build a response body by hand in middleware — throw from `@errors` or use `ResponseToolkit`.
4. Don't add a global middleware without updating this rule and `docs/MIDDLEWARE.md`.
