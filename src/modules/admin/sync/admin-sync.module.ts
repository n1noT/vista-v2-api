/**
 * Wires `AdminSyncController` to `FootballSyncService` — imports
 * `FootballSyncModule` (which already exports the service for exactly this
 * kind of reuse) rather than duplicating the sync logic.
 */
import { Module } from '@nestjs/common';
import { FootballSyncModule } from '../../football-sync/football-sync.module';
import { AdminSyncController } from './admin-sync.controller';

@Module({
  imports: [FootballSyncModule],
  controllers: [AdminSyncController],
})
export class AdminSyncModule {}
