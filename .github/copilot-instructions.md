# Copilot Instructions

## Code Style and Quality

### Type Safety

- Always use strict TypeScript types
- Never use `any` type - use proper types or `unknown` with type guards
- Follow the ESLint rules configured in the project:
  - `@typescript-eslint/no-explicit-any`: error
  - `@typescript-eslint/no-floating-promises`: error
  - `no-console`: warn

### Comments

- Do not add comments on every line of code
- Add comments only before function blocks or complex logic blocks
- For complex conditions (e.g., if statements with multiple checks), add a comment before the condition, not inside or on every line
- Keep comments concise and meaningful

### Communication

- Do not use icons or emojis in any files
- When responding to questions, provide direct answers without examples, markdown, or documentation unless explicitly requested
- Focus on implementation rather than explanation

## Project Structure

### Backend Framework

- This is a Hono backend API project
- Uses Zod OpenAPI for schema validation and API documentation
- Routes are defined using `@hono/zod-openapi`

### Database

- PostgreSQL as the primary database
- Prisma ORM for database operations
- Schema is defined in `prisma/schema.prisma`
- Migrations are in `prisma/migrations/`
- Prisma client singleton is in `src/libs/database/postgres/client.ts`
- Repository pattern for database access

### Additional Technologies

- ClickHouse for analytics (optional)
- Redis for caching and rate limiting
- BullMQ for background job processing
- Bun as the JavaScript runtime

## Architecture Patterns

### Clean Architecture

- Follow the clean architecture pattern
- Services contain business logic
- Repositories handle data access
- Routes define HTTP endpoints
- Keep dependencies pointing inward

### Dependency Injection

- Use the container pattern in `src/libs/hono/core/container.ts`
- Register services and repositories in the container
- Use DI middleware to inject dependencies

### Error Handling

- Use custom error classes from `src/libs/hono/errors/`
- Handle errors with the centralized error handler
- Return appropriate HTTP status codes

## Code Organization

### Modules

- Each module should have its own directory under `src/modules/`
- Module structure:
  - `routes.ts` - Route definitions
  - `schema.ts` - Zod schemas
  - `service.interface.ts` - Service interface
  - `service.ts` - Service implementation

### Guards

- Use permission and role guards for authorization
- Guards are in `src/libs/hono/guards/`
- Apply guards to protected routes

### Middlewares

- Auth middleware for authentication
- Request ID middleware for tracing
- Performance middleware for monitoring
- Custom middlewares should follow the Hono middleware pattern

## Prisma Conventions

### Schema Changes

- All models are defined in `prisma/schema.prisma`
- After any schema change, run `bun run db:generate` to regenerate the Prisma client
- Use `bun run db:migrate` to create and apply migrations in all environments
- Use `bun run db:push` only during active development (no migration file created)

### Client Usage

- Import the singleton from `src/libs/database/postgres/client.ts`
- Never instantiate `PrismaClient` directly in application code
- Always handle Prisma errors in repositories, not in services

### Repositories

- Wrap all Prisma calls inside repository methods
- Repository interfaces are in `src/libs/types/repositories/`
- Do not leak Prisma-generated types (e.g., `Prisma.UserWhereInput`) into service or route layers
- Return plain typed objects from repositories

## Best Practices

### Security

- Validate all inputs with Zod schemas
- Use strong password requirements (defined in `src/libs/default/strong-password.ts`)
- Implement rate limiting for sensitive endpoints
- Sanitize file uploads

### Performance

- Use caching where appropriate
- Implement pagination for list endpoints
- Use database indexes for frequently queried fields
- Monitor performance with the performance middleware

### Testing

- Write tests for business logic
- Test edge cases and error scenarios
- Use meaningful test descriptions

### Git Commits

- Write clear, descriptive commit messages
- Follow conventional commits format
- Keep commits atomic and focused
