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
import { UserModule } from './user/user.module';

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
    UserModule,
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
