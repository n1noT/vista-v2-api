/**
 * Wires the football-data.org sync into the app: the daily cron job
 * (`FootballSyncService`) plus the HTTP client it depends on
 * (`FootballDataClient`). `HttpModule.register` sets a request timeout so a
 * stalled football-data.org response can't hang the cron job indefinitely.
 * `ScheduleModule.forRoot()` itself lives in AppModule since it's global and
 * only needs registering once app-wide.
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FootballSyncService } from './football-sync.service';
import { FootballDataClient } from './football-data.client';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  providers: [FootballSyncService, FootballDataClient],
  exports: [FootballSyncService],
})
export class FootballSyncModule {}
