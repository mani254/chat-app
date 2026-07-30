import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../common/logger/logger.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RedisModule } from './redis/redis.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

/**
 * AppModule — Root NestJS Module
 *
 * Registers all global infrastructure:
 *   - ConfigModule   (isGlobal = true, env validation)
 *   - LoggerModule   (Pino, dev=pretty / prod=JSON)
 *   - APP_FILTER     → HttpExceptionFilter (unified error envelope)
 *   - APP_INTERCEPTOR→ LoggingInterceptor  (request duration)
 *   - APP_INTERCEPTOR→ TransformInterceptor (success envelope)
 *   - APP_GUARD      → AuthGuard (Better Auth foundation)
 *
 * Feature modules registered here:
 *   - HealthModule
 *   - AuthModule
 *   - RedisModule
 *   - WebSocketModule
 *
 * How to add a new domain feature:
 *   1. Create apps/api/src/app/[domain]/[domain].module.ts
 *   2. Import it below in the `imports` array
 *   3. Done — global pipes, filters, guards apply automatically
 */
@Module({
  imports: [
    // Infrastructure (always first)
    ConfigModule,
    LoggerModule,

    // Feature modules
    HealthModule,
    AuthModule,
    RedisModule,
    WebSocketModule,
    ChatModule,
    MessageModule,
  ],
  providers: [
    // Global exception filter — formats all errors to ApiErrorResponse
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global logging interceptor — logs method + url + duration
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global transform interceptor — wraps responses in ApiSuccessResponse
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global auth guard — @Public() decorator bypasses it
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
