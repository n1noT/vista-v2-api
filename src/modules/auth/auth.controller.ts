/**
 * The three session-lifecycle endpoints, all marked `@Public()` since none
 * of them can require an existing session.
 *
 * `register` and `login` both call into `AuthService`, then use
 * `@Res({ passthrough: true })` to set the `access_token` cookie on the
 * response via `res.cookie(...)` while still letting Nest serialize the
 * returned user as the JSON body (passthrough mode is what makes both
 * possible in the same handler). `logout` just clears the cookie — it
 * doesn't need to be authenticated to do that.
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, AUTH_COOKIE_NAME } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticatedUser> {
    const { user, token } = await this.authService.register(dto);
    res.cookie(AUTH_COOKIE_NAME, token, this.authService.getCookieOptions());
    return user;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticatedUser> {
    const { user, token } = await this.authService.login(dto);
    res.cookie(AUTH_COOKIE_NAME, token, this.authService.getCookieOptions());
    return user;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    return { success: true };
  }
}
