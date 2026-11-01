# Middleware

Hono middleware is this project's extension mechanism. Shared middleware lives in
`src/libs/hono/middlewares/` and is exported from `@hono-libs`.

## The global stack

Registered in `src/app.ts`, in this order, for every request:

| #   | Middleware                  | File                                      | Does                                                                        |
| --- | --------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| 1   | `requestIdMiddleware`       | `core/request-id.middleware.ts`           | Reuses or generates `X-Request-ID`, sets it on the context and the response |
| 2   | `loggerMiddleware`          | `core/logger.middleware.ts`               | Structured request logging (hono-pino)                                      |
| 3   | `performanceMiddleware`     | `core/performance.middleware.ts`          | Response timing                                                             |
| 4   | `localeMiddleware`          | `core/locale.middleware.ts`               | `Accept-Language` → request locale; sets `Content-Language`                 |
| 5   | `diMiddleware`              | `core/di.middleware.ts`                   | Puts the registered services on the context (`c.get("userService")`)        |
| 6   | `bodyLimitMiddleware`       | `security/body-limit.middleware.ts`       | Rejects bodies over 100KB                                                   |
| 7   | `corsMiddleware`            | `security/cors.middleware.ts`             | CORS from `ALLOWED_HOST`                                                    |
| 8   | `securityHeadersMiddleware` | `security/security-headers.middleware.ts` | `hono/secure-headers`                                                       |
| 9   | `rateLimiterMiddleware`     | `security/rate-limiter.middleware.ts`     | 100 requests / 60 s per connection address                                  |

After the stack, `registerException(app)` installs `onError` and `notFound`, and
`app.route("/", modules)` mounts `src/modules/index.ts`.

## Per-route middleware

| Middleware               | File                                       | Does                                                                   |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------------------------- |
| `AuthMiddleware`         | `security/auth.middleware.ts`              | Verifies the access token, loads `UserInformation`, sets `currentUser` |
| `permissionGuard([...])` | `src/libs/hono/guards/permission.guard.ts` | 403 unless the user holds every listed permission (superuser bypasses) |
| `roleGuard([...])`       | `src/libs/hono/guards/role.guard.ts`       | 403 unless the user holds every listed role (superuser bypasses)       |

They are attached in the route definition, so `@hono/zod-openapi` runs them before validation and the
handler:

```ts
const RoleListRoute = createRoute({
	method: "get",
	path: "",
	middleware: [AuthMiddleware, permissionGuard(["role list"])] as const,
	// request, responses, summary, ...
});
```

Do not attach them with `Router.use(...)`: Hono runs matching handlers in registration order and
`.use()` ignores the HTTP method, so a guard registered after `.openapi()` never protects that
route, and a guard on `"/:id"` would gate every method on that path.

## Writing a middleware

```ts
import type { MiddlewareHandler } from "hono";
import { Env } from "@types";

export const exampleMiddleware: MiddlewareHandler<Env> = async (c, next) => {
	await next();
	c.header("X-Example", "1");
};
```

1. Put it in `core/` (request plumbing) or `security/` (protection), export it from that folder's
   `index.ts`.
2. Global: register it in `src/app.ts` at the right point in the order. Per route: add it to the
   route's `middleware` array.
3. Read configuration from `@config`, throw errors from `@errors`, never build a response body by
   hand.
4. Update this page and `.claude/rules/middleware.md`.

## The plugin registry

`src/libs/plugins/` holds an optional plugin builder and registry with two examples
(`health-check.plugin.ts`, `request-logger.plugin.ts`). Nothing in the request path uses it.
