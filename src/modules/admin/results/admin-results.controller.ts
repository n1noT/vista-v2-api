/**
 * `/admin/results` — surface for `Fonctionnalites_Admin.md`'s "déclencher
 * manuellement le calcul et la distribution des points" bullet. Guarded like
 * every other admin controller (`RolesGuard` + `@Roles(ADMIN)`, on top of
 * the global `JwtAuthGuard`). Thin — all scoring logic lives in
 * `AdminResultsService`/`scoring.util.ts`.
 */
import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminResultsService } from './admin-results.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/results')
export class AdminResultsController {
  constructor(private readonly adminResultsService: AdminResultsService) {}

  @Post(':leagueId/:seasonId/calculate')
  @HttpCode(HttpStatus.OK)
  calculate(
    @Param('leagueId', ParseIntPipe) leagueId: number,
    @Param('seasonId', ParseIntPipe) seasonId: number,
  ) {
    return this.adminResultsService.calculate(leagueId, seasonId);
  }
}
