/**
 * Validated body for `POST /admin/seasons/:id/teams` — adds a team to this
 * season, i.e. creates a `TeamLeagueSeason` row. The season comes from the
 * route param and already implies its league (`Season.leagueId`), so there
 * is no separate `leagueId` to supply here — unlike before, it's not
 * possible to attach a team to the "wrong" league for a season.
 */
import { IsInt, Min } from 'class-validator';

export class AddTeamToSeasonDto {
  @IsInt()
  @Min(1)
  teamId!: number;

  @IsInt()
  @Min(1)
  position!: number;

  @IsInt()
  @Min(0)
  playedGames!: number;
}
