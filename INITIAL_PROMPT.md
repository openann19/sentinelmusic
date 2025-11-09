# Initial Prompt for AI Assistants

This document provides the initial context and instructions for AI assistants working on the Music Hub project.

## 🎯 Project Overview

Music Hub is a modern music management platform built with a monorepo architecture. The project consists of:

- **NestJS API** - RESTful API built with NestJS and Fastify
- **Next.js Web** - Frontend application built with Next.js 14
- **OpenSearch Indexer** - Service for indexing music data in OpenSearch
- **Shared Packages** - Database (Prisma), UI components, types, and configurations

## 🏗️ Architecture

### Technology Stack

- **Backend**: NestJS, Fastify, Prisma, PostgreSQL, OpenSearch, Redis
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 16+
- **Search**: OpenSearch 2.11+
- **Cache**: Redis 7+
- **Monorepo**: pnpm workspaces, Turborepo

### Project Structure

```
music-hub/
├── apps/
│   ├── api/          # NestJS API
│   ├── web/          # Next.js app
│   └── indexer/      # OpenSearch indexer
├── packages/
│   ├── db/           # Prisma schema and client
│   ├── config/       # Shared configurations
│   ├── ui/           # Shared UI components
│   └── types/        # Shared TypeScript types
└── infra/            # Docker Compose setup
```

## 📋 Core Rules and Constraints

### NestJS API Rules

1. **Decorators**: All modules, services, controllers must use TypeScript decorators (`@Module()`, `@Injectable()`, `@Controller()`)

2. **Dependency Injection**: Use explicit constructor injection, avoid `any` type

3. **DTOs**: All public endpoints must define DTO classes with `class-validator` decorators

4. **Exception Handling**: Centralized using global filters, custom exceptions extend `HttpException`

5. **Environment Variables**: Use `ConfigService`, never `process.env` directly

6. **Async Code**: Use `async/await`, avoid `.then/.catch` chains

7. **Testing**: Unit tests required for services and controllers using Jest

8. **Security**: Never log or expose sensitive data

9. **Routing**: All routes must be versioned and RESTful, parameters must be type-validated

10. **Circular Dependencies**: Must be identified and refactored

### Code Quality Rules

1. **Type Safety**: Always use TypeScript strict mode, avoid `any` type

2. **Modularity**: Keep files small and focused, use hooks and composable patterns

3. **Testing**: Write tests for all business logic, maintain coverage thresholds

4. **Security**: Validate all inputs, sanitize data, never expose secrets

5. **Performance**: Optimize for performance, use code splitting and lazy loading

6. **Documentation**: Document complex logic and public APIs

### What NOT to Do

1. **Never** use `console.log` in production code
2. **Never** commit secrets or API keys
3. **Never** use `any` type without justification
4. **Never** ignore TypeScript errors
5. **Never** skip tests for new features
6. **Never** expose sensitive data in error messages
7. **Never** use `process.env` directly (use ConfigService)
8. **Never** write raw SQL queries (use Prisma)
9. **Never** ignore linting errors
10. **Never** commit code that doesn't pass type checking

## 🔧 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose

### Setup Steps

1. Install dependencies: `pnpm install`
2. Set up environment variables (see README.md)
3. Start infrastructure: `docker-compose up -d` (in infra/)
4. Set up database: `cd packages/db && pnpm db:generate && pnpm db:migrate`
5. Start development: `pnpm dev`

### Environment Variables

Required environment variables are documented in README.md. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENSEARCH_URL` - OpenSearch connection URL
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - JWT secret for authentication
- `PORT` - API port (default: 4000)

## 📚 Key Files and Patterns

### API Structure

- **Controllers**: `apps/api/src/routes/*.controller.ts`
- **Services**: `apps/api/src/modules/*.service.ts`
- **DTOs**: Should be in same file as controller or separate `dto/` folder
- **Guards**: `apps/api/src/security/*.guard.ts`
- **Main**: `apps/api/src/main.ts`

### Database Schema

- **Schema**: `packages/db/prisma/schema.prisma`
- **Models**: User, Artist, Album, Track
- **Client**: Import from `@music-hub/db` or `@prisma/client`

### Web Structure

- **Pages**: `apps/web/src/app/**/page.tsx`
- **Components**: Feature-based organization
- **Hooks**: Custom hooks in `hooks/` folder
- **Types**: Shared types from `@music-hub/types`

## 🎨 Code Patterns

### NestJS Service Pattern

```typescript
@Injectable()
export class ArtistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getArtist(id: string): Promise<Artist> {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });
    if (!artist) {
      throw new NotFoundException('Artist');
    }
    return artist;
  }
}
```

### NestJS Controller Pattern

```typescript
@Controller('api/v1/artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistService.getArtist(id);
  }

  @Post()
  async create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistService.createArtist(createArtistDto);
  }
}
```

### DTO Pattern

```typescript
export class CreateArtistDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
```

### Next.js Component Pattern

```typescript
// Server Component
export default async function ArtistPage({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id);
  return <ArtistDetails artist={artist} />;
}

