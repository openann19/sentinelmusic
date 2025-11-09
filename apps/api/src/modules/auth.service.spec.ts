import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from './auth.service';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            client: mockPrismaClient,
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: BigInt(1),
        email,
        password: hashedPassword,
        role: 'BASIC',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: BigInt(1),
        email,
        password: hashedPassword,
        role: 'BASIC',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token successfully', async () => {
      const user = { id: BigInt(1), role: 'ADMIN' };
      const secret = 'test-secret';
      const token = 'generated-token';

      mockConfigService.get.mockReturnValue(secret);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await service.generateToken(user);

      expect(result).toBe(token);
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: String(user.id),
          role: user.role,
        },
        secret,
        { expiresIn: '2h' }
      );
    });

    it('should throw error when JWT_SECRET is not configured', async () => {
      const user = { id: BigInt(1), role: 'ADMIN' };

      mockConfigService.get.mockReturnValue(undefined);

      await expect(service.generateToken(user)).rejects.toThrow('JWT_SECRET not configured');
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should verify and return decoded token payload', async () => {
      const token = 'valid-token';
      const secret = 'test-secret';
      const payload: JwtPayload = {
        sub: '1',
        role: 'ADMIN',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockConfigService.get.mockReturnValue(secret);
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = await service.verifyToken(token);

      expect(result).toEqual(payload);
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const token = 'invalid-token';
      const secret = 'test-secret';

      mockConfigService.get.mockReturnValue(secret);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken(token)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyToken(token)).rejects.toThrow('Invalid token');
    });

    it('should throw error when JWT_SECRET is not configured', async () => {
      const token = 'valid-token';

      mockConfigService.get.mockReturnValue(undefined);

      await expect(service.verifyToken(token)).rejects.toThrow('JWT_SECRET not configured');
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const token = 'expired-token';
      const secret = 'test-secret';

      mockConfigService.get.mockReturnValue(secret);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('Token expired') as Error & { name?: string };
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(service.verifyToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });
});
