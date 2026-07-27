/**
 * Wires `AdminResultsController` to `AdminResultsService`. `PrismaService`
 * is global (`PrismaModule`), so no extra imports are needed for it.
 * Exports `AdminResultsService` so `FootballSyncModule` can reuse it to
 * recalculate points right after a sync updates real standings.
 */
import { Module } from '@nestjs/common';
import { AdminResultsController } from './admin-results.controller';
import { AdminResultsService } from './admin-results.service';

@Module({
  controllers: [AdminResultsController],
  providers: [AdminResultsService],
  exports: [AdminResultsService],
})
export class AdminResultsModule {}
