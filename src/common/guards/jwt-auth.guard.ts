/**
 * The app's global auth guard, registered as `APP_GUARD` in app.module.ts so
 * it runs on every request. Extends passport's generic `AuthGuard('jwt')`
 * (which runs `JwtStrategy` under the hood) and overrides `canActivate` to
 * check for `@Public()` metadata first: if the target handler or its
 * controller class is marked public, the request is let through without
 * ever invoking the passport strategy; otherwise it defers to
 * `super.canActivate()`, which extracts/verifies the JWT and populates
 * `req.user` (or throws 401 if that fails).
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Registered globally (secure-by-default); @Public() opts a route out.
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
