# Development Workflow

This document outlines the development workflow, processes, and best practices for the Music Hub project.

## 🌿 Branch Strategy

### Main Branches

- `main` - Production-ready code
- `develop` - Integration branch for features (if using git-flow)

### Feature Branches

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Branch Naming Convention

```
{type}/{short-description}
```

Examples:
- `feature/artist-search`
- `bugfix/auth-token-expiry`
- `hotfix/database-connection`
- `refactor/api-controllers`
- `docs/api-documentation`

## 🔄 Development Process

### 1. Starting a New Feature

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
pnpm dev
```

### 2. Development Workflow

1. **Plan the Feature**
   - Understand requirements
   - Design the solution
   - Identify affected components
   - Plan database changes (if needed)

2. **Setup Environment**
   - Ensure dependencies are installed
   - Start infrastructure services (Docker)
   - Set up environment variables
   - Run database migrations

3. **Implement the Feature**
   - Write code following project rules
   - Write tests as you go
   - Test locally
   - Check type safety
   - Run linter

4. **Test the Feature**
   - Run unit tests
   - Run integration tests (if applicable)
   - Test manually
   - Check edge cases
   - Verify error handling

5. **Code Quality Checks**
   ```bash
   # Lint code
   pnpm lint
   
   # Type check
   pnpm type-check
   
   # Run tests
   pnpm test
   
   # Format code
   pnpm format
   ```

6. **Commit Changes**
   - Write clear commit messages
   - Make small, focused commits
   - Reference issues/tickets if applicable

### 3. Commit Message Convention

Use conventional commits format:

```
{type}({scope}): {description}

{body}

{footer}
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance tasks

Examples:
```
feat(api): add artist search endpoint

Implement search functionality with OpenSearch integration.
Add DTOs for search request/response.
Add tests for search service.

Closes #123
```

```
fix(web): resolve artist card layout issue

Fix responsive layout for artist cards on mobile devices.
Update Tailwind classes for better mobile support.

Fixes #456
```

### 4. Pre-Commit Checklist

Before committing, ensure:

- [ ] Code follows project rules
- [ ] Tests are written and passing
- [ ] TypeScript types are correct
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No console.log statements
- [ ] No secrets or sensitive data
- [ ] Error handling is implemented
- [ ] Documentation is updated (if needed)

### 5. Pull Request Process

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use clear title and description
   - Reference related issues
   - Add screenshots (if UI changes)
   - Fill out PR template

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing performed
   
   ## Checklist
   - [ ] Code follows project rules
   - [ ] Tests are passing
   - [ ] Type checking passes
   - [ ] Linting passes
   - [ ] Documentation updated
   - [ ] No secrets exposed
   ```

4. **Code Review**
   - Address review comments
   - Make requested changes
   - Update PR if needed
   - Respond to reviewers

5. **Merge**
   - Squash and merge (preferred)
   - Delete feature branch after merge
   - Update main branch locally

## 🧪 Testing Workflow

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run tests for specific file
pnpm test artist.service.spec.ts
```

### Integration Tests

```bash
# Run integration tests
pnpm test:e2e
```

### Test-Driven Development (TDD)

1. Write test first
2. Run test (should fail)
3. Write implementation
4. Run test (should pass)
5. Refactor if needed

### Testing Checklist

- [ ] All services have unit tests
- [ ] All controllers have unit tests
- [ ] Edge cases are tested
- [ ] Error scenarios are tested
- [ ] Integration tests for API endpoints
- [ ] Test coverage meets requirements

## 🗄️ Database Workflow

### Schema Changes

1. **Update Schema**
   ```bash
   cd packages/db
   # Edit prisma/schema.prisma
   ```

2. **Create Migration**
   ```bash
   pnpm db:migrate:create --name migration_name
   ```

3. **Review Migration**
   - Check generated SQL
   - Ensure no data loss
   - Test migration locally

4. **Apply Migration**
   ```bash
   pnpm db:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   pnpm db:generate
   ```

### Database Seeding

```bash
# Seed development database
pnpm db:seed

# Seed with specific data
pnpm db:seed --seed-file custom-seed.ts
```

## 🔍 Search (OpenSearch) Workflow

### Indexing New Data

1. **Update Indexer**
   - Update mappings if schema changes
   - Update indexing logic if needed

2. **Test Indexing**
   ```bash
   cd apps/indexer
   pnpm dev
   ```

3. **Run Backfill**
   ```bash
   pnpm backfill --index tracks --batch-size 100
   ```

### Search Testing

1. Test search queries
2. Verify relevance scoring
3. Test pagination
4. Test error handling
5. Test fallback to database

