/**
 * Validated body for `PATCH /users/me`. `pseudo` is optional (an empty PATCH
 * is valid and simply returns the user unchanged) but when present must be
 * 3-24 chars of letters/digits/underscore/hyphen only — the same rule as
 * `RegisterDto.pseudo`, kept in sync manually since the two DTOs serve
 * different endpoints (create vs. update) and Nest has no shared base here.
 */
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'pseudo may only contain letters, numbers, underscores and hyphens',
  })
  pseudo?: string;
}
