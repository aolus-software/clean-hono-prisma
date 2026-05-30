# Rule: Services — Business Logic

Services hold the _what_ and _why_ of a feature. Repositories hold the _how_ of data access. Route handlers are the glue.

## Location

- Per-module: `src/modules/<feature>/service.ts`
- Interface: `src/modules/<feature>/service.interface.ts`
- Cross-module / domain services: `src/libs/<domain>/*.service.ts` (e.g. mailer)

## Rules

1. **Services are plain objects, not classes.**
   ```ts
   export const AuthService = {
     async signIn(email: string, password: string): Promise<...> { … },
   };
   ```
   No `this`, no inheritance, no constructors. The export name uses `PascalCaseService`.
2. **Every service has an interface** in `service.interface.ts`:
   ```ts
   export interface IAuthService {
     signIn(email: string, password: string): Promise<LoginResponse>;
   }
   ```
3. **No Hono or HTTP types inside services.** No `Context`, no `c.json()`, no `c.status()`. Services receive primitives/DTOs and return primitives/DTOs. Route handlers do the HTTP mapping.
4. **Services orchestrate repositories.** Call `UserRepository().method(...)` — invoke the factory **each call**, never destructure once at module scope.
5. **Validation is layered.**
   - Schema validation (shape, format) → Zod in `schema.ts`
   - Business validation (uniqueness, state machine) → service, throwing custom errors from `@errors`
6. **Throw, don't return error objects.** Every failure throws `BadRequestError`, `UnauthorizedError`, `NotFoundError`, `ForbiddenError`, `UnprocessableEntityError`. The error handler turns them into proper HTTP responses.
7. **Wrap multi-write operations in `db.transaction`** and pass `trx` into repositories. See [repositories.md](./repositories.md).
8. **Cache reads, invalidate on writes.** When a service caches in Redis (e.g. `Cache.set(UserInformationCacheKey(id), …)`), the corresponding write methods in the same service must invalidate the same key. Keep cache keys in `@cache`.
9. **Log with structured fields and a message:**
   ```ts
   log.error({ error, userId }, "Failed to queue verification email");
   ```
   Object first, message second. Never log raw passwords/tokens.
10. **Silent on enumeration-leaky paths.** Endpoints like "forgot password" / "resend verification" must not reveal whether an email exists — `return` early instead of throwing.
11. **A service does one feature.** Cross-feature flows live in higher-level orchestrators or are coordinated by the route handler.
