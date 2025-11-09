import { Test, TestingModule } from '@nestjs/testing';
import { ArtistService } from './artist.service';
import { PrismaService } from './prisma.service';
import { EntityNotFoundException } from '../common/exceptions/not-found.exception';

describe('ArtistService', () => {
  let service: ArtistService;

  const mockPrismaClient = {
    artist: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistService,
        {
          provide: PrismaService,
          useValue: {
            client: mockPrismaClient,
          },
        },
      ],
    }).compile();

    service = module.get<ArtistService>(ArtistService);

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return an artist when found', async () => {
      const artistId = BigInt(1);
      const mockArtist = {
        id: artistId,
        name: 'Test Artist',
        sortName: 'Artist, Test',
        country: 'US',
        releases: [],
      };

      mockPrismaClient.artist.findUnique.mockResolvedValue(mockArtist);

      const result = await service.findById(artistId);

      expect(result).toEqual(mockArtist);
      expect(mockPrismaClient.artist.findUnique).toHaveBeenCalledWith({
        where: { id: artistId },
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
    });

    it('should throw EntityNotFoundException when artist is not found', async () => {
      const artistId = BigInt(999);

      mockPrismaClient.artist.findUnique.mockResolvedValue(null);

      await expect(service.findById(artistId)).rejects.toThrow(EntityNotFoundException);
      await expect(service.findById(artistId)).rejects.toThrow('Artist with ID 999 not found');
    });
  });

  describe('searchByName', () => {
    it('should return artists matching the query', async () => {
      const query = 'test';
      const mockArtists = [
        {
          id: BigInt(1),
          name: 'Test Artist',
          sortName: 'Artist, Test',
          country: 'US',
        },
        {
          id: BigInt(2),
          name: 'Another Test',
          sortName: 'Another Test',
          country: 'UK',
        },
      ];

      mockPrismaClient.artist.findMany.mockResolvedValue(mockArtists);

      const result = await service.searchByName(query);

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

      const result = await service.searchByName(query);

      expect(result).toEqual([]);
      expect(mockPrismaClient.artist.findMany).toHaveBeenCalled();
    });

    it('should respect the limit parameter', async () => {
      const query = 'test';
      const limit = 5;
      const mockArtists = [
        {
          id: BigInt(1),
          name: 'Test Artist 1',
        },
        {
          id: BigInt(2),
          name: 'Test Artist 2',
        },
      ];

      mockPrismaClient.artist.findMany.mockResolvedValue(mockArtists);

      const result = await service.searchByName(query, limit);

      expect(result).toEqual(mockArtists);
      expect(mockPrismaClient.artist.findMany).toHaveBeenCalledWith({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: limit,
        orderBy: { name: 'asc' },
      });
    });

    it('should use default limit of 10 when not provided', async () => {
      const query = 'test';

      mockPrismaClient.artist.findMany.mockResolvedValue([]);

      await service.searchByName(query);

      expect(mockPrismaClient.artist.findMany).toHaveBeenCalledWith({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 10,
        orderBy: { name: 'asc' },
      });
    });
  });
});
