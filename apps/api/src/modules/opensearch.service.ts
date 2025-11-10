import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

/**
 * OpenSearch service for search functionality
 * Provides methods to search tracks and check availability
 */
@Injectable()
export class OpenSearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OpenSearchService.name);
  private client: Client | undefined;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initializes the OpenSearch client on module initialization
   * Tests connection and logs status
   */
  async onModuleInit(): Promise<void> {
    const node =
      this.configService.get<string>('OPENSEARCH_URL') ||
      this.configService.get<string>('OPENSEARCH_NODE', 'http://localhost:9200');

    const username = this.configService.get<string>('OPENSEARCH_USERNAME');
    const password = this.configService.get<string>('OPENSEARCH_PASSWORD');

    if (!node) {
      this.logger.warn('OPENSEARCH_URL not configured, search functionality will be limited');
      return;
    }

    try {
      this.client = new Client({
        node,
        ...(username &&
          password && {
            auth: {
              username,
              password,
            },
          }),
        ssl: {
          rejectUnauthorized: false,
        },
      });

      // Test connection
      await this.client.ping();
      this.logger.log(`OpenSearch client initialized for node: ${node}`);
    } catch (error) {
      this.logger.warn(
        'OpenSearch client initialization failed, search will use database fallback',
        error instanceof Error ? error.stack : String(error)
      );
      this.client = undefined;
    }
  }

  /**
   * Closes the OpenSearch client on module destruction
   */
  onModuleDestroy(): void {
    if (this.client) {
      this.client.close();
    }
  }

  /**
   * Gets the OpenSearch client instance
   * @returns OpenSearch client
   * @throws Error if client is not initialized
   */
  getClient(): Client {
    if (!this.client) {
      throw new Error('OpenSearch client not initialized');
    }
    return this.client;
  }

  /**
   * Searches for tracks in OpenSearch
   * @param query - Search query string
   * @param size - Maximum number of results to return
   * @returns Array of track IDs matching the query
   * @throws Error if OpenSearch is not available or search fails
   */
  async searchTracks(query: string, size: number = 25): Promise<bigint[]> {
    if (!this.client) {
      throw new Error('OpenSearch client not initialized');
    }

    try {
      const response = await this.client.search({
        index: 'tracks',
        body: {
          query: {
            multi_match: {
              query,
              fields: ['title^2', 'artist'],
              fuzziness: 'AUTO',
            },
          },
          size,
        },
      });

      const hits = response.body.hits?.hits || [];
      return hits.map((hit: { _id: string | number }) => BigInt(hit._id));
    } catch (error) {
      this.logger.error(
        'OpenSearch query failed',
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Checks if OpenSearch is available and initialized
   * @returns true if OpenSearch is available, false otherwise
   */
  isAvailable(): boolean {
    return this.client !== undefined;
  }
}
