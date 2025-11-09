import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client property', () => {
    expect(service.client).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      const connectSpy = jest.spyOn(service.client, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
      connectSpy.mockRestore();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      const disconnectSpy = jest.spyOn(service.client, '$disconnect').mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
      disconnectSpy.mockRestore();
    });
  });

  describe('enableShutdownHooks', () => {
    it('should enable shutdown hooks', async () => {
      const mockApp = {
        close: jest.fn().mockResolvedValue(undefined),
      } as unknown as INestApplication;

      const processOnSpy = jest
        .spyOn(process, 'on')
        .mockImplementation((event: string | symbol, listener: (...args: any[]) => void) => {
          if (event === 'beforeExit') {
            listener();
          }
          return process;
        });

      await service.enableShutdownHooks(mockApp);

      expect(processOnSpy).toHaveBeenCalledWith('beforeExit', expect.any(Function));
      processOnSpy.mockRestore();
    });
  });
});
