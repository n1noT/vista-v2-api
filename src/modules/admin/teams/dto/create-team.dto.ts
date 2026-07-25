/**
 * Validated body for `POST /admin/teams`. `externalId` is optional — when
 * omitted, `AdminTeamsService.create` assigns a synthetic negative one
 * (football-data.org ids are always positive) so a manually-created team
 * can never collide with a row `FootballSyncService` upserts.
 */
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
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
