/**
 * Self-service profile endpoints plus the public-profile lookup, all
 * protected by the global JwtAuthGuard (no `@Public()` here — you must be
 * logged in to hit any of these routes).
 *
 * - `GET /users/me` returns `req.user` as populated by `JwtStrategy`.
 * - `PATCH /users/me` currently only supports changing `pseudo` (avatar
 *   upload is out of scope until a storage strategy is picked — see
 *   `avatarUrl` on the Prisma model). A no-op body (`pseudo: undefined`)
 *   just echoes the current user back rather than hitting the DB.
 * - `GET /users/:id` backs `/profile/:id` — any other player's read-only
 *   profile (pseudo/avatar/join date only, via `toPublicProfile`; no email).
 *   Declared after `me` so Nest registers the literal `/users/me` route
 *   before the `:id` catch-all — otherwise `/users/me` would itself match
 *   `:id` first.
 */
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PublicProfile } from './types/public-profile.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<AuthenticatedUser> {
    if (dto.pseudo === undefined) {
      return user;
    }
    const updated = await this.usersService.updatePseudo(user.id, dto.pseudo);
    return this.usersService.toPublicUser(updated);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string): Promise<PublicProfile> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('Player not found.');
    }
    return this.usersService.toPublicProfile(user);
  }
}
