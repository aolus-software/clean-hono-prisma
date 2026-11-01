# Error Handling

## Overview

Code throws; one place renders. Errors thrown anywhere in a request are mapped to a response by
`registerException(app)` (`src/libs/hono/errors/error.handler.ts`, registered in `src/app.ts`). Zod
validation failures are rendered by `defaultHook` (`src/libs/hono/errors/zod-hook.ts`), which every
`OpenAPIHono` is created with.

## Response shapes

```jsonc
// 400 / 422 — field errors
{ "status": 422, "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }

// 401 / 403 / 404 / 500 / 503
{ "status": 404, "success": false, "message": "...", "data": null }

// 429 — from the rate limiter
{ "status": 429, "success": false, "message": "..." }
```

`status` equals the HTTP status. Messages are translated (`Accept-Language`). No stack trace, request
id, or internal code is included in the body; the request id is in the `X-Request-Id` response
header and in the logs.

## Error classes

All exported from `@errors` (`src/libs/hono/errors/`).

| Class                      | Status | `errors[]` | Typical use                                                            |
| -------------------------- | ------ | ---------- | ---------------------------------------------------------------------- |
| `BadRequestError`          | 400    | yes        | login and token failures, unknown filter key, bad filter value         |
| `UnauthorizedError`        | 401    | no         | missing / invalid / expired / wrong-type JWT, inactive or deleted user |
| `ForbiddenError`           | 403    | no         | a guard refuses                                                        |
| `NotFoundError`            | 404    | no         | a live row does not exist                                              |
| `UnprocessableEntityError` | 422    | yes        | uniqueness conflicts, wrong current password, unknown related ids      |
| `ServiceUnavailableError`  | 503    | no         | a dependency is down                                                   |

`BadRequestError` and `UnprocessableEntityError` take `(message, errors)` where `errors` is
`[{ field, message }]`.

```ts
throw new UnprocessableEntityError(t("user.emailExists"), [
	{ field: "email", message: t("user.emailExists") },
]);
throw new NotFoundError(t("role.notFound"));
```

## Framework paths

| Situation                                  | Response                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Zod validation fails (body, query, params) | 422, one `errors[]` entry per issue, `field` is the issue path joined with `.` |
| Malformed JSON body                        | 400, `errors: [{ field: "body", ... }]`                                        |
| No route matches                           | 404                                                                            |
| Anything else                              | 500, logged with the request context, generic message                          |

## Using errors

- Services throw; route handlers do not catch. A handler has no error branch.
- Translate third-party failures: catch, log with context, throw a class above. Raw Prisma or driver
  messages never reach a client.
- Uniqueness conflicts are always 422, including on register.
- Enumeration-leaky paths (`forgot-password`, `resend-verification`) return 200 instead of throwing.
- Never put a token, a hash, or a stack trace in a message.

## Further reading

- `.claude/rules/errors-and-responses.md`
- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — status code per case
