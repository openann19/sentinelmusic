import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OpenSearchService } from './opensearch.service';

/**
 * Service for search-related operations
 * Provides search functionality for artists and tracks with OpenSearch fallback
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openSearchService: OpenSearchService,
  ) {}

  /**
   * Searches for artists by name
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Array of artists matching the query
   */
  async searchArtists(query: string, limit: number = 10) {
    return this.prisma.client.artist.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Searches for tracks using OpenSearch if available, falls back to database search
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Array of tracks matching the query
   */
  async searchTracks(query: string, limit: number = 25) {
    try {
      let trackIds: bigint[] = [];
      let openSearchHadResults = false;

      if (this.openSearchService.isAvailable()) {
        try {
          trackIds = await this.openSearchService.searchTracks(query, limit);
          openSearchHadResults = trackIds.length > 0;
        } catch (error) {
          this.logger.warn(
            'OpenSearch query failed, falling back to database search',
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      // If OpenSearch returned zero hits, fallback to database search
      if (this.openSearchService.isAvailable() && !openSearchHadResults) {
        this.logger.debug(
          'OpenSearch returned zero hits, falling back to database search',
        );
        return this.prisma.client.track.findMany({
          where: { title: { contains: query, mode: 'insensitive' } },
          take: limit,
          include: {
            release: { include: { artist: true } },
            links: {
              include: { source: true },
            },
          },
        });
      }

      if (trackIds.length > 0) {
        return this.prisma.client.track.findMany({
          where: { id: { in: trackIds } },
          take: limit,
          include: {
            release: { include: { artist: true } },
            links: {
              include: { source: true },
            },
          },
        });
      }

      return this.prisma.client.track.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: limit,
        include: {
          release: { include: { artist: true } },
          links: {
            include: { source: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(
        'Search failed, using database fallback',
        error instanceof Error ? error.stack : String(error),
      );

      return this.prisma.client.track.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: limit,
        include: {
          release: { include: { artist: true } },
          links: {
            include: { source: true },
          },
        },
      });
    }
  }

  /**
   * Searches for both artists and tracks
   * @param query - Search query string
   * @returns Object containing arrays of artists and tracks
   */
  async search(query: string) {
    const [artists, tracks] = await Promise.all([
      this.searchArtists(query, 10),
      this.searchTracks(query, 25),
    ]);

    return { artists, tracks };
  }
}

