import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PredictionState } from '../../../generated/prisma/client';
import { CUPredictionsDto } from './dto/cu-prediction.dto';
import { GetPredictionQueryDto } from './dto/get-prediction-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PredictionsService } from './predictions.service';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('leagues')
  getAvailableLeagues(@CurrentUser() user: AuthenticatedUser) {
    return this.predictionsService.getAvailableLeagues(user.id);
  }

  @Get('leagues/:leagueId')
  getLeagueDetail(@Param('leagueId', ParseIntPipe) leagueId: number) {
    return this.predictionsService.getLeagueDetail(leagueId);
  }

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
