import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchConfig {
  constructor(private readonly configService: ConfigService) {}

  createClient(): Client {
    return new Client({
      node: this.configService.get<string>('OPENSEARCH_NODE', 'http://localhost:9200'),
      auth: {
        username: this.configService.get<string>('OPENSEARCH_USERNAME', 'admin'),
        password: this.configService.get<string>('OPENSEARCH_PASSWORD', 'admin'),
      },
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
}
