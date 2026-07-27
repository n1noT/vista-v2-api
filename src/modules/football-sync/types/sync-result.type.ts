/**
 * `FootballSyncService.syncAll()`'s return shape — one entry per synced
 * competition, success or failure. `handleCron` (the daily job) ignores
 * this and just relies on the `Logger` calls inside `syncAll` for
 * visibility; `AdminSyncController`'s `POST /admin/sync` returns it
 * directly so a manual trigger gets the same per-league detail an admin
 * would otherwise have to go dig out of the server logs.
 *
 * `pointsCalculated` is the number of `SUBMITTED` predictions rescored right
 * after this league's standings synced, or `null` if scoring was skipped
 * (e.g. odds/`expectedPosition` aren't set for every team yet) — see
 * `FootballSyncService.recalculatePoints`.
 */
export type SyncResult = {
  configured: boolean;
  synced: {
    code: string;
    competitionName: string;
    pointsCalculated: number | null;
  }[];
  failed: { code: string; error: string }[];
};
