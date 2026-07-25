/**
 * Umbrella module for the `/admin/*` surface: players management
 * (`AdminUsersModule`), the dashboard overview (`AdminDashboardModule`),
 * editing any player's standings prediction (`AdminPredictionsModule`),
 * team/championship/season management (`AdminTeamsModule`/
 * `AdminLeaguesModule`/`AdminSeasonsModule`), and forcing a football-data.org
 * sync on demand (`AdminSyncModule`). Future admin areas from
 * `Fonctionnalites_Admin.md` (odds, LDC results) get added here as their
 * own submodules rather than growing this file's own logic.
 */
import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminPredictionsModule } from './predictions/admin-predictions.module';
import { AdminTeamsModule } from './teams/admin-teams.module';
import { AdminLeaguesModule } from './leagues/admin-leagues.module';
import { AdminSeasonsModule } from './seasons/admin-seasons.module';
import { AdminSyncModule } from './sync/admin-sync.module';

@Module({
  imports: [
    AdminUsersModule,
    AdminDashboardModule,
    AdminPredictionsModule,
    AdminTeamsModule,
    AdminLeaguesModule,
    AdminSeasonsModule,
    AdminSyncModule,
  ],
})
export class AdminModule {}
