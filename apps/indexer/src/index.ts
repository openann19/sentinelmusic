import { Client } from '@opensearch-project/opensearch';
import { config } from 'dotenv';

config();

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

const logger = new Logger('Indexer');

const client = new Client({
  node: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin',
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main(): Promise<void> {
  try {
    const health = await client.cluster.health();
    logger.log(`OpenSearch cluster health: ${JSON.stringify(health.body)}`);
  } catch (error) {
    logger.error('Error connecting to OpenSearch', error);
    process.exit(1);
  }
}

main();

