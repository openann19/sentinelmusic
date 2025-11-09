import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(message: string | string[], errors?: Record<string, string[]>) {
    super({
      message,
      error: 'validation_error',
      statusCode: 400,
      errors,
    });
  }
}
