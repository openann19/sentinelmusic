import {
  INestApplication,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import prismaClient from '@music-hub/db';
import { PrismaClient as PrismaClientType } from '@prisma/client';

/**
 * Prisma service for database access
 * Provides a singleton Prisma client instance with lifecycle hooks
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly client: PrismaClientType;

  constructor() {
    this.client = prismaClient;
  }

  /**
   * Connects to the database on module initialization
   */
  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log('Database connection established');
  }

  /**
   * Disconnects from the database on module destruction
   */
  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Enables shutdown hooks to gracefully close the application
   * @param app - NestJS application instance
   */
  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // Use process signals for graceful shutdown instead of Prisma events
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
