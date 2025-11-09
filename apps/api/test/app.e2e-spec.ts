import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  cleanupDatabase,
  seedTestData,
  createAdminUser,
  prisma,
} from './helpers/test-db.helper';
import { generateTestToken, getAuthHeaders } from './helpers/test-auth.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let testUser: { id: bigint; email: string; password: string; role: string };
  let testArtist: { id: bigint; name: string };
  let adminUser: { id: bigint; email: string; password: string; role: string };

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    await cleanupDatabase();
    const seedData = await seedTestData();
    testUser = seedData.testUser;
    testArtist = seedData.testArtist;
    adminUser = await createAdminUser();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Artist Endpoints', () => {
    it('/api/v1/artists/:id (GET) should return artist when found', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/artists/${testArtist.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body.name).toBe(testArtist.name);
        });
    });

    it('/api/v1/artists/:id (GET) should return 404 when artist not found', () => {
      return request(app.getHttpServer())
        .get('/api/v1/artists/999999')
        .expect(404);
    });

    it('/api/v1/artists/:id (GET) should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/artists/invalid')
        .expect(400);
    });
  });

  describe('Search Endpoints', () => {
    it('/api/v1/search?q=query (GET) should return search results', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('artists');
          expect(res.body).toHaveProperty('tracks');
          expect(Array.isArray(res.body.artists)).toBe(true);
          expect(Array.isArray(res.body.tracks)).toBe(true);
        });
    });

    it('/api/v1/search?q=query (GET) should return 400 for query too short', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'a' })
        .expect(400);
    });

    it('/api/v1/search?q=query (GET) should return 400 for missing query', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search')
        .expect(400);
    });
  });

  describe('Auth Endpoints', () => {
    it('/api/v1/auth/login (POST) should return token on valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('/api/v1/auth/login (POST) should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/api/v1/auth/login (POST) should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('/api/v1/auth/admin (POST) should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/admin')
        .expect(401);
    });

    it('/api/v1/auth/admin (POST) should return 200 with valid admin token', async () => {
      const token = generateTestToken(adminUser.id, 'ADMIN');
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/admin')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Admin access granted');
    });
  });

  describe('Admin Endpoints', () => {
    it('/api/v1/admin/ping (GET) should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/ping')
        .expect(401);
    });

    it('/api/v1/admin/ping (GET) should return 401 with non-admin token', async () => {
      const token = generateTestToken(testUser.id, 'BASIC');
      return request(app.getHttpServer())
        .get('/api/v1/admin/ping')
        .set(getAuthHeaders(token))
        .expect(401);
    });

    it('/api/v1/admin/ping (GET) should return 200 with valid admin token', async () => {
      const token = generateTestToken(adminUser.id, 'ADMIN');
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/ping')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body).toHaveProperty('ok');
      expect(response.body.ok).toBe(true);
    });
  });
});

