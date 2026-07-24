/**
 * Shape returned by `GET /leagues/:leagueId`: everything the front's
 * `/predictions/league/[id]` page needs in one round-trip — the
 * league's current-season `id` (`predictions.service.ts` requires both
 * `leagueId` and `seasonId` on save) plus the full team list to seed the
 * `DraggableLeagueTable`'s initial order. `teams` is sorted by the team's
 * *real* current `position` (`TeamLeagueSeason.position`, kept fresh by
 * `FootballSyncService`) purely as a sane drag-and-drop starting point for
 * the player — it carries no other meaning here, and there is no bookmaker
 * "cote" per position yet (that needs the odds engine from
 * `vista-v2-docs/03_Architecture_technique/Calcul_Cotes.md`, not modeled in
 * the schema yet), so the front can't render that column until it exists.
 */
export type LeagueTeamStanding = {
  teamId: number;
  name: string;
  logoUrl: string | null;
  position: number;
};

export type LeagueDetail = {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  seasonStartDate: string;
  teams: LeagueTeamStanding[];
};
