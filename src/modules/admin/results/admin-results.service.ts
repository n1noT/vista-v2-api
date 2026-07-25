/**
 * Triggers the points calculation for `Fonctionnalites_Admin.md`'s "Gestion
 * de l'état" bullet ("l'admin peut déclencher manuellement le calcul et la
 * distribution des points"). Scores every `SUBMITTED` `Prediction` for one
 * league/season using `calculateItemPoints` (`scoring.util.ts`) against the
 * season's `TeamLeagueSeason.position` (real position "R") and
 * `expectedPosition` (bookmaker position "F", set via `admin/odds`).
 *
 * Idempotent by design — re-running just overwrites `points`/
 * `pointsCalculatedAt`, matching "manually trigger" implying it can be
 * re-triggered (e.g. after a late correction to a real position).
 *
 * Bonuses from `Calcul_Cotes.md` are out of scope for this round — see
 * `scoring.util.ts`'s header comment.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PredictionState } from '../../../../generated/prisma/client';
import { calculateItemPoints } from './scoring.util';

@Injectable()
export class AdminResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(leagueId: number, seasonId: number) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: { participations: true },
    });
    if (!season || season.leagueId !== leagueId) {
      throw new NotFoundException('Season not found for this league');
    }

    const teamCount = season.participations.length;
    if (teamCount === 0) {
      throw new BadRequestException('This season has no teams yet');
    }

    const missingOdds = season.participations.filter(
      (p) => p.expectedPosition == null,
    );
    if (missingOdds.length > 0) {
      throw new BadRequestException(
        `Cannot calculate points: ${missingOdds.length} team(s) in this season are missing expectedPosition (F) — set odds for all teams first`,
      );
    }

    const participationByTeamId = new Map(
      season.participations.map((p) => [p.teamId, p]),
    );

    const predictions = await this.prisma.prediction.findMany({
      where: { leagueId, seasonId, status: PredictionState.SUBMITTED },
      include: { items: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const prediction of predictions) {
        let total = 0;
        for (const item of prediction.items) {
          const participation = participationByTeamId.get(item.teamId);
          if (!participation) continue;

          const points = calculateItemPoints({
            expectedPosition: participation.expectedPosition as number,
            guessedPosition: item.position,
            realPosition: participation.position,
            teamCount,
          });
          total += points;

          await tx.predictionItem.update({
            where: { id: item.id },
            data: { points },
          });
        }

        await tx.prediction.update({
          where: { id: prediction.id },
          data: { points: total, pointsCalculatedAt: new Date() },
        });
      }
    });

    return {
      leagueId,
      seasonId,
      predictionsScored: predictions.length,
    };
  }
}
