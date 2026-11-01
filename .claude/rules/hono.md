# Rule: Hono app structure and layering

The app is Hono 4 with `@hono/zod-openapi` on Bun. One `OpenAPIHono` per module, composed by path in
`src/modules/index.ts`; the root `Hono<Env>` in `src/app.ts` owns the global middleware stack and the
error handler.

## Layering

```
routes.ts (createRoute + handler)  →  service class  →  repository factory  →  Prisma
          HTTP only                    business rules     queries only
```

- **Handlers** read validated input with `c.req.valid(...)`, the current user with
  `c.get("currentUser")`, and the service with `c.get("<name>Service")`. They return a
  `ResponseToolkit` envelope. Nothing else (`handlers.md`).
- **Services** own existence and uniqueness checks, transactions (`db.$transaction`), cache
  invalidation, and queue dispatch (`services.md`, `services-crud.md`).
- **Repositories** own Prisma queries and the sort/filter allow-lists (`repositories.md`).

## Services are classes in the container, repositories are factories

Module services are classes implementing an `I<Name>Service` interface, registered once in
`src/bootstrap.ts` and injected on every request by `diMiddleware` (`di.md`). Repositories are factory
functions called at each use: `await UserRepository().findById(id)`, or `UserRepository(tx)` inside a
transaction.

## Reuse before you build

| Need                                   | Use                                                        |
| -------------------------------------- | ---------------------------------------------------------- |
| Success / error envelope               | `ResponseToolkit` (`@utils`)                               |
| A typed failure                        | error classes in `@errors`                                 |
| Authentication                         | `AuthMiddleware` (`@hono-libs`)                            |
| Authorization                          | `permissionGuard([...])`, `roleGuard([...])` (`@guards`)   |
| List query (page, sort, filters)       | `datatableQuerySchema(...)` (`@types`) + `DatatableToolkit` (`@utils`) |
| Password hashing                       | `Hash` (`@utils`)                                          |
| JWT sign / verify                      | `JWTToolkit` (`@utils`)                                    |
| Random tokens                          | `StrToolkit.random(...)` (`@utils`, crypto RNG)            |
| Token lifetimes                        | functions in `@default`, called at issue time              |
| User cache, session revocation         | `Cache`, `forgetUserInformation`, `revokeSessions` (`@cache`) |
| Mail                                   | `sendEmailQueue` (`@bull`)                                 |
| Strings                                | `t(...)` (`@i18n`)                                         |
| Logging                                | `logger` (`@utils`)                                        |

## Config

Env is validated once in `src/libs/config/env.ts` (envalid) and read through `@config`
(`AppConfig`, `DatabaseConfig`, `RedisConfig`, `MailConfig`, `JWT_CONFIG`, ...). `process.env` is read
nowhere else. The exceptions are process plumbing that runs before config: `CLUSTER_WORKER_ID` in
`src/index.ts` / `src/server.ts`, and `prisma.config.ts`, which the Prisma CLI loads on its own.

## The global stack belongs to `src/app.ts`

Order: request id, logger, performance, locale, DI, body limit, CORS, security headers, rate limiter;
then `registerException(app)`; then `app.route("/", modules)`. Global concerns are added there, not in
a module (`middleware.md`). Authentication and authorization are **per route**, never global.

## Sibling rules

`modules.md`, `handlers.md`, `handlers-crud.md`, `validation.md`, `openapi.md`, `middleware.md`,
`rbac.md`, `services.md`, `services-crud.md`, `repositories.md`, `schema.md`.
