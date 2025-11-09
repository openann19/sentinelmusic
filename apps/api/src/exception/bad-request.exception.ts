import { BadRequestException } from '@nestjs/common';

export class InvalidCredentialsException extends BadRequestException {
  constructor() {
    super({
      message: 'Invalid credentials',
      error: 'invalid_credentials',
      statusCode: 400,
    });
  }
}

export class NotFoundException extends BadRequestException {
  constructor(resource: string) {
    super({
      message: `${resource} not found`,
      error: 'not_found',
      statusCode: 404,
    });
  }
}