## 🚀 Deployment Workflow

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations prepared
- [ ] OpenSearch indices updated
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Security reviewed

### Deployment Steps

1. **Build Application**
   ```bash
   pnpm build
   ```

2. **Run Migrations**
   ```bash
   pnpm db:migrate
   ```

3. **Seed Data (if needed)**
   ```bash
   pnpm db:seed
   ```

4. **Index Data**
   ```bash
   pnpm backfill
   ```

5. **Deploy Application**
   - Deploy API
   - Deploy Web
   - Deploy Indexer (if needed)

6. **Verify Deployment**
   - Check health endpoints
   - Test critical features
   - Monitor logs
   - Check error rates

### Rollback Procedure

1. Identify issue
2. Rollback to previous version
3. Rollback database migrations (if needed)
4. Verify rollback
5. Investigate issue
6. Fix issue
7. Redeploy

## 🐛 Debugging Workflow

### Local Debugging

1. **Check Logs**
   - API logs
   - Database logs
   - OpenSearch logs

2. **Use Debugger**
   - Set breakpoints
   - Step through code
   - Inspect variables

3. **Check Database**
   ```bash
   pnpm db:studio
   ```

4. **Check OpenSearch**
   ```bash
   curl http://localhost:9200/_cat/indices?v
   ```

### Production Debugging

1. **Check Logs**
   - Application logs
   - Error logs
   - Performance logs

2. **Check Metrics**
   - Response times
   - Error rates
   - Database queries
   - OpenSearch queries

3. **Reproduce Issue**
   - Reproduce locally
   - Identify root cause
   - Fix issue
   - Test fix

## 📊 Monitoring Workflow

### Application Monitoring

- Monitor API response times
- Monitor error rates
- Monitor database performance
- Monitor OpenSearch performance
- Monitor resource usage

### Alerting

- Set up alerts for errors
- Set up alerts for performance issues
- Set up alerts for resource usage
- Set up alerts for security issues

## 🔄 Maintenance Workflow

### Regular Maintenance

1. **Update Dependencies**
   ```bash
   pnpm update
   pnpm audit
   ```

2. **Update Database**
   - Review and optimize queries
   - Update indexes if needed
   - Clean up old data

3. **Update Documentation**
   - Update API documentation
   - Update README
   - Update project rules

4. **Code Cleanup**
   - Remove unused code
   - Refactor complex code
   - Improve test coverage

### Weekly Tasks

- Review pull requests
- Update dependencies
- Review and optimize database queries
- Review and update documentation
- Code review and refactoring

### Monthly Tasks

- Security audit
- Performance optimization
- Dependency updates
- Documentation updates
- Team retrospective

## 📚 Documentation Workflow

### Code Documentation

- Document complex logic
- Document public APIs
- Update JSDoc comments
- Update TypeScript types

### API Documentation

- Update Swagger documentation
- Document new endpoints
- Document request/response formats
- Document error codes

### Project Documentation

- Update README
- Update project rules
- Update workflow documentation
- Update setup instructions

## 🆘 Troubleshooting Workflow

### Common Issues

1. **Database Connection Issues**
   - Check Docker containers
   - Check environment variables
   - Check database logs

2. **OpenSearch Issues**
   - Check OpenSearch status
   - Check indices
   - Check mappings

3. **Build Issues**
   - Clear node_modules
   - Clear build cache
   - Reinstall dependencies

4. **Test Issues**
   - Check test database
   - Check test data
   - Check test configuration

### Getting Help

1. Check documentation
2. Check existing issues
3. Ask team members
4. Create issue with details
5. Provide logs and error messages

## ✅ Quality Assurance

### Code Quality

- Follow project rules
- Write clean code
- Write tests
- Document code
- Review code

### Performance

- Optimize queries
- Use caching
- Optimize bundle size
- Monitor performance
- Profile code

### Security

- Validate inputs
- Sanitize data
- Use parameterized queries
- Handle errors properly
- Keep dependencies updated

## 🎯 Best Practices

1. **Small, Focused Commits** - Make small, focused commits with clear messages
2. **Test First** - Write tests before implementation (TDD)
3. **Code Review** - Always get code reviewed before merging
4. **Documentation** - Keep documentation up to date
5. **Security** - Always consider security implications
6. **Performance** - Always consider performance implications
7. **Error Handling** - Handle errors gracefully
8. **Logging** - Use proper logging (not console.log)
9. **Type Safety** - Use TypeScript types properly
10. **Modularity** - Keep code modular and reusable

## 📖 References

- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Deployment Best Practices](https://12factor.net/)

