/**
 * Wires the player-facing `/leaderboard` endpoint into the app. Reads only
 * (`Prediction`/`User` via the globally-available `PrismaService`), so no
 * other feature module needs importing here — unlike `PredictionsModule`,
 * which needs `LeaguesModule` for team/season lookups this feature doesn't
 * touch.
 */
import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
