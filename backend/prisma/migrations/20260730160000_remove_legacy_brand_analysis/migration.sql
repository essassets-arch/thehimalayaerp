-- DropForeignKey
ALTER TABLE "BrandAnalysis" DROP CONSTRAINT "BrandAnalysis_completedById_fkey";

-- DropForeignKey
ALTER TABLE "BrandAnalysis" DROP CONSTRAINT "BrandAnalysis_createdById_fkey";

-- DropForeignKey
ALTER TABLE "BrandAnalysis" DROP CONSTRAINT "BrandAnalysis_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "BrandAnalysis" DROP CONSTRAINT "BrandAnalysis_storeId_fkey";

-- DropTable
DROP TABLE "BrandAnalysis";

-- DropEnum
DROP TYPE "BrandAnalysisStatus";

