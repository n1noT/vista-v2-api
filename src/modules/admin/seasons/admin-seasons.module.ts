/**
 * Wires `AdminSeasonsController` to `AdminSeasonsService`. `PrismaService`
 * is global (`PrismaModule`), so no extra imports are needed for it.
 */
import { Module } from '@nestjs/common';
import { AdminSeasonsController } from './admin-seasons.controller';
import { AdminSeasonsService } from './admin-seasons.service';

@Module({
  controllers: [AdminSeasonsController],
  providers: [AdminSeasonsService],
})
export class AdminSeasonsModule {}
