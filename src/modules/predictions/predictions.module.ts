/**
 * Wires the predictions feature (draft/submit standings predictions) into
 * the app. `PrismaService` is available globally via `PrismaModule`, so no
 * extra imports are needed here.
 */
import { Module } from '@nestjs/common';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';

@Module({
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
