/**
 * Validated body for `POST /auth/register`. `pseudo` is restricted to
 * 3-24 chars of letters/digits/underscore/hyphen (mirrors `UpdateUserDto`).
 * `password` is capped at 72 chars because bcrypt silently truncates input
 * beyond that; rejecting it up front avoids a confusing "your password
 * quietly stopped mattering after character 72" surprise.
 */
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'pseudo may only contain letters, numbers, underscores and hyphens',
  })
  pseudo!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
