/**
 * Shape returned by `GET /predictions/leagues` — `LeaguesService`'s
 * `AvailableLeague` (league + team count) plus the current user's progress
 * on it, so the `/predictions` hub can render which championships are
 * already submitted without a second round-trip per league.
 * `'NOT_STARTED'` isn't a `PredictionState` value (that enum only models
 * rows that exist in the DB) — it's synthesized here for leagues the user
 * has no `Prediction` row for yet.
 */
import { PredictionState } from '../../../../generated/prisma/client';
import { AvailableLeague } from '../../leagues/types/available-league.type';

export type PredictionProgress = PredictionState | 'NOT_STARTED';

export type LeagueWithPredictionStatus = AvailableLeague & {
  predictionStatus: PredictionProgress;
};
