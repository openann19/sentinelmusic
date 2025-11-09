import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const TEST_PASSWORD = 'password123';

export async function cleanupDatabase(): Promise<void> {
  await prisma.userFollowArtist.deleteMany();
  await prisma.sourceLink.deleteMany();
  await prisma.track.deleteMany();
  await prisma.release.deleteMany();
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();
  await prisma.royaltySplit.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.label.deleteMany();
  await prisma.source.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedTestData(): Promise<{
  testUser: { id: bigint; email: string; password: string; role: string };
  testArtist: { id: bigint; name: string };
}> {
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      role: 'BASIC',
    },
  });

  const testArtist = await prisma.artist.create({
    data: {
      name: 'Test Artist',
      sortName: 'Artist, Test',
      country: 'US',
    },
  });

  return {
    testUser: {
      id: testUser.id,
      email: testUser.email,
      password: TEST_PASSWORD,
      role: testUser.role,
    },
    testArtist: {
      id: testArtist.id,
      name: testArtist.name,
    },
  };
}

export async function createAdminUser(): Promise<{
  id: bigint;
  email: string;
  password: string;
  role: string;
}> {
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  return {
    id: adminUser.id,
    email: adminUser.email,
    password: TEST_PASSWORD,
    role: adminUser.role,
  };
}

export { prisma };

