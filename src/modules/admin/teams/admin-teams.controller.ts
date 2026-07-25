/**
 * `/admin/teams` — CRUD surface for `Fonctionnalites_Admin.md`'s "Équipes"
 * bullets. Guarded like the other admin controllers (`RolesGuard` +
 * `@Roles(ADMIN)`, on top of the global `JwtAuthGuard`). Thin — all the
 * validation/error-mapping logic lives in `AdminTeamsService`.
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
import { AdminTeamsService } from './admin-teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/teams')
export class AdminTeamsController {
  constructor(private readonly adminTeamsService: AdminTeamsService) {}

  @Get()
  findAll() {
    return this.adminTeamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminTeamsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.adminTeamsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeamDto) {
    return this.adminTeamsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminTeamsService.remove(id);
  }
}
