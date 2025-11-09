import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from './prisma.service';
import { OpenSearchService } from './opensearch.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrismaClient = {
    artist: {
      findMany: jest.fn(),
    },
    track: {
      findMany: jest.fn(),
    },
  };

  const mockOpenSearchService = {
    isAvailable: jest.fn(),
    searchTracks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: {
            client: mockPrismaClient,
          },
        },
        {
          provide: OpenSearchService,
          useValue: mockOpenSearchService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);

    jest.clearAllMocks();
  });

  describe('searchArtists', () => {
    it('should return artists matching the query', async () => {
      const query = 'test';
      const mockArtists = [
        {
          id: BigInt(1),
          name: 'Test Artist',
          sortName: 'Artist, Test',
          country: 'US',
        },
      ];

      mockPrismaClient.artist.findMany.mockResolvedValue(mockArtists);

      const result = await service.searchArtists(query);

      expect(result).toEqual(mockArtists);
      expect(mockPrismaClient.artist.findMany).toHaveBeenCalledWith({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 10,
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no artists match', async () => {
      const query = 'nonexistent';

      mockPrismaClient.artist.findMany.mockResolvedValue([]);

      const result = await service.searchArtists(query);

      expect(result).toEqual([]);
    });

    it('should respect the limit parameter', async () => {
      const query = 'test';
      const limit = 5;

      mockPrismaClient.artist.findMany.mockResolvedValue([]);

      await service.searchArtists(query, limit);

      expect(mockPrismaClient.artist.findMany).toHaveBeenCalledWith({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: limit,
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('searchTracks', () => {
    it('should use OpenSearch when available and return results', async () => {
      const query = 'test track';
      const limit = 25;
      const trackIds = [BigInt(1), BigInt(2)];
      const mockTracks = [
        {
          id: BigInt(1),
          title: 'Test Track 1',
          release: { artist: { name: 'Test Artist' } },
          links: [],
        },
        {
          id: BigInt(2),
          title: 'Test Track 2',
          release: { artist: { name: 'Test Artist' } },
          links: [],
        },
      ];

      mockOpenSearchService.isAvailable.mockReturnValue(true);
      mockOpenSearchService.searchTracks.mockResolvedValue(trackIds);
      mockPrismaClient.track.findMany.mockResolvedValue(mockTracks);

      const result = await service.searchTracks(query, limit);

      expect(result).toEqual(mockTracks);
      expect(mockOpenSearchService.searchTracks).toHaveBeenCalledWith(query, limit);
      expect(mockPrismaClient.track.findMany).toHaveBeenCalledWith({
        where: { id: { in: trackIds } },
        take: limit,
        include: {
          release: { include: { artist: true } },
          links: {
            include: { source: true },
          },
        },
      });
    });

    it('should fallback to database when OpenSearch is unavailable', async () => {
      const query = 'test track';
      const limit = 25;
      const mockTracks = [
        {
          id: BigInt(1),
          title: 'Test Track 1',
          release: { artist: { name: 'Test Artist' } },
          links: [],
        },
      ];

      mockOpenSearchService.isAvailable.mockReturnValue(false);
      mockPrismaClient.track.findMany.mockResolvedValue(mockTracks);

      const result = await service.searchTracks(query, limit);

      expect(result).toEqual(mockTracks);
      expect(mockOpenSearchService.searchTracks).not.toHaveBeenCalled();
      expect(mockPrismaClient.track.findMany).toHaveBeenCalledWith({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: limit,
        include: {
          release: { include: { artist: true } },
          links: {
            include: { source: true },
          },
        },
      });
    });

    it('should fallback to database when OpenSearch returns zero hits', async () => {
      const query = 'test track';
      const limit = 25;
      const mockTracks = [
        {
          id: BigInt(1),
          title: 'Test Track 1',
          release: { artist: { name: 'Test Artist' } },
          links: [],
        },
      ];

      mockOpenSearchService.isAvailable.mockReturnValue(true);
      mockOpenSearchService.searchTracks.mockResolvedValue([]);
      mockPrismaClient.track.findMany.mockResolvedValue(mockTracks);

      const result = await service.searchTracks(query, limit);

      expect(result).toEqual(mockTracks);
      expect(mockOpenSearchService.searchTracks).toHaveBeenCalled();
      expect(mockPrismaClient.track.findMany).toHaveBeenCalledWith({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: limit,
        include: {
          release: { include: { artist: true } },
          links: {
            include: { source: true },
          },
        },
      });
    });

    it('should fallback to database when OpenSearch throws an error', async () => {
      const query = 'test track';
      const limit = 25;
      const mockTracks = [
        {
          id: BigInt(1),
          title: 'Test Track 1',
          release: { artist: { name: 'Test Artist' } },
          links: [],
        },
      ];

      mockOpenSearchService.isAvailable.mockReturnValue(true);
      mockOpenSearchService.searchTracks.mockRejectedValue(new Error('OpenSearch error'));
      mockPrismaClient.track.findMany.mockResolvedValue(mockTracks);

      const result = await service.searchTracks(query, limit);

      expect(result).toEqual(mockTracks);
      expect(mockOpenSearchService.searchTracks).toHaveBeenCalled();
      expect(mockPrismaClient.track.findMany).toHaveBeenCalledWith({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: limit,
        include: {
          release: { include: { artist: true } },
          links: {
            include: { source: true },
          },
        },
      });
    });

    it('should fallback to database when search fails completely', async () => {
      const query = 'test track';
      const limit = 25;
      const mockTracks = [
        {
          id: BigInt(1),
          title: 'Test Track 1',
          release: { artist: { name: 'Test Artist' } },
          links: [],
        },
      ];

      mockOpenSearchService.isAvailable.mockReturnValue(true);
      mockOpenSearchService.searchTracks.mockRejectedValue(new Error('Search error'));
      mockPrismaClient.track.findMany.mockResolvedValue(mockTracks);

      const result = await service.searchTracks(query, limit);

      expect(result).toEqual(mockTracks);
      expect(mockPrismaClient.track.findMany).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search both artists and tracks', async () => {
      const query = 'test';
      const mockArtists = [
        {
          id: BigInt(1),
          name: 'Test Artist',
        },
      ];
      const mockTracks = [
        {
          id: BigInt(1),
          title: 'Test Track',
        },
      ];

      mockPrismaClient.artist.findMany.mockResolvedValue(mockArtists);
      mockOpenSearchService.isAvailable.mockReturnValue(false);
      mockPrismaClient.track.findMany.mockResolvedValue(mockTracks);

      const result = await service.search(query);

      expect(result).toEqual({
        artists: mockArtists,
        tracks: mockTracks,
      });
      expect(mockPrismaClient.artist.findMany).toHaveBeenCalled();
      expect(mockPrismaClient.track.findMany).toHaveBeenCalled();
    });
  });
});
