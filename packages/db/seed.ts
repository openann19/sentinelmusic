import prisma from './src/index';
import bcrypt from 'bcrypt';

/**
 * Simple logger for seed script
 */
class Logger {
  log(message: string): void {
    process.stdout.write(`[SEED] ${message}\n`);
  }

  error(message: string, error?: unknown): void {
    process.stderr.write(`[SEED] ERROR: ${message}\n`);
    if (error) {
      process.stderr.write(
        error instanceof Error ? error.stack || error.message : String(error),
      );
      process.stderr.write('\n');
    }
  }
}

const logger = new Logger();

/**
 * Seed script to populate the database with initial data
 * Creates an admin user, sample artist, release, and tracks
 */
async function main(): Promise<void> {
  logger.log('Starting database seed...');

  // Create admin user
  logger.log('Creating admin user...');
  const adminPwd = await bcrypt.hash('Admin_12345', 12);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPwd,
      role: 'ADMIN',
    },
  });
  logger.log('Admin user created');

  // Create sample artist
  logger.log('Creating sample artist...');
  const tiesto = await prisma.artist.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      name: 'Tiësto',
      sortName: 'Tiesto',
      country: 'NL',
    },
  }).catch(async () => {
    // If upsert by id fails, try to find or create by name
    const existing = await prisma.artist.findFirst({
      where: { name: 'Tiësto' },
    });
    if (existing) return existing;
    return prisma.artist.create({
      data: {
        name: 'Tiësto',
        sortName: 'Tiesto',
        country: 'NL',
      },
    });
  });
  logger.log(`Artist created: ${tiesto.name} (ID: ${tiesto.id})`);

  // Create sample label
  logger.log('Creating sample label...');
  const label = await prisma.label.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      name: 'Musical Freedom',
      country: 'NL',
    },
  }).catch(async () => {
    const existing = await prisma.label.findFirst({
      where: { name: 'Musical Freedom' },
    });
    if (existing) return existing;
    return prisma.label.create({
      data: {
        name: 'Musical Freedom',
        country: 'NL',
      },
    });
  });
  logger.log(`Label created: ${label.name} (ID: ${label.id})`);

  // Create sample release
  logger.log('Creating sample release...');
  const release = await prisma.release.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      artistId: tiesto.id,
      labelId: label.id,
      title: 'Test EP',
      releaseType: 'ep',
      releaseDate: new Date('2024-01-01'),
    },
  }).catch(async () => {
    const existing = await prisma.release.findFirst({
      where: { title: 'Test EP', artistId: tiesto.id },
    });
    if (existing) return existing;
    return prisma.release.create({
      data: {
        artistId: tiesto.id,
        labelId: label.id,
        title: 'Test EP',
        releaseType: 'ep',
        releaseDate: new Date('2024-01-01'),
      },
    });
  });
  logger.log(`Release created: ${release.title} (ID: ${release.id})`);

  // Create sample tracks
  logger.log('Creating sample tracks...');
  await prisma.track.createMany({
    skipDuplicates: true,
    data: [
      {
        releaseId: release.id,
        title: 'Track One',
        durationSeconds: 302,
        bpm: 128,
        keyText: '8A',
      },
      {
        releaseId: release.id,
        title: 'Track Two',
        durationSeconds: 315,
        bpm: 126,
        keyText: '9A',
      },
    ],
  });
  logger.log('Tracks created');

  // Create sample sources
  logger.log('Creating sample sources...');
  const spotify = await prisma.source.upsert({
    where: { name: 'spotify' },
    update: {},
    create: {
      name: 'spotify',
      tosUrl: 'https://www.spotify.com/legal/terms-of-use/',
    },
  });

  const appleMusic = await prisma.source.upsert({
    where: { name: 'apple-music' },
    update: {},
    create: {
      name: 'apple-music',
      tosUrl: 'https://www.apple.com/legal/internet-services/itunes/',
    },
  });
  logger.log('Sources created');

  // Create sample track links
  logger.log('Creating sample track links...');
  const tracks = await prisma.track.findMany({
    where: { releaseId: release.id },
  });

  for (const track of tracks) {
    // Spotify link
    await prisma.sourceLink.upsert({
      where: {
        sourceId_entityType_externalId: {
          sourceId: spotify.id,
          entityType: 'track',
          externalId: `spotify-${track.id}`,
        },
      },
      update: {},
      create: {
        sourceId: spotify.id,
        entityType: 'track',
        trackId: track.id,
        externalId: `spotify-${track.id}`,
        url: `https://open.spotify.com/track/${track.id}`,
      },
    }).catch(() => {
      // Ignore duplicate errors
    });

    // Apple Music link
    await prisma.sourceLink.upsert({
      where: {
        sourceId_entityType_externalId: {
          sourceId: appleMusic.id,
          entityType: 'track',
          externalId: `apple-${track.id}`,
        },
      },
      update: {},
      create: {
        sourceId: appleMusic.id,
        entityType: 'track',
        trackId: track.id,
        externalId: `apple-${track.id}`,
        url: `https://music.apple.com/track/${track.id}`,
      },
    }).catch(() => {
      // Ignore duplicate errors
    });
  }
  logger.log('Track links created');

  logger.log('Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    logger.error('Seed failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });
