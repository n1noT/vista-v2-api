/**
 * `@Roles(...roles)` — attaches an allowed-roles list to a handler or
 * controller class via `SetMetadata`, mirroring `@Public()`'s pattern.
 * Read by `RolesGuard` (applied per-controller, unlike the global
 * `JwtAuthGuard`) to decide whether `request.user.role` is allowed through.
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
