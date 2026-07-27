/**
 * Query params for `GET /leaderboard`. `leagueId` is optional — omitted
 * means the global ranking (cumulative points across every league the
 * player has a submitted prediction in); present means the ranking scoped
 * to that one league, per `Fonctionnalites_Joueurs.md`'s "trier le
 * classement par championnat". `@Type(() => Number)` + the app-wide
 * `ValidationPipe({ transform: true })` (`main.ts`) coerce the query string
 * to a number before validation runs.
 */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetLeaderboardQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  leagueId?: number;
}
