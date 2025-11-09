import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../modules/auth.service';

/**
 * Guard to protect routes that require ADMIN role
 * Validates JWT token and checks for ADMIN role
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  /**
   * Checks if the request has a valid JWT token with ADMIN role
   * @param context - Execution context from NestJS
   * @returns true if user has ADMIN role, throws UnauthorizedException otherwise
   * @throws UnauthorizedException if token is missing, invalid, or user is not ADMIN
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    try {
      const decoded = await this.authService.verifyToken(token);

      if (decoded.role !== 'ADMIN') {
        throw new UnauthorizedException('Admin access required');
      }

      request.user = decoded;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
