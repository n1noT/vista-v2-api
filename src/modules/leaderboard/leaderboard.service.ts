/**
 * Computes player rankings on the fly — there's no persisted
 * leaderboard/ranking table, since `Prediction.points` (written once per
 * league/season by `AdminResultsService.calculate()`, see
 * `modules/admin/results/`) is already the authoritative per-competition
 * total for a player and cheap to aggregate at request time.
 *
 * Only `PredictionState.SUBMITTED` predictions count: `DRAFT` rows always
 * have `points: null` (the scoring job never touches them) and must not
 * contribute to anyone's total. Filtering `status: SUBMITTED` up front
 * means `_sum.points` never needs a null-coalesce for "not scored yet"
 * vs. "genuinely zero" — both already read as `0`/absent correctly.
 *
 * `leagueId` omitted → global leaderboard, summing every league a player
 * has predicted (`Concept_Regles.md`: "le classement final ... est
 * déterminé par le total des points obtenus"). `leagueId` present → that
 * one league's cumulative points only (`Fonctionnalites_Joueurs.md`:
 * "trier le classement par championnat"). Champions League isn't in this
 * sum yet — the schema has no CL model at all (see `football-sync/
 * constants.ts`), so the global total is currently just the 5 domestic
 * leagues; it'll fold in automatically once CL predictions are modeled and
 * scored the same way, no changes needed here.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PredictionState } from '../../../generated/prisma/client';
import { LeaderboardEntry } from './types/leaderboard-entry.type';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(leagueId?: number): Promise<LeaderboardEntry[]> {
    const groups = await this.prisma.prediction.groupBy({
      by: ['userId'],
      where: {
        status: PredictionState.SUBMITTED,
        ...(leagueId ? { leagueId } : {}),
      },
      _sum: { points: true },
    });

    if (groups.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: groups.map((group) => group.userId) } },
      select: { id: true, pseudo: true, avatarUrl: true },
    });
    const userById = new Map(users.map((user) => [user.id, user]));

    const sorted = groups
      .map((group) => {
        const user = userById.get(group.userId);
        return {
          userId: group.userId,
          pseudo: user?.pseudo ?? '',
          avatarUrl: user?.avatarUrl ?? null,
          totalPoints: group._sum.points ?? 0,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Standard competition ranking: ties share a rank, next rank skips ahead.
    let rank = 0;
    let previousPoints: number | null = null;
    return sorted.map((entry, index) => {
      if (entry.totalPoints !== previousPoints) {
        rank = index + 1;
        previousPoints = entry.totalPoints;
      }
      return { ...entry, rank };
    });
  }
}
