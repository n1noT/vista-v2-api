/**
 * Pure implementation of the per-team scoring formula from
 * `Calcul_Cotes.md` — no Prisma/Nest dependency, so it's trivially unit
 * testable in isolation from `AdminResultsService`'s data fetching.
 *
 * Bonuses from `Calcul_Cotes.md` (favori, champion, podium, relégation,
 * exact-table doubling) are intentionally not implemented — out of scope
 * for this round, only the base `M x C = P` formula is computed.
 */
export interface ScoringInput {
  /** F — bookmaker-expected position (1..N), may be fractional for tied odds. */
  expectedPosition: number;
  /** J — player-guessed position (1..N). */
  guessedPosition: number;
  /** R — real final position (1..N). */
  realPosition: number;
  /** N — number of teams in the league/season. */
  teamCount: number;
}

/**
 * P = M x C, rounded to the nearest integer since Calcul_Cotes.md defines P
 * as "un entier naturel".
 */
export function calculateItemPoints({
  expectedPosition,
  guessedPosition,
  realPosition,
  teamCount,
}: ScoringInput): number {
  const riskGap = Math.abs(expectedPosition - guessedPosition);
  const riskCoefficient = 1 + (4 * riskGap) / (teamCount - 1);

  const errorGap = Math.abs(guessedPosition - realPosition);
  const errorCoefficient = errorGap === 0 ? 50 : errorGap === 1 ? 25 : 0;

  return Math.round(riskCoefficient * errorCoefficient);
}
