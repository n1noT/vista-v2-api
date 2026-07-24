import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AvailableLeague } from './types/available-league.type';
import { LeagueDetail } from './types/league-detail.type';

@Injectable()
export class LeaguesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Leagues a player can currently predict on: one row per league/season
   * pair with `TeamLeagueSeason` data for the current season, keyed off
   * `Season.isCurrent` (set by `FootballSyncService` on every sync run).
   * Grouped rather than a plain `findMany` so `teamCount` comes back in the
   * same call instead of a second round-trip per league.
   */
  async getAvailableLeagues(): Promise<AvailableLeague[]> {
    const groups = await this.prisma.teamLeagueSeason.groupBy({
      by: ['leagueId', 'seasonId'],
      where: { season: { isCurrent: true } },
      _count: { _all: true },
    });

    if (groups.length === 0) {
      return [];
    }

    const leagues = await this.prisma.league.findMany({
      where: { id: { in: groups.map((g) => g.leagueId) } },
    });
    const leagueById = new Map(leagues.map((league) => [league.id, league]));

    return groups.map((group) => {
      const league = leagueById.get(group.leagueId);
      return {
        leagueId: group.leagueId,
        seasonId: group.seasonId,
        leagueName: league?.name ?? '',
        leagueLogoUrl: league?.logoUrl ?? null,
        teamCount: group._count._all,
      };
    });
  }

  /**
   * Backs `GET /leagues/:leagueId` — the full team list for a league's
   * current season, sorted by real current position, plus the `seasonId`
   * the front needs on every `/predictions/*` write. `Season` isn't shared
   * across leagues (each league's `TeamLeagueSeason` rows point at their own
   * `Season`, since football-data.org season ids differ per competition), so
   * "current" must be resolved through the `leagueId`-scoped relation here —
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
      where: { leagueId, season: { isCurrent: true } },
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
