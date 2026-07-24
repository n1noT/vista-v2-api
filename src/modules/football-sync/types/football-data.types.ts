/**
 * Minimal shape of the football-data.org v4 `/competitions/{code}/standings`
 * response — only the fields FootballSyncService actually reads. Not a full
 * mirror of the API's schema; extend as more of the response is consumed.
 */
export interface FootballDataCompetition {
  id: number;
  name: string;
  emblem: string | null;
}

export interface FootballDataSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
}

export interface FootballDataTeam {
  id: number;
  name: string;
  crest: string | null;
}

export interface FootballDataStandingTableRow {
  position: number;
  team: FootballDataTeam;
  playedGames: number;
}

export interface FootballDataStanding {
  type: 'TOTAL' | 'HOME' | 'AWAY';
  table: FootballDataStandingTableRow[];
}

export interface FootballDataStandingsResponse {
  competition: FootballDataCompetition;
  season: FootballDataSeason;
  standings: FootballDataStanding[];
}
