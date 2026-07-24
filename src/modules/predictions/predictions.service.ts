import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PredictionState } from '../../../generated/prisma/client';
import { CUPredictionsDto } from './dto/cu-prediction.dto';
import { LeaguesService } from '../leagues/leagues.service';
import { LeagueDetail } from '../leagues/types/league-detail.type';
import { LeagueWithPredictionStatus } from './types/league-with-prediction-status.type';

@Injectable()
export class PredictionsService {
  constructor(
    private prisma: PrismaService,
    private leaguesService: LeaguesService,
  ) {}

  /**
   * Backs `GET /predictions/leagues` — the `/predictions` hub. Delegates the
   * league/team-count lookup to `LeaguesService` (kept there since it's
   * league data, not prediction data) and stitches in the current user's
   * progress on each one, so the hub can render "submitted" without a
   * separate round-trip per league.
   */
  async getAvailableLeagues(
    userId: string,
  ): Promise<LeagueWithPredictionStatus[]> {
    const leagues = await this.leaguesService.getAvailableLeagues();
    if (leagues.length === 0) {
      return [];
    }

    const predictions = await this.prisma.prediction.findMany({
      where: { userId, leagueId: { in: leagues.map((l) => l.leagueId) } },
    });
    const statusByLeagueId = new Map(
      predictions.map((prediction) => [prediction.leagueId, prediction.status]),
    );

    return leagues.map((league) => ({
      ...league,
      predictionStatus: statusByLeagueId.get(league.leagueId) ?? 'NOT_STARTED',
    }));
  }

  /**
   * Backs `GET /predictions/leagues/:leagueId` — the `/predictions/league/[id]`
   * form's team list. Thin wrapper around `LeaguesService.getLeagueDetail`
   * that turns `null` (league/season not found) into the 404 the front
   * expects; kept here rather than in the controller so `LeaguesService`
   * stays a plain data-access service with no HTTP concerns.
   */
  async getLeagueDetail(leagueId: number): Promise<LeagueDetail> {
    const detail = await this.leaguesService.getLeagueDetail(leagueId);
    if (!detail) {
      throw new NotFoundException('Championnat introuvable.');
    }
    return detail;
  }

  /**
   * Backs `GET /predictions` — the current user's existing prediction (with
   * its items) for one league/season, or `null` if they haven't started
   * one. Lets the front prefill the `DraggableLeagueTable`'s order and
   * decide whether to render it read-only (`status === 'SUBMITTED'`).
   */
  findOwn(userId: string, leagueId: number, seasonId: number) {
    return this.prisma.prediction.findFirst({
      where: { userId, leagueId, seasonId },
      include: { items: true },
    });
  }

  async save(
    userId: string,
    prediction: CUPredictionsDto,
    state: PredictionState,
  ) {
    const teamCount = await this.prisma.teamLeagueSeason.count({
      where: {
        leagueId: prediction.leagueId,
        seasonId: prediction.seasonId,
      },
    });

    if (teamCount === 0) {
      throw new BadRequestException('Championnat introuvable.');
    }

    if (
      state === PredictionState.SUBMITTED &&
      prediction.predictions.length !== teamCount
    ) {
      throw new BadRequestException(
        `Votre pronostic est incomplet. Ce league nécessite exactement ${teamCount} équipes.`,
      );
    }

    // Drafts may be partial (a subset of the league's teams), but whatever
    // positions are present must still be gap-free starting at 1 — e.g.
    // [1, 2, 3], never [1, 3]. `SUBMITTED` additionally requires the full
    // `teamCount` above, which combined with this makes positions exactly
    // 1..teamCount.
    const positions = prediction.predictions
      .map((p) => p.position)
      .sort((a, b) => a - b);
    const isSequential = positions.every(
      (position, index) => position === index + 1,
    );
    if (!isSequential) {
      throw new BadRequestException(
        'Les positions doivent se suivre sans saut.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.prediction.findFirst({
        where: {
          userId,
          leagueId: prediction.leagueId,
          seasonId: prediction.seasonId,
        },
      });

      if (existing?.status === PredictionState.SUBMITTED) {
        throw new BadRequestException(
          'Ce pronostic a déjà été soumis et ne peut plus être modifié.',
        );
      }

      const savedPrediction = existing
        ? await tx.prediction.update({
            where: { id: existing.id },
            data: {
              status: state,
              submittedAt:
                state === PredictionState.SUBMITTED ? new Date() : null,
            },
          })
        : await tx.prediction.create({
            data: {
              userId,
              leagueId: prediction.leagueId,
              seasonId: prediction.seasonId,
              status: state,
              submittedAt:
                state === PredictionState.SUBMITTED ? new Date() : null,
            },
          });

      await tx.predictionItem.deleteMany({
        where: { predictionId: savedPrediction.id },
      });
      await tx.predictionItem.createMany({
        data: prediction.predictions.map((item) => ({
          predictionId: savedPrediction.id,
          teamId: item.teamId,
          position: item.position,
        })),
      });

      return savedPrediction;
    });
  }
}
