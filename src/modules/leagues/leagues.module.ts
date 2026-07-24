/**
 * Wires up `LeaguesService` (read-only lookup of championships/teams for the
 * current season) with no HTTP surface of its own — every consumer so far
 * is `PredictionsController` (`/predictions/leagues*`), which imports this
 * module for the service. Kept as its own module rather than folded into
 * `PredictionsModule` since it's a distinct resource (league/season lookup
 * vs. saving a player's own predictions) that other features (e.g. a future
 * admin `/admin/seasons`) may also need. `PrismaService` is available
 * globally via `PrismaModule`, so no extra imports are needed here.
 */
import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';

@Module({
  providers: [LeaguesService],
  exports: [LeaguesService],
})
export class LeaguesModule {}
