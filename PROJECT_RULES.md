# Project Rules & Conventions

This document defines the coding standards, best practices, and rules that must be followed when working on the Music Hub project.

## 🎯 General Principles

1. **Type Safety First** - Always use TypeScript strict mode. Avoid `any` type.
2. **Security First** - Never expose secrets, validate all inputs, sanitize data.
3. **Test Coverage** - Write tests for all business logic. Maintain minimum coverage thresholds.
4. **Modularity** - Keep files small, focused, and reusable. Use hooks and composable patterns.
5. **Performance** - Optimize for performance. Use code splitting, lazy loading, and efficient queries.
6. **Documentation** - Document complex logic and public APIs.

## 🏗️ NestJS API Rules

### Module Structure

- All modules, services, controllers, and providers **must** be defined using TypeScript decorators:
  - `@Module()` for modules
  - `@Injectable()` for services
  - `@Controller()` for controllers
  - `@Provider()` for providers (if needed)

### Dependency Injection

- Each NestJS service **must** use explicit dependency injection in the constructor
- Avoid using the `any` type
- Use interfaces for dependencies when possible
- Example:

```typescript
@Injectable()
export class ArtistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
}
```

### Circular Dependencies

- Circular dependencies **must** be identified and refactored
- Use forward references (`forwardRef()`) when necessary
- Prefer architectural changes over forward references when possible

### DTOs and Validation

- All public endpoints in controllers **must** define DTO classes for request validation
- DTOs **must** use `class-validator` decorators for every property
- DTOs **must** use `class-transformer` for transformation when needed
- Example:

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

### Exception Handling

- Exception handling **must** be centralized using global filters
- Custom exceptions should extend `HttpException`
- Never expose sensitive data in error messages
- Use appropriate HTTP status codes
- Example:

```typescript
export class NotFoundException extends HttpException {
  constructor(resource: string) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND);
  }
}
```

### Environment Variables

- The `ConfigService` **must** be used for environment variables
- Never use `process.env` directly outside configuration files
- Define environment variable schemas using `@nestjs/config`
- Example:

```typescript
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

### Asynchronous Code

- Asynchronous code **must** use `async/await` syntax
- Return Promises where appropriate
- Avoid `.then/.catch` chains
- Handle errors properly with try-catch blocks
- Example:

```typescript
async getArtist(id: string): Promise<Artist> {
  try {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });
    if (!artist) {
      throw new NotFoundException('Artist');
    }
    return artist;
  } catch (error) {
    throw new InternalServerErrorException('Failed to fetch artist');
  }
}
```

### Testing

- Unit tests **must** be written for services and controllers using Jest
- Test coverage **must** be reviewed before merging to main
- Minimum coverage requirements:
  - Services: 80%
  - Controllers: 70%
  - Critical business logic: 100%
- Use mocking for external dependencies
- Example:

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Security

- Sensitive data and secrets **must never** be logged or exposed through exceptions or responses
- Use parameterized queries (Prisma handles this automatically)
- Sanitize user inputs
- Implement rate limiting
- Use helmet for security headers
- Validate all inputs

### Routing

- All routes **must** be versioned and RESTful
- Query and path parameters **must** be type-validated
- Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Example:

```typescript
@Controller('api/v1/artists')
export class ArtistController {
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    // ...
  }

  @Post()
  async create(@Body() createArtistDto: CreateArtistDto) {
    // ...
  }
}
```

## 🎨 Next.js Web Rules

### Component Structure

- Use functional components with TypeScript
- Prefer server components when possible
- Use client components only when necessary (interactivity, hooks, browser APIs)
- Keep components small and focused
- Use custom hooks for reusable logic

### File Organization

- Use the App Router structure (`app/` directory)
- Group related files in feature folders
- Use colocation for components, hooks, and utilities
- Example:

```
app/
  artists/
    page.tsx
    components/
      ArtistList.tsx
      ArtistCard.tsx
    hooks/
      useArtists.ts
