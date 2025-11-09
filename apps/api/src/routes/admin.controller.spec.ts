import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminGuard } from '../security/admin.guard';
import { AuthService } from '../modules/auth.service';
import { PrismaService } from '../modules/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminGuard = {
    canActivate: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminGuard,
          useValue: mockAdminGuard,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);

    jest.clearAllMocks();
  });

  describe('ping', () => {
    it('should return ok status', () => {
      const result = controller.ping();

      expect(result).toEqual({ ok: true });
    });
  });
});

