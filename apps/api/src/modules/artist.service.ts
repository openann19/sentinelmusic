import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EntityNotFoundException } from '../common/exceptions/not-found.exception';

/**
 * Service for artist-related operations
 */
@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds an artist by ID with releases, tracks, and links
   * @param id - Artist ID
   * @returns Artist data with related releases, tracks, and links
   * @throws EntityNotFoundException if artist is not found
   */
  async findById(id: bigint) {
    const artist = await this.prisma.client.artist.findUnique({
      where: { id },
      include: {
        releases: {
          include: {
            tracks: {
              include: { links: { include: { source: true } } },
            },
            links: {
              include: { source: true },
            },
          },
        },
      },
    });

    if (!artist) {
      throw new EntityNotFoundException('Artist', id.toString());
    }

    return artist;
  }

  /**
   * Searches for artists by name
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Array of artists matching the query
   */
  async searchByName(query: string, limit: number = 10) {
    return this.prisma.client.artist.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }
}
