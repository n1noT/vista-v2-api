/**
 * Enforces `@Roles(...)` metadata — applied per-controller (e.g. the admin
 * modules), not globally like `JwtAuthGuard`, since only a subset of routes
 * are role-restricted. Runs after the global `JwtAuthGuard` has already
 * populated `request.user`, so it only needs to compare `user.role` against
 * the declared allow-list; no roles declared means the guard allows through.
 */
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../../generated/prisma/client';
import { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
