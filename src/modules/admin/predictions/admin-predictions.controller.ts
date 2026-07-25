/**
 * `/admin/users/:userId/predictions*` — lets an admin view and edit any
 * player's standings prediction, per `Fonctionnalites_Admin.md`'s "L'admin
 * peut modifier la prédiction d'un joueur, même si la prédiction est
 * soumise." Mirrors `PredictionsController`'s routes/shape exactly
 * (`leagues`, the bare `findOwn` getter, `draft`/`submit`) but parameterized
 * by `:userId` from the route instead of `@CurrentUser()`, and passes
 * `{ bypassSubmittedLock: true }` into `PredictionsService.save` so an
 * already-submitted grid can still be overwritten — the one behavioral
 * difference from the player-facing routes.
 *
 * Every handler 404s up front if `:userId` doesn't name a real user, so a
 * typo'd id fails clearly instead of `PredictionsService.save` hitting a
 * Prisma FK violation on `Prediction.userId` deeper in the call.
 */
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PredictionsService } from '../../predictions/predictions.service';
import { UsersService } from '../../users/users.service';
import { CUPredictionsDto } from '../../predictions/dto/cu-prediction.dto';
import { GetPredictionQueryDto } from '../../predictions/dto/get-prediction-query.dto';
import { PredictionState, Role } from '../../../../generated/prisma/client';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users/:userId/predictions')
export class AdminPredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('leagues')
  async getAvailableLeagues(@Param('userId') userId: string) {
    await this.assertUserExists(userId);
    return this.predictionsService.getAvailableLeagues(userId);
  }

  @Get()
  async findOwn(
    @Param('userId') userId: string,
    @Query() query: GetPredictionQueryDto,
  ) {
    await this.assertUserExists(userId);
    return this.predictionsService.findOwn(
      userId,
      query.leagueId,
      query.seasonId,
    );
  }

  @Post('draft')
  async saveDraft(
    @Param('userId') userId: string,
    @Body() body: CUPredictionsDto,
  ) {
    await this.assertUserExists(userId);
    return this.predictionsService.save(userId, body, PredictionState.DRAFT, {
      bypassSubmittedLock: true,
    });
  }

  @Post('submit')
  async submit(
    @Param('userId') userId: string,
    @Body() body: CUPredictionsDto,
  ) {
    await this.assertUserExists(userId);
    return this.predictionsService.save(
      userId,
      body,
      PredictionState.SUBMITTED,
      { bypassSubmittedLock: true },
    );
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
