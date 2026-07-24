import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

/**
 * LoggerModule
 *
 * Configures nestjs-pino as the global application logger.
 *
 * Development:  pino-pretty — colorized, human-readable output.
 * Production:   JSON structured logs — compatible with log aggregators
 *               (Datadog, CloudWatch, ELK, Loki, etc.)
 *
 * Security policies (applied in ALL environments):
 *   - req.headers.authorization  → [REDACTED]
 *   - req.headers.cookie         → [REDACTED]
 *   - password                   → [REDACTED]
 *   - token, secret, accessToken → [REDACTED]
 *   - creditCard, ssn, apiKey    → [REDACTED]
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

            // Redact sensitive fields in every log line
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["x-api-key"]',
                'req.body.password',
                'req.body.token',
                'req.body.secret',
                'req.body.accessToken',
                'req.body.refreshToken',
                'req.body.apiKey',
                'req.body.creditCard',
                'req.body.ssn',
                '*.password',
                '*.token',
                '*.secret',
              ],
              censor: '[REDACTED]',
            },

            // Pretty-print in development, structured JSON in production
            ...(isDev
              ? {
                  transport: {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      singleLine: false,
                      translateTime: 'SYS:HH:MM:ss.l',
                      ignore: 'pid,hostname',
                    },
                  },
                }
              : {
                  // Production: serializers for clean JSON
                  serializers: {
                    req: (req: {
                      id: string;
                      method: string;
                      url: string;
                      headers: Record<string, string>;
                    }) => ({
                      id: req.id,
                      method: req.method,
                      url: req.url,
                      userAgent: req.headers['user-agent'],
                    }),
                    res: (res: { statusCode: number }) => ({
                      statusCode: res.statusCode,
                    }),
                  },
                }),
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
