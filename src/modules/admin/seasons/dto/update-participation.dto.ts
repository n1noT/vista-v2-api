/**
 * Validated body for `PATCH /admin/seasons/:id/teams/:participationId` —
 * editing a `TeamLeagueSeason` row's standings data. `teamId` isn't
 * editable here (the `@@unique([teamId, seasonId])` constraint makes that
 * effectively a different row — remove and re-add instead).
 */
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateParticipationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  playedGames?: number;
}
