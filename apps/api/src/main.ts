import 'reflect-metadata';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { configureSwagger } from './swagger/swagger.setup';
import { connectDatabase } from '@org/dal';

async function bootstrap(): Promise<void> {
  // ── 1. Create the Fastify-powered NestJS application ──────────────────────
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // Pino handles logging via nestjs-pino
    }),
    { bufferLogs: true },
  );

  // ── 2. Wire Pino as the application logger ────────────────────────────────
  app.useLogger(app.get(PinoLogger));

  // ── 3. Pull configuration from the registered ConfigModule ────────────────
  const config = app.get(ConfigService);
  const nodeEnv = config.getOrThrow<string>('app.nodeEnv');
  const port = config.getOrThrow<number>('app.port');
  const corsOrigin = config.getOrThrow<string>('app.corsOrigin');
  const dbUri = config.getOrThrow<string>('database.uri');

  // ── 4. Connect to MongoDB via @org/dal (single connection for the app) ────
  await connectDatabase(dbUri);

  // ── 5. CORS — origin from config, never hardcoded ─────────────────────────
  app.enableCors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: corsOrigin !== '*',
  });

  // ── 6. URI-based versioning: /api/v1, /api/v2, ... ───────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get<string>('app.defaultVersion') ?? '1',
    prefix: 'api/v',
  });

  // ── 7. Global validation pipe ─────────────────────────────────────────────
  //   whitelist:          strips properties not in the DTO class
  //   forbidNonWhitelisted: throws 400 if unknown props are sent
  //   transform:          auto-converts plain objects to DTO class instances
  //                       + coerces query/param strings to native TS types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── 8. Swagger (non-production only) ─────────────────────────────────────
  configureSwagger(app);

  // ── 9. Graceful shutdown hooks ────────────────────────────────────────────
  app.enableShutdownHooks();

  // ── 10. Bind and listen ──────────────────────────────────────────────────
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`✅ API running in [${nodeEnv}] mode on port ${port}`);
  logger.log(`📖 Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health:  http://localhost:${port}/api/v1/health`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
