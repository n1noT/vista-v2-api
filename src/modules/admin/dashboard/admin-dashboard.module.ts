/**
 * Wires `AdminDashboardController` to `UsersService` and `LeaguesService` —
 * imports their owning modules rather than duplicating Prisma access, same
 * pattern as `AdminUsersModule`.
 */
import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { LeaguesModule } from '../../leagues/leagues.module';
import { AdminDashboardController } from './admin-dashboard.controller';

@Module({
  imports: [UsersModule, LeaguesModule],
  controllers: [AdminDashboardController],
})
export class AdminDashboardModule {}
