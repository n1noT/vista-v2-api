/**
 * The mechanics behind register/login/logout: password hashing (bcrypt, 10
 * rounds), JWT signing, and the session cookie's options. The controller
 * calls into this service and handles the HTTP/cookie wiring itself.
 *
 * - `register` hashes the password, delegates uniqueness-checked creation to
 *   `UsersService.createUser`, and immediately signs a token (auto-login —
 *   there's no separate "verify your email then log in" step here).
 * - `login` does a generic `UnauthorizedException('Invalid credentials')` on
 *   either a missing user or a wrong password, deliberately not
 *   distinguishing the two so a caller can't enumerate valid emails. A
 *   banned account gets a distinct `ForbiddenException` instead, since at
 *   that point the credentials are already known-valid and there's no
 *   enumeration risk in saying so.
 * - `getCookieOptions` centralizes the cookie flags so register/login/future
 *   refresh-token work all agree on them; see the inline comment on
 *   `sameSite` for why they're what they are.
 * - `parseDurationMs` converts a `JWT_EXPIRES_IN`-style string ("7d") into
 *   milliseconds for the cookie's `maxAge`, since `jsonwebtoken` accepts that
 *   format but `res.cookie` needs a number.
 */
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CookieOptions } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';

const SALT_ROUNDS = 10;
export const AUTH_COOKIE_NAME = 'access_token';

const DURATION_UNITS_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function parseDurationMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration.trim());
  if (match) {
    return Number(match[1]) * DURATION_UNITS_MS[match[2]];
  }
  const seconds = Number(duration);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }
  throw new Error(`Invalid duration string: ${duration}`);
}

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      pseudo: dto.pseudo,
      passwordHash,
    });
    return {
      user: this.usersService.toPublicUser(user),
      token: this.signToken(user.id),
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.bannedAt) {
      throw new ForbiddenException('This account has been banned');
    }
    return {
      user: this.usersService.toPublicUser(user),
      token: this.signToken(user.id),
    };
  }

  getCookieOptions(): CookieOptions {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: parseDurationMs(expiresIn),
    };
  }

  private signToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}
