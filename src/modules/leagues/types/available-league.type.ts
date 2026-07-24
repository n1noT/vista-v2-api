/**
 * Shape returned by `GET /leagues`: one entry per league that has
 * `TeamLeagueSeason` rows for the current season, i.e. a championship the
 * front's `/predictions` hub can link a player into. `teamCount` lets the
 * hub display "18 clubs" etc. without a second round-trip.
 */
export type AvailableLeague = {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  teamCount: number;
};
