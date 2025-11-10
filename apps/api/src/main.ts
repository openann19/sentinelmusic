import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { AppModule } from './app.module';
import { PrismaService } from './modules/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  const configService = app.get(ConfigService);

  const fastifyInstance = app.getHttpAdapter().getInstance();
  // Register Fastify plugins with type assertion to resolve TypeScript plugin type conflicts
  await fastifyInstance.register(
    helmet as unknown as Parameters<typeof fastifyInstance.register>[0]
  );
  await fastifyInstance.register(
    rateLimit as unknown as Parameters<typeof fastifyInstance.register>[0],
    {
      max: 100,
      timeWindow: '1 minute',
    }
  );

  app.enableCors({
    origin: configService.get<string>('WEB_ORIGIN'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Music Hub API')
    .setDescription('Music Hub REST API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = Number(configService.get<number>('PORT') || 4000);
  await app.listen({ port, host: '0.0.0.0' });

  logger.log(`Application is running on: http://localhost:${port}/api`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
