/**
 * Seeds/refreshes League, Season, Team, and TeamLeagueSeason rows from
 * football-data.org standings. Runs once a day via `@nestjs/schedule`
 * (`handleCron`) and is also exposed as a plain method (`syncAll`) so a
 * future admin "force sync" endpoint can trigger the same logic on demand
 * without duplicating it.
 *
 * One `getStandings` call per league returns competition + season + the
 * full table in a single response, so a full run is 5 HTTP calls total —
 * well under football-data.org's 10 req/min free-tier limit.
 *
 * Upserts are keyed on the `externalId` fields added to Team/League/Season
 * (see prisma/schema.prisma) rather than matching by name, so this can
 * re-run daily without creating duplicates or breaking on a renamed team.
 * One league fetch failing (network error, unknown code, etc.) is logged
 * and skipped rather than aborting the whole run — the other leagues should
 * still sync.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { FootballDataClient } from './football-data.client';
import { SYNCED_COMPETITION_CODES } from './constants';
import { FootballDataStandingsResponse } from './types/football-data.types';

@Injectable()
export class FootballSyncService {
  private readonly logger = new Logger(FootballSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly client: FootballDataClient,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    await this.syncAll();
  }

  async syncAll(): Promise<void> {
    if (!this.client.isConfigured()) {
      this.logger.warn(
        'FOOTBALL_DATA_API_KEY is not set — skipping football-data sync.',
      );
      return;
    }

    for (const code of SYNCED_COMPETITION_CODES) {
      try {
        const standings = await this.client.getStandings(code);
        await this.syncLeague(standings);
        this.logger.log(`Synced ${code} (${standings.competition.name}).`);
      } catch (error) {
        this.logger.error(
          `Failed to sync competition ${code}: ${(error as Error).message}`,
        );
      }
    }
  }

  private async syncLeague(data: FootballDataStandingsResponse): Promise<void> {
    const table = data.standings.find((s) => s.type === 'TOTAL')?.table ?? [];

    await this.prisma.$transaction(async (tx) => {
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
          startDate: new Date(data.season.startDate),
          endDate: new Date(data.season.endDate),
          currentMatchday: data.season.currentMatchday,
          isCurrent: true,
        },
        create: {
          externalId: data.season.id,
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
            teamId_leagueId_seasonId: {
              teamId: team.id,
              leagueId: league.id,
              seasonId: season.id,
            },
          },
          update: { position: row.position, playedGames: row.playedGames },
          create: {
            teamId: team.id,
            leagueId: league.id,
            seasonId: season.id,
            position: row.position,
            playedGames: row.playedGames,
          },
        });
      }
    });
  }
}
