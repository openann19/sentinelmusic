import 'dotenv/config';
import { Client } from '@opensearch-project/opensearch';
import prisma from '@music-hub/db';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple logger for the indexer script
 */
class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  log(message: string): void {
    process.stdout.write(`[${this.prefix}] ${message}\n`);
  }

  error(message: string, error?: unknown): void {
    process.stderr.write(`[${this.prefix}] ERROR: ${message}\n`);
    if (error) {
      process.stderr.write(
        error instanceof Error ? error.stack || error.message : String(error),
      );
      process.stderr.write('\n');
    }
  }
}

const logger = new Logger('Backfill');
const os = new Client({
  node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin',
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Ensures the OpenSearch tracks index exists with proper mappings
 */
async function ensureIndex(): Promise<void> {
  try {
    const exists = await os.indices.exists({ index: 'tracks' });
    if (!exists.body) {
      const mappingsPath = path.resolve(__dirname, '../mappings/tracks.json');
      const mappings = JSON.parse(
        fs.readFileSync(mappingsPath, 'utf-8'),
      );
      await os.indices.create({ index: 'tracks', body: mappings });
      logger.log('Created OpenSearch index: tracks');
    } else {
      logger.log('OpenSearch index already exists: tracks');
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; meta?: { statusCode?: number } };
    // Index might not exist (404), try to create it
    if (err?.statusCode === 404 || err?.meta?.statusCode === 404) {
      try {
        const mappingsPath = path.resolve(__dirname, '../mappings/tracks.json');
        const mappings = JSON.parse(
          fs.readFileSync(mappingsPath, 'utf-8'),
        );
        await os.indices.create({ index: 'tracks', body: mappings });
        logger.log('Created OpenSearch index: tracks');
      } catch (createError) {
        throw new Error(`Failed to create index: ${String(createError)}`);
      }
    } else {
      throw error;
    }
  }
}

/**
 * Backfills tracks from database to OpenSearch in batches
 */
async function run(): Promise<void> {
  await ensureIndex();
  const batch = 500;
  let cursor: bigint | null = null;
  let totalIndexed = 0;

  while (true) {
    const rows: Array<{
      id: bigint;
      title: string;
      releaseId: bigint;
      bpm: number | null;
      keyText: string | null;
      isrc: string | null;
      release: { artist: { name: string } };
    }> = await prisma.track.findMany({
      where: cursor ? { id: { gt: cursor } } : {},
      take: batch,
      orderBy: { id: 'asc' },
      include: { release: { include: { artist: true } } },
    });
    
    if (!rows.length) {
      break;
    }

    const body: Array<Record<string, unknown>> = [];
    for (const t of rows) {
      body.push({ index: { _index: 'tracks', _id: Number(t.id) } });
      body.push({
        id: Number(t.id),
        title: t.title,
        artist: t.release.artist.name,
        releaseId: Number(t.releaseId),
        bpm: t.bpm ?? null,
        keyText: t.keyText ?? null,
        isrc: t.isrc ?? null,
      });
    }
    
    await os.bulk({ refresh: true, body });
    totalIndexed += rows.length;
    cursor = rows[rows.length - 1].id;
    logger.log(`Indexed ${totalIndexed} tracks...`);
  }

  logger.log(`Backfill completed successfully. Total indexed: ${totalIndexed}`);
}

run()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    logger.error('Backfill failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });

