import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Validates user credentials and returns user data if valid
   * @param email - User email address
   * @param password - User password
   * @returns User data if credentials are valid, null otherwise
   */
  async validateUser(
    email: string,
    password: string
  ): Promise<{
    id: bigint;
    email: string;
    role: string;
  } | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Generates a JWT token for a user
   * @param user - User object with id and role
   * @returns JWT token string
   * @throws Error if JWT_SECRET is not configured
   */
  async generateToken(user: { id: bigint; role: string }): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(
      {
        sub: String(user.id),
        role: user.role,
      },
      secret,
      { expiresIn: '2h' }
    );
  }

  /**
   * Verifies and decodes a JWT token
   * @param token - JWT token string
   * @returns Decoded JWT payload
   * @throws UnauthorizedException if token is invalid or JWT_SECRET is not configured
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
