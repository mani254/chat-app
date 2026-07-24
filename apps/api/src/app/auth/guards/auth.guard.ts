import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * AuthGuard (Better Auth foundation)
 *
 * Global route guard. Currently passes all requests through.
 *
 * TODO: Integrate Better Auth session/token validation here.
 *
 * Flow:
 *   1. Check if route is decorated with @Public() → allow through.
 *   2. Validate session/JWT via Better Auth client.
 *   3. Attach user to request.user.
 *   4. Return true (authorized) or throw UnauthorizedException.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow public routes without auth check
    if (isPublic) return true;

    // TODO: Implement Better Auth token/session validation
    // const request = context.switchToHttp().getRequest<FastifyRequest>();
    // const session = await betterAuth.verifySession(request);
    // if (!session) throw new UnauthorizedException();
    // request.user = session.user;

    return true; // Temporarily allow all — remove when Better Auth is wired
  }
}
