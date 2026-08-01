import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Clean HTTP Logging Interceptor.
 *
 * Logs a concise single-line summary of every request:
 * [METHOD] URL -> Status (+DurationMs) | payload: {...}
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();

    const { method, url, body } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const statusCode = response.statusCode;

        let payloadStr = '';
        if (body && typeof body === 'object' && Object.keys(body).length > 0) {
          try {
            const sanitized = { ...(body as Record<string, unknown>) };
            // Redact sensitive fields
            if ('password' in sanitized) sanitized['password'] = '[REDACTED]';
            if ('token' in sanitized) sanitized['token'] = '[REDACTED]';
            if ('secret' in sanitized) sanitized['secret'] = '[REDACTED]';

            const json = JSON.stringify(sanitized);
            payloadStr = ` | payload: ${json.length > 200 ? json.substring(0, 200) + '...' : json}`;
          } catch {
            payloadStr = '';
          }
        }

        this.logger.log(`[${method}] ${url} -> ${statusCode} (+${ms}ms)${payloadStr}`);
      }),
    );
  }
}
