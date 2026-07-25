/**
 * Validated body for `POST /admin/seasons`. `externalId` is optional — when
 * omitted, `AdminSeasonsService.create` assigns a synthetic negative one
 * (football-data.org ids are always positive) so a manually-created season
 * can never collide with a row `FootballSyncService` upserts. Dates arrive
 * as ISO strings (`@IsDateString`) and are converted to `Date` in the
 * service, same convention as `FootballSyncService.syncLeague`.
 */
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateSeasonDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(1)
  currentMatchday!: number;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsInt()
  externalId?: number;
}
