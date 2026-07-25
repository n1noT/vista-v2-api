/**
 * Validated body for `PATCH /admin/odds/:participationId` — the only field an
 * admin ever sets on a `TeamLeagueSeason` row for odds purposes: `expectedPosition`
 * ("F" in Calcul_Cotes.md). It's a `number` (not `IsInt`) because tied bookmaker
 * odds resolve to an averaged position (e.g. 3.5 for two teams tied for 3rd) —
 * see `Calcul_Cotes.md`. Upper-bound (`<= N` teams in the season) is checked in
 * `AdminOddsService` since it depends on how many teams are in that season.
 */
import { IsNumber, Min } from 'class-validator';

export class UpdateOddsDto {
  @IsNumber()
  @Min(1)
  expectedPosition: number;
}
