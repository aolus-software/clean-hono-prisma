# Rule: Rate limiting

Rate limiting is **global and always on**. `rateLimiterMiddleware`
(`src/libs/hono/middlewares/security/rate-limiter.middleware.ts`, built on `hono-rate-limiter`) is
registered for every request in `src/app.ts`. There is **no per-route opt-out**.

## The actual configuration

100 requests per 60 seconds per client, keyed on the **connection address** — never on
`X-Forwarded-For`, which any client can set to dodge the limit. A 429 renders the standard envelope
without a `data` key:

```json
{ "status": 429, "success": false, "message": "..." }
```

**The numbers are hardcoded.** There is no `THROTTLER_*` env var. Changing the limit means editing
the middleware. If it ever needs to vary per environment, add it to `@config` and read it there — one
named source.

**The store is in memory, per process.** In cluster mode (`APP_CLUSTER_MODE=true`) each worker counts
separately, so the effective limit is the configured limit times the worker count. A shared limit
needs a Redis store or a limiter in the reverse proxy. Behind a proxy, the connection address is the
proxy's; terminate the limit at the proxy or teach the key generator to trust a specific proxy header
deliberately.

## Credential endpoints

`POST /auth/login`, `/auth/refresh`, `/auth/register`, `/auth/forgot-password`,
`/auth/reset-password`, `/auth/verify-email`, and `/auth/resend-verification` are unauthenticated.
Their policy may be **tightened, never loosened**. Tightening one means adding a second, scoped
limiter in that route's `middleware` array; it stacks on top of the global one.

## Don't

1. Don't edit the global limiter to accommodate one noisy route.
2. Don't loosen a credential endpoint.
3. Don't key the limiter on a client-supplied header.
4. Don't claim a `THROTTLER_*` env var exists.
