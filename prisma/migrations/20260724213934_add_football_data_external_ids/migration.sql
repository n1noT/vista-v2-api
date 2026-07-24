-- AlterTable
ALTER TABLE "League" ADD COLUMN     "externalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "externalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "externalId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "League_externalId_key" ON "League"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_externalId_key" ON "Season"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLeagueSeason_teamId_leagueId_seasonId_key" ON "TeamLeagueSeason"("teamId", "leagueId", "seasonId");
