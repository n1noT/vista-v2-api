/**
 * Shape returned by `GET /predictions/leagues/:leagueId`: everything the front's
 * `/predictions/league/[id]` page needs in one round-trip — the
 * league's current-season `id` (`predictions.service.ts` requires both
 * `leagueId` and `seasonId` on save) plus the full team list to seed the
 * `DraggableLeagueTable`'s initial order. `teams` is sorted by the team's
 * *real* current `position` (`TeamLeagueSeason.position`, kept fresh by
 * `FootballSyncService`) purely as a sane drag-and-drop starting point for
 * the player — it carries no other meaning here. `expectedPosition` ("F"
 * from `Calcul_Cotes.md`, admin-edited via `/admin/odds`) is nullable —
 * not every team has odds set — and lets the front render a potential-points
 * preview per placement in `DraggableLeagueTable`.
 */
export type LeagueTeamStanding = {
  teamId: number;
  name: string;
  logoUrl: string | null;
  position: number;
  expectedPosition: number | null;
};

export type LeagueDetail = {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  seasonStartDate: string;
  teams: LeagueTeamStanding[];
};
