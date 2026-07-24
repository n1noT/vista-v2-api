/**
 * Query params for `GET /predictions` — `leagueId`/`seasonId` identify which
 * championship's prediction to fetch for the current user. `@Type(() =>
 * Number)` is required because query-string values arrive as strings; the
 * app-wide `ValidationPipe({ transform: true })` in `main.ts` is what
 * actually applies the coercion.
 */
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetPredictionQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  leagueId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  seasonId!: number;
}
