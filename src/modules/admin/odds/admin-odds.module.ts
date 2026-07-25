/**
 * Wires `AdminOddsController` to `AdminOddsService`. `PrismaService` is
 * global (`PrismaModule`), so no extra imports are needed for it.
 */
import { Module } from '@nestjs/common';
import { AdminOddsController } from './admin-odds.controller';
import { AdminOddsService } from './admin-odds.service';

@Module({
  controllers: [AdminOddsController],
  providers: [AdminOddsService],
})
export class AdminOddsModule {}
