/**
 * The passport strategy backing `JwtAuthGuard` (via `AuthGuard('jwt')`).
 * Passport calls the constructor's `jwtFromRequest` to pull the token off
 * the request — here, a custom extractor reads the `access_token` cookie
 * (set by `AuthService.getCookieOptions`) instead of the more common
 * `Authorization: Bearer` header, since this app authenticates via cookie.
 *
 * `validate()` runs once the token's signature/expiry check out; it reloads
 * the user from the DB by `payload.sub` rather than trusting the payload's
 * claims, and rejects (401) if the user no longer exists or `bannedAt` is
 * set. That reload is what makes an admin's ban take effect on a user's
 * *existing* cookie immediately, without waiting for it to expire.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { AUTH_COOKIE_NAME } from '../auth.service';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request): string | null =>
        (req?.cookies?.[AUTH_COOKIE_NAME] as string | undefined) ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Reload from DB (not just trust the payload) so a ban takes effect on existing cookies immediately.
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.bannedAt) {
      throw new UnauthorizedException();
    }
    return this.usersService.toPublicUser(user);
  }
}
