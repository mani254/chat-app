import 'reflect-metadata';

import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as fs from 'fs';
import { Logger as PinoLogger } from 'nestjs-pino';
import * as path from 'path';

import { connectDatabase } from '@org/dal';
import { AppModule } from './app/app.module';
import { RedisIoAdapter } from './app/websocket/adapters/redis-io.adapter';
import { configureSwagger } from './swagger/swagger.setup';

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

  // ── 4.1 Register @fastify/multipart for file uploads ─────────────────────
  await app.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024, files: 10 }, // 50MB per file, max 10 files
  });

  // ── 4.2 Serve /uploads directory as static files ──────────────────────────
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
  });

  // ── 5. CORS — origin from config, never hardcoded ─────────────────────────
  app.enableCors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: corsOrigin !== '*',
  });

  // ── 5.1 Redis WebSocket Adapter (Pub/Sub multi-node scaling) ───────────────
  const redisIoAdapter = new RedisIoAdapter(app, config);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // ── 6. Global API Prefix ('api') ──────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── 7. URI-based versioning: /api/v1, /api/v2, ... ───────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get<string>('app.defaultVersion') ?? '1',
    prefix: 'v',
  });

  // ── 8. Global validation pipe ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── 9. Swagger (non-production only) ─────────────────────────────────────
  configureSwagger(app);

  // ── 10. Graceful shutdown hooks ───────────────────────────────────────────
  app.enableShutdownHooks();

  // ── 11. Bind and listen ──────────────────────────────────────────────────
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
