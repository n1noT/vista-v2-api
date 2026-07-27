/**
 * `LeaderboardService.getLeaderboard()`'s return shape: one entry per player
 * who has at least one `SUBMITTED` prediction (in scope for the requested
 * filter), sorted by `totalPoints` descending. `rank` uses standard
 * competition ranking (ties share a rank, e.g. 1, 2, 2, 4) rather than a
 * plain array index, since points totals collide often at low team counts.
 * `totalPoints` is either the global sum across every league (no `leagueId`
 * filter) or that single league's sum, per `GET /leaderboard?leagueId=`.
 */
export type LeaderboardEntry = {
  userId: string;
  pseudo: string;
  avatarUrl: string | null;
  totalPoints: number;
  rank: number;
};
