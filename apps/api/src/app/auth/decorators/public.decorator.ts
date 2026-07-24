import { SetMetadata } from '@nestjs/common';

/**
 * @Public()
 *
 * Mark a route as publicly accessible (bypasses JwtAuthGuard).
 *
 * Usage:
 *   @Public()
 *   @Get('login')
 *   login() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
