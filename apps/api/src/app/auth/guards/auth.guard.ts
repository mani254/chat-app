import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { UserRepository } from '@org/dal';
import { auth } from '../better-auth.config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly userRepository = new UserRepository();

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: unknown }>();

    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (typeof value === 'string') {
          headers.append(key, value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            headers.append(key, item);
          }
        }
      }

      // Session verification via Better Auth API (supports cookies & Authorization Bearer header)
      const session = await auth.api.getSession({
        headers,
      });

      if (session?.user?.email) {
        const userEntity = await this.userRepository.findByEmail(
          session.user.email,
        );
        if (userEntity) {
          request.user = userEntity;
          return true;
        }
      }
    } catch {
      throw new UnauthorizedException(
        'Authentication session expired or invalid',
      );
    }

    throw new UnauthorizedException(
      'Authentication required to access this resource',
    );
  }
}
