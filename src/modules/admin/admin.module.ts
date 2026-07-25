/**
 * Umbrella module for the `/admin/*` surface: players management
 * (`AdminUsersModule`), the dashboard overview (`AdminDashboardModule`), and
 * editing any player's standings prediction (`AdminPredictionsModule`).
 * Future admin areas from `Fonctionnalites_Admin.md` (seasons, teams, odds,
 * LDC results) get added here as their own submodules rather than growing
 * this file's own logic.
 */
import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminPredictionsModule } from './predictions/admin-predictions.module';

@Module({
  imports: [AdminUsersModule, AdminDashboardModule, AdminPredictionsModule],
})
export class AdminModule {}
