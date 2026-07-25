/**
 * Validated body for `POST /admin/seasons/:id/teams` — adds a team to this
 * season for a given league, i.e. creates a `TeamLeagueSeason` row. The
 * season itself comes from the route param; `leagueId` still has to be
 * supplied here since a `Season` row isn't tied to one league in the schema
 * (see `AdminSeasonsService`'s header comment).
 */
import { IsInt, Min } from 'class-validator';

export class AddTeamToSeasonDto {
  @IsInt()
  @Min(1)
  teamId!: number;

  @IsInt()
  @Min(1)
  leagueId!: number;

  @IsInt()
  @Min(1)
  position!: number;

  @IsInt()
  @Min(0)
  playedGames!: number;
}
