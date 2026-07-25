-- A `Season` row was previously shared across leagues in the schema even
-- though football-data.org (and every row synced so far) always ties one
-- season to exactly one competition. This adds the missing `leagueId` FK on
-- `Season`, backfills it from the existing `TeamLeagueSeason` rows (each
-- season today has exactly one distinct leagueId among its participations),
-- and drops the now-redundant `leagueId` off `TeamLeagueSeason` since it's
-- implied by the season.

-- AlterTable: add nullable leagueId first so existing rows can be backfilled
ALTER TABLE "Season" ADD COLUMN "leagueId" INTEGER;

-- Backfill from the existing TeamLeagueSeason rows: one distinct leagueId per season today
UPDATE "Season" s
SET "leagueId" = sub."leagueId"
FROM (
    SELECT DISTINCT ON ("seasonId") "seasonId", "leagueId"
    FROM "TeamLeagueSeason"
    ORDER BY "seasonId", "leagueId"
) sub
WHERE s."id" = sub."seasonId";

-- AlterTable: now enforce NOT NULL
ALTER TABLE "Season" ALTER COLUMN "leagueId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "TeamLeagueSeason" DROP CONSTRAINT "TeamLeagueSeason_leagueId_fkey";

-- DropIndex
DROP INDEX "TeamLeagueSeason_teamId_leagueId_seasonId_key";

-- AlterTable: drop the now-redundant leagueId (implied by the season's own leagueId)
ALTER TABLE "TeamLeagueSeason" DROP COLUMN "leagueId";

-- CreateIndex
CREATE UNIQUE INDEX "TeamLeagueSeason_teamId_seasonId_key" ON "TeamLeagueSeason"("teamId", "seasonId");
