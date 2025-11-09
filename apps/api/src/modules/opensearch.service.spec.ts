import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { OpenSearchService } from './opensearch.service';
import { Client } from '@opensearch-project/opensearch';

jest.mock('@opensearch-project/opensearch');

// Mock Logger to avoid type errors in tests
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

describe('OpenSearchService', () => {
  let service: OpenSearchService;
  let mockClient: {
    ping: jest.MockedFunction<() => Promise<boolean>>;
    search: jest.MockedFunction<(params: unknown) => Promise<unknown>>;
    close: jest.MockedFunction<() => void>;
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockClient = {
      ping: jest.fn<Promise<boolean>, []>().mockResolvedValue(true),
      search: jest.fn(),
      close: jest.fn<void, []>(),
    };

    (Client as jest.MockedClass<typeof Client>).mockImplementation(() => {
      return mockClient as unknown as Client;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenSearchService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OpenSearchService>(OpenSearchService);

    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize OpenSearch client when OPENSEARCH_URL is configured', async () => {
      const nodeUrl = 'http://localhost:9200';
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENSEARCH_URL') return nodeUrl;
        return undefined;
      });
      mockClient.ping.mockResolvedValue(true);

      await service.onModuleInit();

      expect(Client).toHaveBeenCalled();
      expect(mockClient.ping).toHaveBeenCalled();
    });

    it('should use OPENSEARCH_NODE fallback when OPENSEARCH_URL is not set', async () => {
      const nodeUrl = 'http://localhost:9200';
      mockConfigService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'OPENSEARCH_URL') return undefined;
        if (key === 'OPENSEARCH_NODE') return defaultValue || nodeUrl;
        return undefined;
      });
      mockClient.ping.mockResolvedValue(true);

      await service.onModuleInit();

      expect(Client).toHaveBeenCalled();
      expect(mockClient.ping).toHaveBeenCalled();
    });

    it('should initialize with authentication when credentials are provided', async () => {
      const nodeUrl = 'http://localhost:9200';
      const username = 'testuser';
      const password = 'testpass';

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENSEARCH_URL') return nodeUrl;
        if (key === 'OPENSEARCH_USERNAME') return username;
        if (key === 'OPENSEARCH_PASSWORD') return password;
        return undefined;
      });
      mockClient.ping.mockResolvedValue(true);

      await service.onModuleInit();

      expect(Client).toHaveBeenCalledWith(
        expect.objectContaining({
          node: nodeUrl,
          auth: {
            username,
            password,
          },
        })
      );
    });

    it('should not initialize client when neither OPENSEARCH_URL nor OPENSEARCH_NODE is configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await service.onModuleInit();

      expect(Client).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      const nodeUrl = 'http://localhost:9200';
      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockRejectedValue(new Error('Connection failed'));

      await service.onModuleInit();

      expect(Client).toHaveBeenCalled();
      expect(() => service.getClient()).toThrow();
    });
  });

  describe('onModuleDestroy', () => {
    it('should close client when it exists', async () => {
      const nodeUrl = 'http://localhost:9200';
      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockResolvedValue(true);

      await service.onModuleInit();
      service.onModuleDestroy();

      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should not throw error when client does not exist', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });

  describe('getClient', () => {
    it('should return client when initialized', async () => {
      const nodeUrl = 'http://localhost:9200';
      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockResolvedValue(true);

      await service.onModuleInit();

      const client = service.getClient();
      expect(client).toBeDefined();
    });

    it('should throw error when client is not initialized', () => {
      expect(() => service.getClient()).toThrow('OpenSearch client not initialized');
    });
  });

  describe('searchTracks', () => {
    it('should search tracks and return track IDs', async () => {
      const nodeUrl = 'http://localhost:9200';
      const query = 'test track';
      const size = 25;
      const mockResponse = {
        body: {
          hits: {
            hits: [{ _id: '1' }, { _id: '2' }, { _id: '3' }],
          },
        },
      };

      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockResolvedValue(true);
      mockClient.search.mockResolvedValue(mockResponse);

      await service.onModuleInit();

      const result = await service.searchTracks(query, size);

      expect(result).toEqual([BigInt(1), BigInt(2), BigInt(3)]);
      expect(mockClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'tracks',
          body: expect.objectContaining({
            query: expect.objectContaining({
              multi_match: expect.objectContaining({
                query,
                fields: ['title^2', 'artist'],
              }),
            }),
            size,
          }),
        })
      );
    });

    it('should return empty array when no hits are found', async () => {
      const nodeUrl = 'http://localhost:9200';
      const query = 'nonexistent';
      const mockResponse = {
        body: {
          hits: {
            hits: [],
          },
        },
      };

      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockResolvedValue(true);
      mockClient.search.mockResolvedValue(mockResponse);

      await service.onModuleInit();

      const result = await service.searchTracks(query);

      expect(result).toEqual([]);
    });

    it('should throw error when client is not initialized', async () => {
      const query = 'test track';

      await expect(service.searchTracks(query)).rejects.toThrow(
        'OpenSearch client not initialized'
      );
    });

    it('should throw error when search fails', async () => {
      const nodeUrl = 'http://localhost:9200';
      const query = 'test track';

      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockResolvedValue(true);
      mockClient.search.mockRejectedValue(new Error('Search failed'));

      await service.onModuleInit();

      await expect(service.searchTracks(query)).rejects.toThrow('Search failed');
    });
  });

  describe('isAvailable', () => {
    it('should return true when client is initialized', async () => {
      const nodeUrl = 'http://localhost:9200';
      mockConfigService.get.mockReturnValue(nodeUrl);
      mockClient.ping.mockResolvedValue(true);

      await service.onModuleInit();

      expect(service.isAvailable()).toBe(true);
    });

    it('should return false when client is not initialized', () => {
      expect(service.isAvailable()).toBe(false);
    });
  });
});
