import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AvailableLeague } from './types/available-league.type';
import { LeagueDetail } from './types/league-detail.type';
import { ChampionshipStatus } from './types/championship-status.type';

@Injectable()
export class LeaguesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Leagues a player can currently predict on: one row per current season
   * with `TeamLeagueSeason` data, keyed off `Season.isCurrent` (set by
   * `FootballSyncService` on every sync run). A `Season` belongs to exactly
   * one `League` (`Season.leagueId`), so grouping by `seasonId` alone is
   * enough — `teamCount` comes back in the same call instead of a second
   * round-trip per league.
   */
  async getAvailableLeagues(): Promise<AvailableLeague[]> {
    const groups = await this.prisma.teamLeagueSeason.groupBy({
      by: ['seasonId'],
      where: { season: { isCurrent: true } },
      _count: { _all: true },
    });

    if (groups.length === 0) {
      return [];
    }

    const seasons = await this.prisma.season.findMany({
      where: { id: { in: groups.map((g) => g.seasonId) } },
      include: { league: true },
    });
    const seasonById = new Map(seasons.map((season) => [season.id, season]));

    return groups.map((group) => {
      const season = seasonById.get(group.seasonId);
      return {
        leagueId: season?.leagueId ?? 0,
        seasonId: group.seasonId,
        leagueName: season?.league.name ?? '',
        leagueLogoUrl: season?.league.logoUrl ?? null,
        teamCount: group._count._all,
      };
    });
  }

  /**
   * Backs `GET /admin/dashboard`'s "statuts des championnats" section
   * (`Arborescence_Pages.md`). Same current-season `TeamLeagueSeason`
   * grouping as `getAvailableLeagues`, but also pulls each season's
   * `currentMatchday`/`startDate`/`endDate` — status fields an admin
   * overview needs that the player-facing list has no use for. Empty until
   * `FootballSyncService` has run at least once.
   */
  async getChampionshipStatuses(): Promise<ChampionshipStatus[]> {
    const groups = await this.prisma.teamLeagueSeason.groupBy({
      by: ['seasonId'],
      where: { season: { isCurrent: true } },
      _count: { _all: true },
    });

    if (groups.length === 0) {
      return [];
    }

    const seasons = await this.prisma.season.findMany({
      where: { id: { in: groups.map((g) => g.seasonId) } },
      include: { league: true },
    });
    const seasonById = new Map(seasons.map((season) => [season.id, season]));

    return groups.map((group) => {
      const season = seasonById.get(group.seasonId);
      return {
        leagueId: season?.leagueId ?? 0,
        leagueName: season?.league.name ?? '',
        leagueLogoUrl: season?.league.logoUrl ?? null,
        seasonId: group.seasonId,
        currentMatchday: season?.currentMatchday ?? 0,
        startDate: season?.startDate.toISOString() ?? '',
        endDate: season?.endDate.toISOString() ?? '',
        teamCount: group._count._all,
      };
    });
  }

  /**
   * Backs `GET /predictions/leagues/:leagueId` — the full team list for a league's
   * current season, sorted by real current position, plus the `seasonId`
   * the front needs on every `/predictions/*` write. Each `Season` belongs
   * to exactly one `League` (`Season.leagueId`), so "current" is resolved
   * by filtering `TeamLeagueSeason` through its `season.leagueId` relation —
   * same as `getAvailableLeagues` — not via a global `season.findFirst`.
   * Returns `null` (the controller turns that into a 404) if the league
   * doesn't exist or has no `TeamLeagueSeason` rows for its current season,
   * e.g. before the daily sync has run.
   */
  async getLeagueDetail(leagueId: number): Promise<LeagueDetail | null> {
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
    });
    if (!league) {
      return null;
    }

    const participations = await this.prisma.teamLeagueSeason.findMany({
      where: { season: { leagueId, isCurrent: true } },
      include: { team: true, season: true },
      orderBy: { position: 'asc' },
    });
    if (participations.length === 0) {
      return null;
    }

    const season = participations[0].season;

    return {
      leagueId: league.id,
      leagueName: league.name,
      leagueLogoUrl: league.logoUrl,
      seasonId: season.id,
      seasonStartDate: season.startDate.toISOString(),
      teams: participations.map((participation) => ({
        teamId: participation.teamId,
        name: participation.team.name,
        logoUrl: participation.team.logoUrl,
        position: participation.position,
      })),
    };
  }
}