// Client Component
'use client';

export function ArtistDetails({ artist }: { artist: Artist }) {
  const [isLoading, setIsLoading] = useState(false);
  // ...
}
```

## 🧪 Testing Patterns

### Unit Test Pattern

```typescript
describe('ArtistService', () => {
  let service: ArtistService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ArtistService,
        {
          provide: PrismaService,
          useValue: {
            artist: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ArtistService>(ArtistService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return artist by id', async () => {
    const mockArtist = { id: '1', name: 'Test Artist' };
    jest.spyOn(prisma.artist, 'findUnique').mockResolvedValue(mockArtist);

    const result = await service.getArtist('1');
    expect(result).toEqual(mockArtist);
  });
});
```

## 🔍 Search Patterns

### OpenSearch Integration

```typescript
const client = new Client({ node: process.env.OPENSEARCH_URL });

const result = await client.search({
  index: 'tracks',
  body: {
    query: {
      multi_match: {
        query: searchTerm,
        fields: ['title^2', 'artist'],
      },
    },
  },
});
```

## 🚀 Common Tasks

### Adding a New API Endpoint

1. Create DTO class with validation decorators
2. Add method to service with error handling
3. Add endpoint to controller with proper decorators
4. Write unit tests
5. Update Swagger documentation (if needed)

### Adding a New Database Model

1. Update Prisma schema
2. Create migration: `pnpm db:migrate:create --name migration_name`
3. Run migration: `pnpm db:migrate`
4. Generate Prisma client: `pnpm db:generate`
5. Update types if needed

### Adding a New Web Page

1. Create page component in `app/` directory
2. Add server component for data fetching
3. Add client components for interactivity
4. Add types and validation
5. Add styling with Tailwind CSS

## 🐛 Debugging Tips

1. **Check Logs**: API logs, database logs, OpenSearch logs
2. **Use Debugger**: Set breakpoints, step through code
3. **Check Database**: Use Prisma Studio (`pnpm db:studio`)
4. **Check OpenSearch**: Use curl or OpenSearch Dev Tools
5. **Check Types**: Run `pnpm type-check`
6. **Check Linting**: Run `pnpm lint`

## 📖 Documentation References

- **README.md** - Project overview and setup
- **PROJECT_RULES.md** - Detailed rules and conventions
- **WORKFLOW.md** - Development workflow and processes
- **NestJS Docs** - https://docs.nestjs.com/
- **Next.js Docs** - https://nextjs.org/docs
- **Prisma Docs** - https://www.prisma.io/docs
- **OpenSearch Docs** - https://opensearch.org/docs/

## 🎯 AI Assistant Guidelines

When working on this project, AI assistants should:

1. **Follow Rules**: Always adhere to project rules and conventions
2. **Ask Questions**: Clarify requirements if unclear
3. **Test Code**: Write tests for new features
4. **Document Changes**: Update documentation when needed
5. **Security First**: Never expose secrets or sensitive data
6. **Type Safety**: Always use proper TypeScript types
7. **Error Handling**: Implement proper error handling
8. **Performance**: Consider performance implications
9. **Modularity**: Keep code modular and reusable
10. **Quality**: Maintain code quality standards

## 🔄 Workflow Integration

When making changes:

1. **Plan**: Understand requirements and design solution
2. **Implement**: Write code following project rules
3. **Test**: Write and run tests
4. **Review**: Check code quality and rules compliance
5. **Document**: Update documentation if needed
6. **Commit**: Write clear commit messages

## 📝 Code Review Checklist

Before suggesting code, ensure:

- [ ] Code follows project rules
- [ ] TypeScript types are correct
- [ ] DTOs are used for API endpoints
- [ ] Error handling is implemented
- [ ] Tests are written
- [ ] Security is considered
- [ ] Performance is considered
- [ ] Documentation is updated (if needed)

## 🆘 Getting Help

If stuck or unclear:

1. Check documentation (README.md, PROJECT_RULES.md, WORKFLOW.md)
2. Check existing code for patterns
3. Ask for clarification on requirements
4. Review error messages and logs
5. Check TypeScript types and errors

## 🎓 Learning Resources

- NestJS: https://docs.nestjs.com/
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- TypeScript: https://www.typescriptlang.org/docs/
- OpenSearch: https://opensearch.org/docs/
- Fastify: https://www.fastify.io/

---

**Remember**: Always prioritize security, type safety, test coverage, and code quality. Follow the project rules strictly and maintain consistency with existing code patterns.

