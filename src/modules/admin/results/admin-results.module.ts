/**
 * Wires `AdminResultsController` to `AdminResultsService`. `PrismaService`
 * is global (`PrismaModule`), so no extra imports are needed for it.
 */
import { Module } from '@nestjs/common';
import { AdminResultsController } from './admin-results.controller';
import { AdminResultsService } from './admin-results.service';

@Module({
  controllers: [AdminResultsController],
  providers: [AdminResultsService],
})
export class AdminResultsModule {}
