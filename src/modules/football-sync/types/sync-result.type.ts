/**
 * `FootballSyncService.syncAll()`'s return shape — one entry per synced
 * competition, success or failure. `handleCron` (the daily job) ignores
 * this and just relies on the `Logger` calls inside `syncAll` for
 * visibility; `AdminSyncController`'s `POST /admin/sync` returns it
 * directly so a manual trigger gets the same per-league detail an admin
 * would otherwise have to go dig out of the server logs.
 */
export type SyncResult = {
  configured: boolean;
  synced: { code: string; competitionName: string }[];
  failed: { code: string; error: string }[];
};
