/**
 * `LeaguesService.getChampionshipStatuses()`'s return shape — the
 * admin-dashboard counterpart to `AvailableLeague`: same current-season
 * `TeamLeagueSeason` grouping, but includes the season's own status fields
 * (`currentMatchday`/dates) that a player-facing list has no use for.
 * Exposed over HTTP via `GET /admin/dashboard`.
 */
export type ChampionshipStatus = {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  currentMatchday: number;
  startDate: string;
  endDate: string;
  teamCount: number;
};
