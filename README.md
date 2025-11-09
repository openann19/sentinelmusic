# Music Hub

A modern music management platform built with a monorepo architecture.

## Architecture

This monorepo contains:

- **apps/api** - NestJS + Fastify REST API
- **apps/web** - Next.js application (user + admin panel)
- **apps/indexer** - OpenSearch indexer + backfill CLI
- **packages/db** - Prisma schema + migrations + client
- **packages/config** - Shared TypeScript, ESLint, and Prettier configurations
- **packages/ui** - Shared React components (shadcn/ui)
- **packages/types** - Zod/io-ts types shared across apps

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose (for local development)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp infra/.env.example .env
```

Update the `.env` file with your configuration.

### 3. Start Infrastructure Services

Start PostgreSQL, OpenSearch, and Redis using Docker Compose:

```bash
cd infra
docker-compose up -d
```

### 4. Set Up Database

Generate Prisma client and run migrations:

```bash
cd packages/db
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Servers

From the root directory:

```bash
pnpm dev
```

This will start all applications in development mode.

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages
- `pnpm format` - Format code with Prettier

## Project Structure

```
music-hub/
├── apps/
│   ├── api/           # NestJS + Fastify REST API
│   ├── web/           # Next.js app
│   └── indexer/       # OpenSearch indexer
├── packages/
│   ├── db/            # Prisma schema + client
│   ├── config/        # Shared configurations
│   ├── ui/            # Shared React components
│   └── types/         # Shared TypeScript types
├── infra/             # Docker Compose setup
└── .github/workflows/ # CI/CD workflows
```

## Development

### API Development

The API runs on `http://localhost:3001` by default. Swagger documentation is available at `http://localhost:3001/api`.

#### Key Features

- **Versioned Routes**: All routes are versioned using `@Version('1')` decorator
- **DTO Validation**: All endpoints use DTOs with `class-validator` decorators
- **Exception Handling**: Centralized exception handling with custom filters
- **ConfigService**: Environment variables accessed through `ConfigService`
- **OpenSearch Integration**: Search functionality with database fallback
- **Security**: Helmet, rate limiting, and CORS configured

### Web Development

The Next.js app runs on `http://localhost:3000` by default.

### Indexer

Run the indexer backfill CLI:

```bash
cd apps/indexer
pnpm backfill
```

This will:
1. Create the OpenSearch index if it doesn't exist
2. Backfill all tracks from the database to OpenSearch
3. Process in batches of 500 records

## Database

### Prisma Commands

```bash
cd packages/db
pnpm db:generate    # Generate Prisma Client
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
pnpm db:push        # Push schema changes
pnpm db:seed        # Seed database
```

## Testing

Run tests across all packages:

```bash
pnpm test
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Artists
- `GET /v1/artists/:id` - Get artist by ID

### Search
- `GET /v1/search?q=query` - Search artists and tracks

### Authentication
- `GET /v1/auth/me` - Get current user (TODO: JWT implementation)
- `POST /v1/auth/login` - Login user
- `GET /v1/auth/admin` - Admin only endpoint (protected)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm type-check`
4. Submit a pull request

## License

MIT
