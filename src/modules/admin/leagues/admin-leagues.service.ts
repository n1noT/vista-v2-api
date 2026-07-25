/**
 * All Prisma access for admin championship management
 * (`Fonctionnalites_Admin.md` "Championnats": add/edit/delete). Distinct
 * from the read-only, player-scoped `modules/leagues/leagues.service.ts` —
 * that one stays untouched. Same shape as `AdminTeamsService`: P2002 →
 * `ConflictException`, P2025 → `NotFoundException`, and P2003 (delete
 * blocked by a referencing `TeamLeagueSeason`/`Prediction` row, since
 * neither cascades) → `ConflictException`.
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { League, Prisma } from '../../../../generated/prisma/client';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';

@Injectable()
export class AdminLeaguesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<League[]> {
    return this.prisma.league.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number): Promise<League> {
    const league = await this.prisma.league.findUnique({ where: { id } });
    if (!league) {
      throw new NotFoundException('League not found');
    }
    return league;
  }

  async create(dto: CreateLeagueDto): Promise<League> {
    const externalId = dto.externalId ?? (await this.nextSyntheticExternalId());
    try {
      return await this.prisma.league.create({
        data: { name: dto.name, logoUrl: dto.logoUrl, externalId },
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: number, dto: UpdateLeagueDto): Promise<League> {
    try {
      return await this.prisma.league.update({ where: { id }, data: dto });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.league.delete({ where: { id } });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  /** football-data.org ids are always positive, so a decreasing negative sequence never collides. */
  private async nextSyntheticExternalId(): Promise<number> {
    const lowest = await this.prisma.league.aggregate({
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
        return new NotFoundException('League not found');
      }
      if (error.code === 'P2003') {
        return new ConflictException(
          'This league is still used by a season or a prediction — remove those first',
        );
      }
    }
    return error;
  }
}
