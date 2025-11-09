import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../modules/auth.service';
import { PrismaService } from '../modules/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from '../security/admin.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
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
        {
          provide: AdminGuard,
          useValue: mockAdminGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: BigInt(1),
        email: 'test@example.com',
        role: 'BASIC',
      };
      const token = 'generated-token';

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.generateToken.mockResolvedValue(token);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        accessToken: token,
        user: {
          id: mockUser.id.toString(),
          email: mockUser.email,
          role: mockUser.role,
        },
      });
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid email or password',
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.generateToken).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('adminOnly', () => {
    it('should return admin access message', async () => {
      const result = await controller.adminOnly();

      expect(result).toEqual({ message: 'Admin access granted' });
    });
  });
});

