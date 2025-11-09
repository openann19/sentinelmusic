# Quick Reference Guide

Quick reference for common tasks and commands in the Music Hub project.

## 📋 Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm type-check

# Format code
pnpm format
```

### Database

```bash
cd packages/db

# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Create migration
pnpm db:migrate:create --name migration_name

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed

# Reset database (WARNING: deletes all data)
pnpm db:reset
```

### Infrastructure

```bash
cd infra

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Indexer

```bash
cd apps/indexer

# Run backfill
pnpm backfill --index tracks --batch-size 100
```

## 🏗️ Project Structure

```
music-hub/
├── apps/
│   ├── api/          # NestJS API (port 4000)
│   ├── web/          # Next.js app (port 3000)
│   └── indexer/      # OpenSearch indexer
├── packages/
│   ├── db/           # Prisma schema
│   ├── config/       # Shared configs
│   ├── ui/           # UI components
│   └── types/        # TypeScript types
└── infra/            # Docker Compose
```

## 🔗 Important URLs

- **API**: http://localhost:4000
- **API Swagger**: http://localhost:4000/api
- **Web**: http://localhost:3000
- **Prisma Studio**: Run `pnpm db:studio`
- **OpenSearch**: http://localhost:9200
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📝 Code Patterns

### NestJS Service

```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async myMethod(): Promise<Result> {
    // Implementation
  }
}
```

### NestJS Controller

```typescript
@Controller('api/v1/resource')
export class MyController {
  constructor(private readonly myService: MyService) {}

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.myService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateDto) {
    return this.myService.create(dto);
  }
}
```

### DTO with Validation

```typescript
export class CreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Next.js Server Component

```typescript
export default async function Page({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
  return <Component data={data} />;
}
```

### Next.js Client Component

```typescript
'use client';

export function Component({ data }: { data: Data }) {
  const [state, setState] = useState();
  // Implementation
}
```

## 🧪 Testing

### Run Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

### Test Pattern

```typescript
describe('MyService', () => {
  let service: MyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: PrismaService,
          useValue: {
            // Mock methods
          },
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should work', async () => {
    // Test implementation
  });
});
```

## 🔍 Environment Variables

### API (.env.local)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/music_hub"
OPENSEARCH_URL="http://localhost:9200"
REDIS_URL="redis://localhost:6379"
PORT=4000
WEB_ORIGIN="http://localhost:3000"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### Web (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NODE_ENV="development"
```

## 🚫 Common Mistakes to Avoid

1. ❌ Using `console.log` - Use proper logging
2. ❌ Using `process.env` directly - Use `ConfigService`
3. ❌ Using `any` type - Use proper TypeScript types
4. ❌ Skipping tests - Write tests for all features
5. ❌ Exposing secrets - Never log or expose sensitive data
6. ❌ Ignoring TypeScript errors - Fix all type errors
7. ❌ Writing raw SQL - Use Prisma
8. ❌ Skipping validation - Always validate inputs with DTOs
9. ❌ Poor error handling - Handle errors gracefully
10. ❌ Large files - Keep files small and modular

## ✅ Pre-Commit Checklist

- [ ] Code follows project rules
- [ ] Tests are written and passing
- [ ] TypeScript types are correct
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console.log statements
- [ ] No secrets or sensitive data
- [ ] Error handling is implemented
- [ ] DTOs are used for API endpoints
- [ ] Documentation is updated (if needed)

## 📚 Documentation

- **README.md** - Project overview and setup
- **PROJECT_RULES.md** - Detailed rules and conventions
- **WORKFLOW.md** - Development workflow
- **INITIAL_PROMPT.md** - AI assistant prompt
- **QUICK_REFERENCE.md** - This file

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check Docker containers
docker-compose ps

# Check database connection
docker-compose exec postgres psql -U user -d music_hub
```

### OpenSearch Issues

```bash
# Check OpenSearch status
curl http://localhost:9200/_cluster/health

# Check indices
curl http://localhost:9200/_cat/indices?v
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
cd packages/db
pnpm db:generate
```

### Port Conflicts

- Change `PORT` in `apps/api/.env.local`
- Change port in `apps/web/package.json` dev script
- Change port mapping in `infra/docker-compose.yml`

## 🎯 Key Principles

1. **Type Safety First** - Always use TypeScript strict mode
2. **Security First** - Never expose secrets, validate all inputs
3. **Test Coverage** - Write tests for all business logic
4. **Modularity** - Keep files small and focused
5. **Performance** - Optimize for performance
6. **Documentation** - Document complex logic

## 📖 Useful Links

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [OpenSearch Docs](https://opensearch.org/docs/)
- [Fastify Docs](https://www.fastify.io/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Quick Tips**:
- Use `pnpm` not `npm` or `yarn`
- Always run `pnpm db:generate` after schema changes
- Check Docker containers before starting development
- Run `pnpm type-check` before committing
- Write tests as you develop, not after

