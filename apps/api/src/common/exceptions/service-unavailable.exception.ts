import { ServiceUnavailableException as NestServiceUnavailableException } from '@nestjs/common';

export class ServiceUnavailableException extends NestServiceUnavailableException {
  constructor(message: string = 'Service unavailable', service?: string) {
    super({
      message,
      error: 'service_unavailable',
      statusCode: 503,
      service,
    });
  }
}
