-- CreateEnum
CREATE TYPE "BrandAnalysisRequestStatus" AS ENUM ('DRAFT', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'SUPER_ADMIN_REJECTED', 'FINANCE_ANALYSIS_IN_PROGRESS', 'FINANCE_ANALYSIS_COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BrandAnalysisRecommendation" AS ENUM ('RECOMMENDED', 'NOT_RECOMMENDED', 'FURTHER_REVIEW_REQUIRED');

-- CreateTable
CREATE TABLE "brand_analysis_requests" (
    "id" TEXT NOT NULL,
    "requestNo" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageOriginalName" TEXT,
    "reason" TEXT NOT NULL,
    "orderDetails" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "remarks" TEXT,
    "status" "BrandAnalysisRequestStatus" NOT NULL DEFAULT 'PENDING_SUPER_ADMIN_APPROVAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalRemarks" TEXT,
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "financeStartedById" TEXT,
    "financeStartedAt" TIMESTAMP(3),
    "financeInitialRemarks" TEXT,
    "financeCompletedById" TEXT,
    "financeCompletedAt" TIMESTAMP(3),
    "analysisResult" TEXT,
    "recommendedBrand" TEXT,
    "estimatedUnitCost" DECIMAL(18,2),
    "estimatedTotalCost" DECIMAL(18,2),
    "supplierName" TEXT,
    "financeRemarks" TEXT,
    "analysisDocumentUrl" TEXT,
    "recommendation" "BrandAnalysisRecommendation",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_analysis_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_analysis_history" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fromStatus" "BrandAnalysisRequestStatus",
    "toStatus" "BrandAnalysisRequestStatus" NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_analysis_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_analysis_requests_requestNo_key" ON "brand_analysis_requests"("requestNo");

-- CreateIndex
CREATE INDEX "brand_analysis_requests_status_idx" ON "brand_analysis_requests"("status");

-- CreateIndex
CREATE INDEX "brand_analysis_requests_requestedById_idx" ON "brand_analysis_requests"("requestedById");

-- CreateIndex
CREATE INDEX "brand_analysis_requests_createdAt_idx" ON "brand_analysis_requests"("createdAt");

-- CreateIndex
CREATE INDEX "brand_analysis_history_requestId_idx" ON "brand_analysis_history"("requestId");

-- CreateIndex
CREATE INDEX "brand_analysis_history_performedById_idx" ON "brand_analysis_history"("performedById");

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_financeStartedById_fkey" FOREIGN KEY ("financeStartedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_requests" ADD CONSTRAINT "brand_analysis_requests_financeCompletedById_fkey" FOREIGN KEY ("financeCompletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_history" ADD CONSTRAINT "brand_analysis_history_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "brand_analysis_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_analysis_history" ADD CONSTRAINT "brand_analysis_history_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

