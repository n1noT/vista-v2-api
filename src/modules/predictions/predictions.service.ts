import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PredictionState } from '../../../generated/prisma/client';
import { CUPredictionsDto } from './dto/cu-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(private prisma: PrismaService) {}

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

    const maxPosition = Math.max(
      ...prediction.predictions.map((p) => p.position),
    );
    if (maxPosition !== teamCount) {
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
