import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from '../modules/search.service';
import { PrismaService } from '../modules/prisma.service';
import { OpenSearchService } from '../modules/opensearch.service';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  const mockSearchService = {
    search: jest.fn(),
    searchArtists: jest.fn(),
    searchTracks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: OpenSearchService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);

    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return search results for valid query', async () => {
      const query = 'test query';
      const mockResults = {
        artists: [
          {
            id: BigInt(1),
            name: 'Test Artist',
          },
        ],
        tracks: [
          {
            id: BigInt(1),
            title: 'Test Track',
          },
        ],
      };

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await controller.search({ q: query });

      expect(result).toEqual(mockResults);
      expect(searchService.search).toHaveBeenCalledWith(query);
    });

    it('should return empty results when no matches found', async () => {
      const query = 'nonexistent';
      const mockResults = {
        artists: [],
        tracks: [],
      };

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await controller.search({ q: query });

      expect(result).toEqual(mockResults);
      expect(searchService.search).toHaveBeenCalledWith(query);
    });

    it('should handle search service errors', async () => {
      const query = 'test query';
      const error = new Error('Search failed');

      mockSearchService.search.mockRejectedValue(error);

      await expect(controller.search({ q: query })).rejects.toThrow(error);
    });
  });
});
