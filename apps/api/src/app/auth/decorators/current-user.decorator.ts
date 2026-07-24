import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

/**
 * @CurrentUser()
 *
 * Extracts the authenticated user from the Fastify request object.
 * Populated by the auth guard after token validation.
 *
 * Usage:
 *   @Get('me')
 *   getMe(@CurrentUser() user: UserEntity) { return user; }
 *
 * Note: Populated by Better Auth guard (to be implemented).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: unknown }>();
    return request.user;
  },
);
