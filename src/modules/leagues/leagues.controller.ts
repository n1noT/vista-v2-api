import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { AvailableLeague } from './types/available-league.type';
import { LeagueDetail } from './types/league-detail.type';

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Get()
  getAvailableLeagues(): Promise<AvailableLeague[]> {
    return this.leaguesService.getAvailableLeagues();
  }

  @Get(':leagueId')
  async getLeagueDetail(
    @Param('leagueId', ParseIntPipe) leagueId: number,
  ): Promise<LeagueDetail> {
    const detail = await this.leaguesService.getLeagueDetail(leagueId);
    if (!detail) {
      throw new NotFoundException('Championnat introuvable.');
    }
    return detail;
  }
}
