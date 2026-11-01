# Documentation Index

Guides for someone consuming or operating the API. `.claude/rules/` is written for someone changing
the code.

| Guide                                          | Covers                                                                                                |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Envelope, authentication and refresh, the route map, data shapes, list query parameters, status codes |
| [CONFIGURATION.md](./CONFIGURATION.md)         | Every environment variable, its default, and what reads it                                            |
| [DEPLOYMENT.md](./DEPLOYMENT.md)               | Build, cluster mode, reuse-port, Docker and compose, migrations                                       |
| [ERROR_HANDLING.md](./ERROR_HANDLING.md)       | Error classes, the status mapping, the two error shapes                                               |
| [SECURITY.md](./SECURITY.md)                   | Tokens, login, RBAC, cache invalidation, rate limiting, CORS, headers                                 |
| [MIDDLEWARE.md](./MIDDLEWARE.md)               | The global middleware stack and per-route auth and guards                                             |

`audit-findings.md` appears here once `/audit-flow` has run.

## Interactive docs

With `ENABLE_API_DOCS=true` (set in `.env.example` for local work):

- `http://localhost:3000/docs` — Scalar UI
- `http://localhost:3000/docs/openapi.json` — OpenAPI 3 spec

The spec is generated from the `createRoute(...)` definitions, so it is as accurate as the routes'
declared schemas and responses. Use the `Bearer` button with an access token from `POST /auth/login`.
