/**
 * Wires `AdminPredictionsController` to `PredictionsService` and
 * `UsersService` — imports their owning modules rather than duplicating
 * Prisma access, same pattern as `AdminUsersModule`/`AdminDashboardModule`.
 */
import { Module } from '@nestjs/common';
import { PredictionsModule } from '../../predictions/predictions.module';
import { UsersModule } from '../../users/users.module';
import { AdminPredictionsController } from './admin-predictions.controller';

@Module({
  imports: [PredictionsModule, UsersModule],
  controllers: [AdminPredictionsController],
})
export class AdminPredictionsModule {}
