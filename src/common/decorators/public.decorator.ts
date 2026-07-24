/**
 * `@Public()` — attaches `isPublic: true` metadata to a handler or
 * controller class via `SetMetadata`. Since `JwtAuthGuard` is registered
 * globally (every route requires auth by default), this decorator is the
 * explicit opt-out for routes that must stay reachable by anonymous callers
 * — currently `/auth/register`, `/auth/login`, `/auth/logout`, and the root
 * health-check route. `JwtAuthGuard.canActivate` reads this metadata via
 * `Reflector.getAllAndOverride` to decide whether to skip the passport check.
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
