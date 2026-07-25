/**
 * Umbrella module for the `/admin/*` surface: players management
 * (`AdminUsersModule`) and the dashboard overview (`AdminDashboardModule`).
 * Future admin areas from `Fonctionnalites_Admin.md` (seasons, teams, odds,
 * LDC results) get added here as their own submodules rather than growing
 * this file's own logic.
 */
import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';

@Module({
  imports: [AdminUsersModule, AdminDashboardModule],
})
export class AdminModule {}
