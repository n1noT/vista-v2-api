-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "points" INTEGER,
ADD COLUMN     "pointsCalculatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PredictionItem" ADD COLUMN     "points" INTEGER;

-- AlterTable
ALTER TABLE "TeamLeagueSeason" ADD COLUMN     "expectedPosition" DOUBLE PRECISION;
