/**
 * `/admin/odds` — surface for `Fonctionnalites_Admin.md`'s "Côtes" bullet:
 * admin sets the bookmaker-expected position ("F") per team/season, nothing
 * else. Guarded like every other admin controller (`RolesGuard` +
 * `@Roles(ADMIN)`, on top of the global `JwtAuthGuard`). Thin — validation
 * and Prisma access live in `AdminOddsService`.
 */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminOddsService } from './admin-odds.service';
import { UpdateOddsDto } from './dto/update-odds.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/odds')
export class AdminOddsController {
  constructor(private readonly adminOddsService: AdminOddsService) {}

  @Get('seasons/:seasonId')
  findBySeason(@Param('seasonId', ParseIntPipe) seasonId: number) {
    return this.adminOddsService.findBySeason(seasonId);
  }

  @Patch(':participationId')
  updateExpectedPosition(
    @Param('participationId', ParseIntPipe) participationId: number,
    @Body() dto: UpdateOddsDto,
  ) {
    return this.adminOddsService.updateExpectedPosition(participationId, dto);
  }
}
