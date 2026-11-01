# Rule: Errors & Responses

The app speaks one envelope and one error vocabulary. `registerException(app)` (in `src/app.ts`)
maps thrown errors to responses; `defaultHook` maps Zod validation failures. `status` in the body
always equals the HTTP status.

## Wire format

```jsonc
// success (200 / 201)
{ "status": 200, "success": true, "message": "...", "data": { } }

// list
{ "status": 200, "success": true, "message": "...",
  "data": { "data": [ ], "meta": { "page": 1, "limit": 10, "totalCount": 42 } } }

// 400 / 422 — field errors
{ "status": 422, "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }

// 401 / 403 / 404 / 500 — no field detail
{ "status": 404, "success": false, "message": "...", "data": null }

// 429 — from the rate limiter, no data key
{ "status": 429, "success": false, "message": "..." }
```

- `meta` is exactly `{ page, limit, totalCount }`; the request param is `perPage`.
- Zod failures: `field` is the issue path joined with `.`, falling back to `general`.
- A malformed JSON body is 400 with `errors: [{ field: "body", ... }]`; an unmatched route is 404; any
  other exception is a logged 500 with no stack trace in the body.
- Response field names are camelCase.

## Success responses

```ts
ResponseToolkit.success(c, data, t("user.detail"), 200);
ResponseToolkit.success(c, null, t("user.created"), 201);
```

## Errors

Throw, never return. From `@errors`:

| Class                      | Status | Carries `errors[]` |
| -------------------------- | ------ | ------------------ |
| `BadRequestError`          | 400    | yes                |
| `UnauthorizedError`        | 401    | no                 |
| `ForbiddenError`           | 403    | no                 |
| `NotFoundError`            | 404    | no                 |
| `UnprocessableEntityError` | 422    | yes                |
| `ServiceUnavailableError`  | 503    | no                 |

```ts
throw new UnprocessableEntityError(t("user.emailExists"), [
	{ field: "email", message: t("user.emailExists") },
]);
throw new NotFoundError(t("role.notFound"));
```

## Status code per case

| Case                                                   | Status |
| ------------------------------------------------------ | ------ |
| No / invalid / expired bearer, wrong token type, user inactive or deleted | 401 |
| Guard refuses                                          | 403    |
| `:id` not found (live rows only)                       | 404    |
| Request shape (Zod), bad `sort` / `sortDirection`, malformed uuid | 422 |
| Uniqueness conflict (email, role name, permission name), including register | 422 |
| Unknown filter key, bad filter value                   | 400    |
| Login failure (unknown email, wrong password, unverified, not active) | 400 on `email` |
| Invalid / expired / used verification or reset token  | 400 on `token` |
| Rate limited                                           | 429    |
| `/health` with a failing probe                         | 503    |

## Rules

1. **One envelope.** Use `ResponseToolkit`; never `c.json({ success: ... })` by hand.
2. **One error vocabulary.** Need a new class? Add it to `@errors` and to the table above.
3. **Never leak secrets or internals** — no tokens, hashes, stack traces, or raw Prisma messages.
4. **Don't catch-and-swallow.** Re-throw a translated error or handle the failure meaningfully.
5. **Messages are i18n keys** (`i18n.md`).
