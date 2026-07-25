/**
 * Umbrella module for the `/admin/*` surface: players management
 * (`AdminUsersModule`), the dashboard overview (`AdminDashboardModule`),
 * editing any player's standings prediction (`AdminPredictionsModule`),
 * team/championship/season management (`AdminTeamsModule`/
 * `AdminLeaguesModule`/`AdminSeasonsModule`), forcing a football-data.org
 * sync on demand (`AdminSyncModule`), editing bookmaker odds
 * (`AdminOddsModule`), and manually triggering points calculation
 * (`AdminResultsModule`) per `Fonctionnalites_Admin.md`.
 */
import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminPredictionsModule } from './predictions/admin-predictions.module';
import { AdminTeamsModule } from './teams/admin-teams.module';
import { AdminLeaguesModule } from './leagues/admin-leagues.module';
import { AdminSeasonsModule } from './seasons/admin-seasons.module';
import { AdminSyncModule } from './sync/admin-sync.module';
import { AdminOddsModule } from './odds/admin-odds.module';
import { AdminResultsModule } from './results/admin-results.module';

@Module({
  imports: [
    AdminUsersModule,
    AdminDashboardModule,
    AdminPredictionsModule,
    AdminTeamsModule,
    AdminLeaguesModule,
    AdminSeasonsModule,
    AdminSyncModule,
    AdminOddsModule,
    AdminResultsModule,
  ],
})
export class AdminModule {}
