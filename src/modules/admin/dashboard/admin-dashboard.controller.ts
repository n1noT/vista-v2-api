/**
 * `GET /admin/dashboard` — the `/admin/dashboard` overview from
 * `Arborescence_Pages.md` ("nombre de joueurs, statuts des championnats").
 * Guarded the same way as `AdminUsersController` (`RolesGuard` + `@Roles`).
 * Read-only aggregation over `UsersService.countPlayers()` and
 * `LeaguesService.getChampionshipStatuses()` — no new Prisma access here,
 * both are reused from their owning modules.
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { LeaguesService } from '../../leagues/leagues.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly usersService: UsersService,
    private readonly leaguesService: LeaguesService,
  ) {}

  @Get()
  async getOverview() {
    const [players, championships] = await Promise.all([
      this.usersService.countPlayers(),
      this.leaguesService.getChampionshipStatuses(),
    ]);
    return { players, championships };
  }
}
