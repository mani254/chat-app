import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

/**
 * LoggerModule
 *
 * Configures nestjs-pino as the application logger with clean, concise dev output.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('app.nodeEnv') !== 'production';

        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            // Disable pino-http verbose request header dumps; LoggingInterceptor handles clean single-line request logs
            autoLogging: false,

            // Redact sensitive fields in any manual pino logger calls
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["x-api-key"]',
                'req.body.password',
                'req.body.token',
                'req.body.secret',
                '*.password',
                '*.token',
                '*.secret',
              ],
              censor: '[REDACTED]',
            },

            // Concise request/response serializers
            serializers: {
              req: (req: { method: string; url: string }) => ({
                method: req.method,
                url: req.url,
              }),
              res: (res: { statusCode: number }) => ({
                statusCode: res.statusCode,
              }),
            },

            ...(isDev
              ? {
                  transport: {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      singleLine: true,
                      translateTime: 'SYS:HH:MM:ss.l',
                      ignore: 'pid,hostname',
                    },
                  },
                }
              : {}),
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
