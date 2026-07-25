/**
 * `/admin/seasons` — CRUD surface for `Fonctionnalites_Admin.md`'s "Saison"
 * bullets, plus the team↔league-season join (`:id/teams*`) since that's
 * inherently season-scoped. Guarded like the other admin controllers
 * (`RolesGuard` + `@Roles(ADMIN)`, on top of the global `JwtAuthGuard`).
 * Thin — all the validation/error-mapping logic lives in
 * `AdminSeasonsService`.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminSeasonsService } from './admin-seasons.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { AddTeamToSeasonDto } from './dto/add-team-to-season.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/seasons')
export class AdminSeasonsController {
  constructor(private readonly adminSeasonsService: AdminSeasonsService) {}

  @Get()
  findAll() {
    return this.adminSeasonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminSeasonsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSeasonDto) {
    return this.adminSeasonsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSeasonDto) {
    return this.adminSeasonsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminSeasonsService.remove(id);
  }

  @Post(':id/teams')
  addTeam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddTeamToSeasonDto,
  ) {
    return this.adminSeasonsService.addTeam(id, dto);
  }

  @Patch(':id/teams/:participationId')
  updateParticipation(
    @Param('id', ParseIntPipe) id: number,
    @Param('participationId', ParseIntPipe) participationId: number,
    @Body() dto: UpdateParticipationDto,
  ) {
    return this.adminSeasonsService.updateParticipation(
      id,
      participationId,
      dto,
    );
  }

  @Delete(':id/teams/:participationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeParticipation(
    @Param('id', ParseIntPipe) id: number,
    @Param('participationId', ParseIntPipe) participationId: number,
  ) {
    return this.adminSeasonsService.removeParticipation(id, participationId);
  }
}
