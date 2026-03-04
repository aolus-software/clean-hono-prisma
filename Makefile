.PHONY: help install dev build start lint lint-fix format typecheck db-generate db-migrate db-push db-pull db-studio db-reset db-seed db-clickhouse-migrate db-clickhouse-status fresh reset

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "  Setup:"
	@echo "    install             - Install dependencies"
	@echo ""
	@echo "  Development:"
	@echo "    dev                 - Run dev server"
	@echo ""
	@echo "  Build:"
	@echo "    build               - Build server"
	@echo ""
	@echo "  Production:"
	@echo "    start               - Start server in production"
	@echo ""
	@echo "  Code Quality:"
	@echo "    lint                - Run ESLint"
	@echo "    lint-fix            - Fix ESLint issues"
	@echo "    format              - Format code with Prettier"
	@echo "    typecheck           - Run TypeScript type check"
	@echo ""
	@echo "  Database (PostgreSQL/Prisma):"
	@echo "    db-generate         - Generate Prisma client"
	@echo "    db-migrate          - Create and apply migration"
	@echo "    db-push             - Push schema to database (dev only)"
	@echo "    db-pull             - Introspect database into schema"
	@echo "    db-studio           - Open Prisma Studio"
	@echo "    db-reset            - Reset database (dangerous!)"
	@echo "    db-seed             - Seed database with initial data"
	@echo ""
	@echo "  Database (ClickHouse):"
	@echo "    db-clickhouse-migrate - Run ClickHouse migrations"
	@echo "    db-clickhouse-status  - Check ClickHouse migration status"
	@echo ""
	@echo "  Workflows:"
	@echo "    fresh               - Reset, push schema, and seed (dev only)"
	@echo "    reset               - Migrate and seed"

install:
	bun install

dev:
	bun run dev

build:
	bun run build

start:
	bun run start

# Code quality
lint:
	bun run lint

lint-fix:
	bun run lint:fix

format:
	bun run format

typecheck:
	bun run typecheck

# Database (PostgreSQL/Prisma)
db-generate:
	bun run db:generate

db-migrate:
	bun run db:migrate

db-push:
	bun run db:push

db-pull:
	bun run db:pull

db-studio:
	bun run db:studio

db-reset:
	bun run db:reset

db-seed:
	bun run db:seed

# Database (ClickHouse)
db-clickhouse-migrate:
	bun run db:clickhouse:migrate

db-clickhouse-status:
	bun run db:clickhouse:status

# Combined workflows
fresh: db-reset db-push db-seed
	@echo "Database refreshed and seeded!"

reset: db-migrate db-seed
	@echo "Database migrated and seeded!"
