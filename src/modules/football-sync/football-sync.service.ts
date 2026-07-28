/**
 * Seeds/refreshes League, Season, Team, and TeamLeagueSeason rows from
 * football-data.org standings. Runs once a day via `@nestjs/schedule`
 * (`handleCron`) and is also exposed as a plain method (`syncAll`) so the
 * admin "force sync" endpoint (`AdminSyncController`, `POST /admin/sync`)
 * can trigger the same logic on demand without duplicating it — `handleCron`
 * just calls `syncAll()` and discards the result, same as before.
 *
 * One `getStandings` call per league returns competition + season + the
 * full table in a single response, so a full run is 5 HTTP calls total —
 * well under football-data.org's 10 req/min free-tier limit.
 *
 * Upserts are keyed on the `externalId` fields added to Team/League/Season
 * (see prisma/schema.prisma) rather than matching by name, so this can
 * re-run daily without creating duplicates or breaking on a renamed team.
 * One league fetch failing (network error, unknown code, etc.) is logged
 * *and* recorded in `syncAll`'s returned `SyncResult` rather than aborting
 * the whole run — the other leagues should still sync.
 *
 * After each league's standings sync, `recalculatePoints` reuses
 * `AdminResultsService.calculate()` (the same logic behind the admin's
 * manual "recalculate points" button) so `Prediction.points` stays current
 * with real-world results without waiting for an admin to trigger it by
 * hand. A season missing `expectedPosition` odds for some team (thrown by
 * `calculate` as a `BadRequestException`) is treated as "nothing to score
 * yet", not a sync failure — most seasons won't have odds set until closer
 * to kickoff.
 */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { FootballDataClient } from './football-data.client';
import { SYNCED_COMPETITION_CODES } from './constants';
import { FootballDataStandingsResponse } from './types/football-data.types';
import { SyncResult } from './types/sync-result.type';
import { AdminResultsService } from '../admin/results/admin-results.service';

@Injectable()
export class FootballSyncService {
  private readonly logger = new Logger(FootballSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly client: FootballDataClient,
    private readonly adminResultsService: AdminResultsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    await this.syncAll();
  }

  async syncAll(): Promise<SyncResult> {
    if (!this.client.isConfigured()) {
      this.logger.warn(
        'FOOTBALL_DATA_API_KEY is not set — skipping football-data sync.',
      );
      return { configured: false, synced: [], failed: [] };
    }

    const result: SyncResult = { configured: true, synced: [], failed: [] };

    for (const code of SYNCED_COMPETITION_CODES) {
      try {
        const standings = await this.client.getStandings(code);
        const { leagueId, seasonId } = await this.syncLeague(standings);
        this.logger.log(`Synced ${code} (${standings.competition.name}).`);
        const pointsCalculated = await this.recalculatePoints(
          leagueId,
          seasonId,
        );
        result.synced.push({
          code,
          competitionName: standings.competition.name,
          pointsCalculated,
        });
      } catch (error) {
        const message = (error as Error).message;
        this.logger.error(`Failed to sync competition ${code}: ${message}`);
        result.failed.push({ code, error: message });
      }
    }

    return result;
  }

  /**
   * Wraps `AdminResultsService.calculate` so a season with no odds set yet
   * (or no teams) skips scoring instead of failing the sync that just ran.
   */
  private async recalculatePoints(
    leagueId: number,
    seasonId: number,
  ): Promise<number | null> {
    try {
      const { predictionsScored } = await this.adminResultsService.calculate(
        leagueId,
        seasonId,
      );
      return predictionsScored;
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(
          `Skipped points calculation for league ${leagueId}/season ${seasonId}: ${(error as Error).message}`,
        );
        return null;
      }
      this.logger.error(
        `Points calculation failed for league ${leagueId}/season ${seasonId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async syncLeague(
    data: FootballDataStandingsResponse,
  ): Promise<{ leagueId: number; seasonId: number }> {
    const table = data.standings.find((s) => s.type === 'TOTAL')?.table ?? [];

    return this.prisma.$transaction(
      async (tx) => {
        const league = await tx.league.upsert({
          where: { externalId: data.competition.id },
          update: {
            name: data.competition.name,
            logoUrl: data.competition.emblem,
          },
          create: {
            externalId: data.competition.id,
            name: data.competition.name,
            logoUrl: data.competition.emblem,
          },
        });

        const season = await tx.season.upsert({
          where: { externalId: data.season.id },
          update: {
            leagueId: league.id,
            startDate: new Date(data.season.startDate),
            endDate: new Date(data.season.endDate),
            currentMatchday: data.season.currentMatchday,
            isCurrent: true,
          },
          create: {
            externalId: data.season.id,
            leagueId: league.id,
            startDate: new Date(data.season.startDate),
            endDate: new Date(data.season.endDate),
            currentMatchday: data.season.currentMatchday,
            isCurrent: true,
          },
        });

        for (const row of table) {
          const team = await tx.team.upsert({
            where: { externalId: row.team.id },
            update: { name: row.team.name, logoUrl: row.team.crest },
            create: {
              externalId: row.team.id,
              name: row.team.name,
              logoUrl: row.team.crest,
            },
          });

          await tx.teamLeagueSeason.upsert({
            where: {
              teamId_seasonId: {
                teamId: team.id,
                seasonId: season.id,
              },
            },
            update: { position: row.position, playedGames: row.playedGames },
            create: {
              teamId: team.id,
              seasonId: season.id,
              position: row.position,
              playedGames: row.playedGames,
            },
          });
        }

        return { leagueId: league.id, seasonId: season.id };
      },
      { timeout: 30000 }
    );
  }
}
