/**
 * Wires `AdminTeamsController` to `AdminTeamsService`. `PrismaService` is
 * global (`PrismaModule`), so no extra imports are needed for it.
 */
import { Module } from '@nestjs/common';
import { AdminTeamsController } from './admin-teams.controller';
import { AdminTeamsService } from './admin-teams.service';

@Module({
  controllers: [AdminTeamsController],
  providers: [AdminTeamsService],
})
export class AdminTeamsModule {}
