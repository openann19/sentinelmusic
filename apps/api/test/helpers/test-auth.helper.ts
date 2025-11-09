import * as jwt from 'jsonwebtoken';

export function generateTestToken(
  userId: string | bigint,
  role: string = 'BASIC',
  secret: string = process.env.JWT_SECRET || 'test-secret-key',
): string {
  return jwt.sign(
    {
      sub: String(userId),
      role,
    },
    secret,
    { expiresIn: '1h' },
  );
}

export function getAuthHeaders(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}

