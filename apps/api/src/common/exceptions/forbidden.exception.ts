import { ForbiddenException as NestForbiddenException } from '@nestjs/common';

export class ForbiddenException extends NestForbiddenException {
  constructor(message: string = 'Access forbidden') {
    super({
      message,
      error: 'forbidden',
      statusCode: 403,
    });
  }
}
