import { ConflictException as NestConflictException } from '@nestjs/common';

export class ConflictException extends NestConflictException {
  constructor(message: string, resource?: string) {
    super({
      message,
      error: 'conflict',
      statusCode: 409,
      resource,
    });
  }
}

