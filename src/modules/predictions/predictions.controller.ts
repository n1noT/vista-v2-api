import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { PredictionState } from '../../../generated/prisma/client';
import { CUPredictionsDto } from './dto/cu-prediction.dto';
import { GetPredictionQueryDto } from './dto/get-prediction-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PredictionsService } from './predictions.service';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get()
  findOwn(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetPredictionQueryDto,
  ) {
    return this.predictionsService.findOwn(
      user.id,
      query.leagueId,
      query.seasonId,
    );
  }

  @Post('draft')
  saveDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CUPredictionsDto,
  ) {
    return this.predictionsService.save(user.id, body, PredictionState.DRAFT);
  }

  @Post('submit')
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CUPredictionsDto,
  ) {
    return this.predictionsService.save(
      user.id,
      body,
      PredictionState.SUBMITTED,
    );
  }
}