```

### State Management

- Use React hooks for local state
- Use server components for server-side data fetching
- Use React Query or SWR for client-side data fetching
- Avoid prop drilling; use context when needed

### Styling

- Use Tailwind CSS for styling
- Use shared UI components from `packages/ui`
- Follow mobile-first responsive design
- Use semantic HTML elements

### Type Safety

- Define TypeScript types for all props
- Use Zod for runtime validation when needed
- Share types from `packages/types` when possible

## 🗄️ Database Rules

### Prisma

- Always use Prisma Client for database access
- Never write raw SQL queries unless absolutely necessary
- Use transactions for multi-step operations
- Handle database errors gracefully
- Use appropriate indexes for performance

### Migrations

- Always create migrations for schema changes
- Never edit existing migrations
- Test migrations on development before applying to production
- Use descriptive migration names

### Schema Design

- Use appropriate data types
- Add indexes for frequently queried fields
- Use relations properly (one-to-one, one-to-many, many-to-many)
- Add timestamps (`createdAt`, `updatedAt`) to all models

## 🔍 Search (OpenSearch) Rules

### Indexing

- Index data asynchronously when possible
- Use batch operations for bulk indexing
- Handle indexing errors gracefully
- Implement retry logic for failed operations

### Search Queries

- Use appropriate query types (match, multi_match, term, etc.)
- Implement pagination for search results
- Use relevance scoring appropriately
- Provide fallback to database search if OpenSearch is unavailable

## 📦 Package Rules

### Shared Packages

- Keep shared packages focused and reusable
- Export only public APIs
- Use proper TypeScript exports
- Document public APIs

### Dependencies

- Use workspace dependencies for internal packages
- Keep dependencies up to date
- Avoid duplicate dependencies
- Use exact versions for critical dependencies

## 🧪 Testing Rules

### Unit Tests

- Write unit tests for all services
- Mock external dependencies
- Test edge cases and error scenarios
- Keep tests isolated and independent

### Integration Tests

- Write integration tests for API endpoints
- Use test databases
- Clean up test data after tests
- Test authentication and authorization

### E2E Tests

- Write E2E tests for critical user flows
- Use realistic test data
- Test error scenarios
- Keep E2E tests fast and reliable

## 📝 Code Style Rules

### TypeScript

- Use strict mode
- Avoid `any` type
- Use interfaces for object types
- Use type aliases for complex types
- Use enums for constants

### Naming Conventions

- Use PascalCase for classes, interfaces, types, and components
- Use camelCase for variables, functions, and methods
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names (except components)
- Use descriptive names

### File Organization

- One class/component per file
- Export from index files for packages
- Use barrel exports when appropriate
- Group related files in folders

### Comments

- Write self-documenting code
- Comment complex logic
- Document public APIs
- Keep comments up to date

## 🚫 What NOT to Do

1. **Never** use `console.log` in production code (use proper logging)
2. **Never** commit secrets or API keys
3. **Never** use `any` type without justification
4. **Never** ignore TypeScript errors
5. **Never** skip tests for new features
6. **Never** expose sensitive data in error messages
7. **Never** use `process.env` directly (use ConfigService)
8. **Never** write raw SQL queries (use Prisma)
9. **Never** ignore linting errors
10. **Never** commit code that doesn't pass type checking

## ✅ Code Review Checklist

Before submitting a pull request, ensure:

- [ ] Code follows all project rules
- [ ] Tests are written and passing
- [ ] TypeScript types are properly defined
- [ ] DTOs are used for all API endpoints
- [ ] Error handling is implemented
- [ ] Security best practices are followed
- [ ] Performance is considered
- [ ] Documentation is updated (if needed)
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No secrets or sensitive data are exposed
- [ ] Code is modular and reusable

## 🔄 Continuous Improvement

- Regularly review and update these rules
- Discuss rule changes with the team
- Document exceptions and their reasons
- Learn from code review feedback
- Stay updated with best practices

## 📚 References

- [NestJS Best Practices](https://docs.nestjs.com/)
- [Next.js Best Practices](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [React Best Practices](https://react.dev/)

