import { Test, TestingModule } from '@nestjs/testing';
import { ArtistController } from './artist.controller';
import { ArtistService } from '../modules/artist.service';
import { PrismaService } from '../modules/prisma.service';
import { EntityNotFoundException } from '../common/exceptions/not-found.exception';

describe('ArtistController', () => {
  let controller: ArtistController;
  let artistService: ArtistService;

  const mockArtistService = {
    findById: jest.fn(),
    searchByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistController],
      providers: [
        {
          provide: ArtistService,
          useValue: mockArtistService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ArtistController>(ArtistController);
    artistService = module.get<ArtistService>(ArtistService);

    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return an artist when found', async () => {
      const artistId = '1';
      const mockArtist = {
        id: BigInt(1),
        name: 'Test Artist',
        sortName: 'Artist, Test',
        country: 'US',
        releases: [],
      };

      mockArtistService.findById.mockResolvedValue(mockArtist);

      const result = await controller.getById({ id: artistId });

      expect(result).toEqual(mockArtist);
      expect(artistService.findById).toHaveBeenCalledWith(BigInt(artistId));
    });

    it('should throw EntityNotFoundException when artist is not found', async () => {
      const artistId = '999';

      mockArtistService.findById.mockRejectedValue(
        new EntityNotFoundException('Artist', artistId),
      );

      await expect(controller.getById({ id: artistId })).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(artistService.findById).toHaveBeenCalledWith(BigInt(artistId));
    });

    it('should handle invalid ID format', async () => {
      const artistId = 'invalid';

      await expect(controller.getById({ id: artistId })).rejects.toThrow();
    });
  });
});

