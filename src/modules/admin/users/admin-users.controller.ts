/**
 * Players-management surface for `/admin/users` (`Fonctionnalites_Admin.md`
 * "Joueurs": ban, delete account, edit profile info). Guarded by both the
 * global `JwtAuthGuard` (must be logged in) and `RolesGuard` + `@Roles`
 * (must be an `ADMIN`) — everything here operates on *other* users' data,
 * so it's deliberately separate from the self-service `UsersController`.
 *
 * Delegates all Prisma access to `UsersService` (already exported by
 * `UsersModule` for exactly this reuse — see that module's header comment).
 * Ban/delete both reject the caller acting on their own account (403) so an
 * admin can't lock themselves out of the panel via their own tools; `update`
 * applies the same rule specifically to `role` changes (an admin demoting
 * themselves mid-session would hit the same lockout via `RolesGuard` on the
 * very next request), while still allowing self-edits of pseudo/email.
 */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    const users = await this.usersService.findAll(search);
    return users.map((user) => this.usersService.toPublicUser(user));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    if (dto.role !== undefined && id === admin.id) {
      throw new ForbiddenException('You cannot change your own role');
    }
    const updated = await this.usersService.adminUpdateProfile(id, dto);
    return this.usersService.toPublicUser(updated);
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.OK)
  async ban(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    this.assertNotSelf(id, admin, 'ban');
    const updated = await this.usersService.banUser(id);
    return this.usersService.toPublicUser(updated);
  }

  @Post(':id/unban')
  @HttpCode(HttpStatus.OK)
  async unban(@Param('id') id: string) {
    const updated = await this.usersService.unbanUser(id);
    return this.usersService.toPublicUser(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    this.assertNotSelf(id, admin, 'delete');
    await this.usersService.deleteUser(id);
  }

  private assertNotSelf(
    id: string,
    admin: AuthenticatedUser,
    action: string,
  ): void {
    if (id === admin.id) {
      throw new ForbiddenException(`You cannot ${action} your own account`);
    }
  }
}
