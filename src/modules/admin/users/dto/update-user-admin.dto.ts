/**
 * Validated body for `PATCH /admin/users/:id` — broader than the
 * self-service `UpdateUserDto` (which only allows `pseudo`): an admin can
 * also edit `email`, `avatarUrl`, and `role`. All fields optional, same
 * pseudo rule as `UpdateUserDto` (kept in sync manually, see that file's
 * header). `role` changes on the caller's own account are rejected by
 * `AdminUsersController.update` before this DTO's value ever reaches
 * `UsersService` — see that controller's `assertNotSelf` usage.
 */
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../../generated/prisma/client';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'pseudo may only contain letters, numbers, underscores and hyphens',
  })
  pseudo?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
