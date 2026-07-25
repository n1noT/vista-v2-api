/**
 * All Prisma access for admin odds management (`Fonctionnalites_Admin.md`'s
 * "Côtes" bullet — admin edits `TeamLeagueSeason.expectedPosition`, the
 * bookmaker-expected position "F" from `Calcul_Cotes.md`). Deliberately kept
 * separate from `AdminSeasonsService` — `AdminModule`'s header comment
 * earmarks odds as its own submodule, and it's the only field here an admin
 * ever touches (unlike `position`/`playedGames`, which sync from
 * football-data.org via `FootballSyncService`).
 *
 * `expectedPosition` is validated against the season's own team count (`N`)
 * here rather than in the DTO, since `N` isn't known until we look up the
 * season a participation belongs to.
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';
import { UpdateOddsDto } from './dto/update-odds.dto';

@Injectable()
export class AdminOddsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySeason(seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        participations: {
          include: { team: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!season) {
      throw new NotFoundException('Season not found');
    }
    return season.participations;
  }

  async updateExpectedPosition(participationId: number, dto: UpdateOddsDto) {
    const participation = await this.prisma.teamLeagueSeason.findUnique({
      where: { id: participationId },
    });
    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    const teamCount = await this.prisma.teamLeagueSeason.count({
      where: { seasonId: participation.seasonId },
    });
    if (dto.expectedPosition > teamCount) {
      throw new BadRequestException(
        `expectedPosition must be between 1 and ${teamCount} (this season's team count)`,
      );
    }

    try {
      return await this.prisma.teamLeagueSeason.update({
        where: { id: participationId },
        data: { expectedPosition: dto.expectedPosition },
        include: { team: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Participation not found');
      }
      throw error;
    }
  }
}
