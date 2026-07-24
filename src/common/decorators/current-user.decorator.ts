/**
 * `@CurrentUser()` — a param decorator that pulls the authenticated user off
 * the request object. `JwtStrategy.validate()` (passport's convention) sets
 * `req.user` to the value it resolves; this decorator just reads it back out
 * so controller methods can declare `me(@CurrentUser() user: AuthenticatedUser)`
 * instead of reaching into `@Req()` manually on every protected route.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../types/authenticated-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
