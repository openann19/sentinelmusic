import { InternalServerErrorException as NestInternalServerErrorException } from '@nestjs/common';

export class InternalServerErrorException extends NestInternalServerErrorException {
  constructor(message: string = 'Internal server error') {
    super({
      message,
      error: 'internal_server_error',
      statusCode: 500,
    });
  }
}

