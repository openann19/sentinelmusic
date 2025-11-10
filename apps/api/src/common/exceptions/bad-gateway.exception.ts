import { BadGatewayException as NestBadGatewayException } from '@nestjs/common';

export class BadGatewayException extends NestBadGatewayException {
  constructor(message: string = 'Bad gateway', service?: string) {
    super({
      message,
      error: 'bad_gateway',
      statusCode: 502,
      service,
    });
  }
}
