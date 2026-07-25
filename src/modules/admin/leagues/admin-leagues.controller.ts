/**
 * `/admin/leagues` — CRUD surface for `Fonctionnalites_Admin.md`'s
 * "Championnats" bullets. Guarded like the other admin controllers
 * (`RolesGuard` + `@Roles(ADMIN)`, on top of the global `JwtAuthGuard`).
 * Thin — all the validation/error-mapping logic lives in
 * `AdminLeaguesService`.
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
import { AdminLeaguesService } from './admin-leagues.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/leagues')
export class AdminLeaguesController {
  constructor(private readonly adminLeaguesService: AdminLeaguesService) {}

  @Get()
  findAll() {
    return this.adminLeaguesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminLeaguesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeagueDto) {
    return this.adminLeaguesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeagueDto) {
    return this.adminLeaguesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminLeaguesService.remove(id);
  }
}
