# Clean Hono Prisma

A clean architecture backend API built with Hono, TypeScript, Bun, and Prisma ORM.

## Features

- Clean architecture pattern with separation of concerns
- Hono web framework with Zod OpenAPI integration
- PostgreSQL with Prisma ORM
- Redis for caching and rate limiting
- BullMQ for background job processing
- ClickHouse for analytics (optional)
- Comprehensive authentication and authorization (RBAC)
- API documentation with Scalar
- Docker support

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Language**: TypeScript
- **Databases**: PostgreSQL, Redis, ClickHouse
- **ORM**: Prisma
- **Queue**: BullMQ
- **Validation**: Zod
- **API Docs**: Zod OpenAPI + Scalar

## Prerequisites

- Bun 1.x or higher
- PostgreSQL
- Redis
- Docker (optional)

## Installation

Install dependencies:

```sh
bun install
```

## Configuration

Copy the example environment file and configure your environment variables:

```sh
cp .env.example .env
```

Configure the following environment variables:

- Database connections (PostgreSQL, Redis, ClickHouse)
- Mail settings
- JWT secrets
- Application settings

## Database Setup

Generate the Prisma client:

```sh
bun run db:generate
```

Run PostgreSQL migrations:

```sh
bun run db:migrate
```

Seed the database with initial data:

```sh
bun run db:seed
```

For development, push schema directly without creating a migration:

```sh
bun run db:push
```

Open Prisma Studio to view and edit data:

```sh
bun run db:studio
```

Run ClickHouse migrations:

```sh
bun run db:clickhouse:migrate
```

Check ClickHouse migration status:

```sh
bun run db:clickhouse:status
```

## Development

Run the API server in development mode with hot reload:

```sh
bun run dev
```

The API will be available at http://localhost:8001

## Production

Build the application:

```sh
bun run build
```

Start the production server:

```sh
bun run start
```

## Docker

Build and run with Docker Compose:

```sh
docker-compose up -d
```

## Project Structure

```
src/
├── app.ts                 # Application setup
├── bootstrap.ts           # DI container registrations
├── index.ts               # Entry point
├── bull/                  # Background jobs
│   ├── queue/            # Job queues
│   └── worker/           # Job workers
├── libs/                  # Shared libraries
│   ├── cache/            # Cache utilities
│   ├── config/           # Configuration
│   ├── database/         # Database clients and repositories
│   │   ├── clickhouse/  # ClickHouse client and repositories
│   │   ├── postgres/    # Prisma client and repositories
│   │   └── redis/       # Redis client
│   ├── hono/             # Hono framework utilities
│   ├── mail/             # Email service
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── modules/               # Feature modules
    ├── auth/             # Authentication
    ├── home/             # Health check
    ├── profile/          # User profile
    └── settings/         # Application settings
        ├── permissions/  # Permission management
        ├── roles/        # Role management
        ├── select-options/ # Dropdown options
        └── users/        # User management
```

## Code Quality

Run linting:

```sh
bun run lint
```

Fix linting issues:

```sh
bun run lint:fix
```

Format code:

```sh
bun run format
```

Type check:

```sh
bun run typecheck
```

## API Documentation

Once the server is running, access the API documentation at:

```
http://localhost:8001/docs
```

## Scripts

### Development

- `bun run dev` - Run API server with hot reload

### Build & Production

- `bun run build` - Build the application
- `bun run start` - Start in production mode

### Code Quality

- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint issues
- `bun run format` - Format code with Prettier

### Database (PostgreSQL/Prisma)

- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Create and apply migrations
- `bun run db:push` - Push schema to database (development only)
- `bun run db:pull` - Introspect database into schema
- `bun run db:studio` - Open Prisma Studio
- `bun run db:reset` - Reset database (dangerous!)
- `bun run db:seed` - Seed database with initial data

### Database (ClickHouse)

- `bun run db:clickhouse:migrate` - Run ClickHouse migrations
- `bun run db:clickhouse:status` - Check migration status

### Makefile Commands

You can also use `make` commands:

- `make help` - Show all available commands
- `make dev` - Start development server
- `make fresh` - Reset, push schema, and seed (development)
- `make reset` - Migrate and seed

## Roadmap & Improvements

See [TODO.md](./TODO.md) for a comprehensive list of planned improvements and enhancements.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
