/**
 * Validated body for `POST /admin/leagues`. `externalId` is optional — when
 * omitted, `AdminLeaguesService.create` assigns a synthetic negative one
 * (football-data.org ids are always positive) so a manually-created league
 * can never collide with a row `FootballSyncService` upserts.
 */
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLeagueDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  externalId?: number;
}
