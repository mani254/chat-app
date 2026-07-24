import { Module } from '@nestjs/common';

/**
 * AuthModule
 *
 * Authentication foundation for Better Auth.
 *
 * Structure (to be wired when Better Auth is integrated):
 *   guards/auth.guard.ts           — Route-level session/token validation
 *   decorators/public.decorator.ts — @Public() bypass
 *   decorators/current-user.decorator.ts — @CurrentUser() param
 *
 * Better Auth integration steps:
 *   1. npm install better-auth
 *   2. Configure better-auth client in src/app/auth/better-auth.config.ts
 *   3. Update AuthGuard.canActivate() to validate session
 *   4. Export BetterAuthService via this module
 */
@Module({})
export class AuthModule {}
