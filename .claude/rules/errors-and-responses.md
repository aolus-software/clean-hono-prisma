# Rule: Errors & Responses

The app speaks one response shape and one error vocabulary. `registerException(app)` (registered in `app.ts`) maps thrown errors to HTTP responses automatically.

## Success responses

Always use `ResponseToolkit` from `@utils`:

```ts
ResponseToolkit.success(c, data, "Optional message");
ResponseToolkit.success(c, data, "Resource created", 201);
```

Wire format:

```jsonc
// success
{ "success": true, "message": "...", "data": ... }

// paginated
{ "success": true, "message": "...", "data": [...], "meta": { "page": 1, "perPage": 10, "total": 42, "totalPages": 5 } }
```

## Errors

Throw, never return error objects. Imported from `@errors`:

```ts
throw new UnprocessableEntityError([
	{ field: "email", message: "Invalid email format" },
]);
throw new UnauthorizedError("Unauthorized");
throw new NotFoundError("User not found");
throw new ForbiddenError("You cannot do this");
```

`UnprocessableEntityError` takes a field-keyed validation array — match the existing shape so the OpenAPI `commonResponse(...)` examples remain accurate.

## Rules

1. **One success envelope.** Never construct the response object by hand — `ResponseToolkit` is canonical. Hand-written `{ success: true, data: … }` is a smell.
2. **One error vocabulary.** Use the existing error classes from `@errors`. If you need a new class, add it to `@errors` rather than inventing one inline.
3. **`UnprocessableEntityError` carries field details** for validation-shaped failures. Pass `[{ field, message }]` so clients can render inline errors.
4. **`defaultHook` from `@errors`** is passed to every `new OpenAPIHono({ defaultHook })` so Zod validation failures route through the same formatter. Never create an `OpenAPIHono` without it.
5. **Log inside the service before re-throwing**, with structured context:
   ```ts
   try { … }
   catch (error) {
     log.error({ error, userId }, "Failed to update user");
     throw new BadRequestError("Failed to update user");
   }
   ```
   Don't leak raw error messages from third-party libs to clients — translate to a domain error.
6. **Never leak secrets in error messages.** Token values, password hashes, internal stack traces — keep them out.
7. **Don't catch-and-swallow.** If you `catch`, either re-throw a translated error or handle the failure meaningfully.
8. **Route handlers never build error responses.** They call the service, which throws. The handler doesn't see error paths.
9. **Response status codes declared in `commonResponse(..., { include })`** must match what the handler can actually produce. See [validation.md](./validation.md).
