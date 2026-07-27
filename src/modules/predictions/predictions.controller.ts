/**
 * Player-facing `/predictions/*` routes: the hub's league listing
 * (`leagues`), a league's team list (`leagues/:leagueId`), the caller's own
 * grid (bare `GET`), saving it (`draft`/`submit`), and reading another
 * player's grid subject to the mutual-submission visibility rule
 * (`users/:userId` — see `PredictionsService.getPublicPredictions`, backing
 * `/profile/:id`). All logic lives in `PredictionsService`; this stays thin.
 */
import {
  Controller,
  Post,
  Get,
  Body,
  NotFoundException,
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
import { UsersService } from '../users/users.service';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('leagues')
  getAvailableLeagues(@CurrentUser() user: AuthenticatedUser) {
    return this.predictionsService.getAvailableLeagues(user.id);
  }

  @Get('leagues/:leagueId')
  getLeagueDetail(@Param('leagueId', ParseIntPipe) leagueId: number) {
    return this.predictionsService.getLeagueDetail(leagueId);
  }

  @Get('users/:userId')
  async getPublicPredictions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') targetUserId: string,
  ) {
    const target = await this.usersService.findById(targetUserId);
    if (!target) {
      throw new NotFoundException('Player not found.');
    }
    return this.predictionsService.getPublicPredictions(user.id, targetUserId);
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
