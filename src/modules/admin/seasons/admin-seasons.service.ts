/**
 * All Prisma access for admin season management (`Fonctionnalites_Admin.md`
 * "Saison": add/edit/delete a season, plus add/remove a team from a
 * season). Every `Season` row belongs to exactly one `League`
 * (`Season.leagueId`, required at create) — matching how
 * football-data.org's own season ids are already scoped to one competition
 * (see `FootballSyncService.syncLeague`) — so a team-participation write
 * only ever needs `teamId`; the league is implied by the season it's
 * posted to, not a separate field an admin could mismatch.
 *
 * Same error-mapping shape as `AdminTeamsService`/`AdminLeaguesService`
 * (P2002 → `ConflictException`, P2025 → `NotFoundException`, P2003 →
 * `ConflictException` on season delete). `removeParticipation` is a plain
 * delete today — per `Fonctionnalites_Admin.md`, its bookmaker "côtes"
 * should cascade-delete too, but there's no `Odds` model yet (the odds
 * engine from `Calcul_Cotes.md` isn't built); once it exists and
 * references `TeamLeagueSeason`, its `onDelete: Cascade` will make that
 * happen automatically, no change needed here.
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Season } from '../../../../generated/prisma/client';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { AddTeamToSeasonDto } from './dto/add-team-to-season.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@Injectable()
export class AdminSeasonsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Season[]> {
    return this.prisma.season.findMany({
      include: { league: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        league: true,
        participations: {
          include: { team: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    return season;
  }

  async create(dto: CreateSeasonDto): Promise<Season> {
    const externalId = dto.externalId ?? (await this.nextSyntheticExternalId());
    try {
      return await this.prisma.season.create({
        data: {
          externalId,
          leagueId: dto.leagueId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          currentMatchday: dto.currentMatchday,
          isCurrent: dto.isCurrent ?? false,
        },
        include: { league: true },
      });
    } catch (error) {
      throw this.mapError(error, 'League not found');
    }
  }

  async update(id: number, dto: UpdateSeasonDto): Promise<Season> {
    try {
      return await this.prisma.season.update({
        where: { id },
        data: {
          leagueId: dto.leagueId,
          ...(dto.startDate !== undefined && {
            startDate: new Date(dto.startDate),
          }),
          ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
          currentMatchday: dto.currentMatchday,
          isCurrent: dto.isCurrent,
          externalId: dto.externalId,
        },
        include: { league: true },
      });
    } catch (error) {
      throw this.mapError(error, 'Season or league not found');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.season.delete({ where: { id } });
    } catch (error) {
      throw this.mapError(error, 'Season not found', {
        p2003:
          'This season is still used by a team participation or a prediction — remove those first',
      });
    }
  }

  async addTeam(seasonId: number, dto: AddTeamToSeasonDto) {
    try {
      return await this.prisma.teamLeagueSeason.create({
        data: {
          seasonId,
          teamId: dto.teamId,
          position: dto.position,
          playedGames: dto.playedGames,
        },
        include: { team: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('This team is already in this season');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Season or team not found');
        }
      }
      throw error;
    }
  }

  async updateParticipation(
    seasonId: number,
    participationId: number,
    dto: UpdateParticipationDto,
  ) {
    try {
      return await this.prisma.teamLeagueSeason.update({
        where: { id: participationId, seasonId },
        data: dto,
        include: { team: true },
      });
    } catch (error) {
      throw this.mapError(error, 'Participation not found');
    }
  }

  async removeParticipation(
    seasonId: number,
    participationId: number,
  ): Promise<void> {
    try {
      await this.prisma.teamLeagueSeason.delete({
        where: { id: participationId, seasonId },
      });
    } catch (error) {
      throw this.mapError(error, 'Participation not found');
    }
  }

  /** football-data.org ids are always positive, so a decreasing negative sequence never collides. */
  private async nextSyntheticExternalId(): Promise<number> {
    const lowest = await this.prisma.season.aggregate({
      _min: { externalId: true },
    });
    return Math.min(lowest._min.externalId ?? 0, 0) - 1;
  }

  private mapError(
    error: unknown,
    notFoundMessage: string,
    overrides: { p2003?: string } = {},
  ): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('externalId already in use');
      }
      if (error.code === 'P2025') {
        return new NotFoundException(notFoundMessage);
      }
      if (error.code === 'P2003') {
        return new ConflictException(
          overrides.p2003 ??
            'This record is still referenced elsewhere — remove that first',
        );
      }
    }
    return error;
  }
}
