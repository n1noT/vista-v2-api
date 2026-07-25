/**
 * All Prisma access for admin team management (`Fonctionnalites_Admin.md`
 * "Équipes": add/edit/delete). `Team` has no existing write-capable service
 * to reuse — `LeaguesService` only reads it for the player-facing
 * predictions hub — so this module owns its own CRUD, following the same
 * error-mapping shape as `UsersService` (P2002 → `ConflictException`, P2025
 * → `NotFoundException`), plus P2003 for `delete`: none of `Team`'s
 * relations (`TeamLeagueSeason.team`, `PredictionItem.team`) cascade, so
 * Postgres rejects deleting a team that's still referenced — mapped here to
 * a clean 409 instead of a raw 500.
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Team } from '../../../../generated/prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class AdminTeamsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Team[]> {
    return this.prisma.team.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const externalId = dto.externalId ?? (await this.nextSyntheticExternalId());
    try {
      return await this.prisma.team.create({
        data: { name: dto.name, logoUrl: dto.logoUrl, externalId },
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    try {
      return await this.prisma.team.update({ where: { id }, data: dto });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.team.delete({ where: { id } });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  /** football-data.org ids are always positive, so a decreasing negative sequence never collides. */
  private async nextSyntheticExternalId(): Promise<number> {
    const lowest = await this.prisma.team.aggregate({
      _min: { externalId: true },
    });
    return Math.min(lowest._min.externalId ?? 0, 0) - 1;
  }

  private mapError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('externalId already in use');
      }
      if (error.code === 'P2025') {
        return new NotFoundException('Team not found');
      }
      if (error.code === 'P2003') {
        return new ConflictException(
          'This team is still used by a season or a prediction — remove those first',
        );
      }
    }
    return error;
  }
}
