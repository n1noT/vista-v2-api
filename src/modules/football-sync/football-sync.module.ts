/**
 * Wires the football-data.org sync into the app: the daily cron job
 * (`FootballSyncService`) plus the HTTP client it depends on
 * (`FootballDataClient`). `HttpModule.register` sets a request timeout so a
 * stalled football-data.org response can't hang the cron job indefinitely.
 * `ScheduleModule.forRoot()` itself lives in AppModule since it's global and
 * only needs registering once app-wide.
 *
 * Imports `AdminResultsModule` so `FootballSyncService` can trigger points
 * recalculation for each league/season right after syncing its standings.
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FootballSyncService } from './football-sync.service';
import { FootballDataClient } from './football-data.client';
import { AdminResultsModule } from '../admin/results/admin-results.module';

@Module({
  imports: [HttpModule.register({ timeout: 10000 }), AdminResultsModule],
  providers: [FootballSyncService, FootballDataClient],
  exports: [FootballSyncService],
})
export class FootballSyncModule {}
