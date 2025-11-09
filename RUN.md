# Music Hub - Setup & Run Guide

## ✅ What's Been Set Up

1. **Database Package** (`packages/db`)
   - Prisma schema with all models
   - Seed script ready
   - Prisma client generated

2. **API** (`apps/api`)
   - NestJS + Fastify setup
   - Controllers, Services, DTOs
   - OpenSearch integration
   - Build successful ✅

3. **Indexer** (`apps/indexer`)
   - OpenSearch backfill script
   - Track mappings configured

## 🚀 Quick Start

### 1. Configure Database

Update `.env` with your PostgreSQL credentials:

```bash
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/music_hub?schema=public"
```

### 2. Setup Database

```bash
# Push schema to database
pnpm --filter @music-hub/db db:push

# Seed database
pnpm --filter @music-hub/db db:seed
```

### 3. (Optional) Setup OpenSearch

If you have OpenSearch running:

```bash
# Index tracks
pnpm --filter @music-hub/indexer backfill
```

### 4. Start API

```bash
# Development mode
pnpm --filter @music-hub/api dev

# Production mode
pnpm --filter @music-hub/api start:prod
```

API will be available at: `http://localhost:4000`
Swagger docs at: `http://localhost:4000/api/docs`

## 📋 Available Endpoints

- `GET /api/v1/artists/:id` - Get artist by ID
- `GET /api/v1/search?q=query` - Search artists and tracks
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/admin` - Admin endpoint (requires auth)

## 🔧 Troubleshooting

### Database Connection Issues

1. Make sure PostgreSQL is running
2. Create database: `createdb music_hub`
3. Update DATABASE_URL in `.env`

### OpenSearch Issues

- API will fallback to database search if OpenSearch is unavailable
- Check OpenSearch URL in `.env`

## 📦 Package Scripts

```bash
# Database
pnpm --filter @music-hub/db db:generate  # Generate Prisma client
pnpm --filter @music-hub/db db:push      # Push schema
pnpm --filter @music-hub/db db:seed      # Seed data
pnpm --filter @music-hub/db db:studio    # Open Prisma Studio

# API
pnpm --filter @music-hub/api dev         # Start dev server
pnpm --filter @music-hub/api build       # Build for production
pnpm --filter @music-hub/api start:prod  # Start production server

# Indexer
pnpm --filter @music-hub/indexer backfill # Index tracks
```

## 🎯 Next Steps

1. Update `.env` with your database credentials
2. Run database migrations
3. Seed the database
4. Start the API server
5. (Optional) Setup and run OpenSearch indexer
