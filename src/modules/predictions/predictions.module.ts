/**
 * Wires the predictions feature (draft/submit standings predictions, plus
 * the `/predictions` hub's league listing and league detail) into the app.
 * `PrismaService` is available globally via `PrismaModule`, so no extra
 * imports are needed for it. Imports `LeaguesModule` for `LeaguesService` —
 * league/team lookup stays a separate service (other features, e.g. a
 * future admin `/admin/seasons`, may also need it), but its HTTP surface now
 * lives entirely under `/predictions/leagues*` here rather than its own
 * controller, since every consumer of that data is a player predicting.
 */
import { Module } from '@nestjs/common';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { LeaguesModule } from '../leagues/leagues.module';

@Module({
  imports: [LeaguesModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
