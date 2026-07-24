/**
 * Wires the leagues feature (read-only lookup of championships available to
 * predict on, currently just `GET /leagues`) into the app. `PrismaService`
 * is available globally via `PrismaModule`, so no extra imports are needed
 * here. Split out of `PredictionsModule` since it's a distinct resource
 * (league/season lookup vs. saving a player's own predictions) that other
 * features (e.g. a future admin `/admin/seasons`) may also need.
 */
import { Module } from '@nestjs/common';
import { LeaguesController } from './leagues.controller';
import { LeaguesService } from './leagues.service';

@Module({
  controllers: [LeaguesController],
  providers: [LeaguesService],
})
export class LeaguesModule {}
