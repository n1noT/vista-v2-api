/**
 * `GET /leaderboard` — player rankings, backing the `/leaderboard` page's
 * global view and its per-competition tabs (`?leagueId=`). No class-level
 * guard needed: `JwtAuthGuard` is global (`app.module.ts`), so any logged-in
 * player can view it, and no `@CurrentUser()` is required either — the
 * ranking itself is the same for everyone, it's not scoped to the caller.
 */
import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { GetLeaderboardQueryDto } from './dto/get-leaderboard-query.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getLeaderboard(@Query() query: GetLeaderboardQueryDto) {
    return this.leaderboardService.getLeaderboard(query.leagueId);
  }
}
