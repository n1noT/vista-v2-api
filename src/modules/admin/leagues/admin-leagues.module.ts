/**
 * Wires `AdminLeaguesController` to `AdminLeaguesService`. `PrismaService`
 * is global (`PrismaModule`), so no extra imports are needed for it.
 */
import { Module } from '@nestjs/common';
import { AdminLeaguesController } from './admin-leagues.controller';
import { AdminLeaguesService } from './admin-leagues.service';

@Module({
  controllers: [AdminLeaguesController],
  providers: [AdminLeaguesService],
})
export class AdminLeaguesModule {}
