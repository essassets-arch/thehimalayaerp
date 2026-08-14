import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // You can add global Prisma configurations here, e.g., logging
    });
  }

  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRawUnsafe(`
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "reportNo" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "shift" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "supervisorName" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT';
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalCovers" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalFrames" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalSets" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalCoverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalFrameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "updatedById" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "submittedById" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "approvedById" TEXT;
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
        ALTER TABLE "ProductionDailyReport" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
        ALTER TABLE "ProductionDailyReport" ALTER COLUMN "shift" DROP NOT NULL;
        ALTER TABLE "ProductionDailyReport" ALTER COLUMN "supervisorName" DROP NOT NULL;
        ALTER TABLE "ProductionDailyReport" ALTER COLUMN "createdById" DROP NOT NULL;

        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "reportId" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "productId" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "customProductName" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "srNo" INTEGER DEFAULT 1;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "size" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "type" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "capacity" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "coverQty" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "coverUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "coverWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "actualCoverWeight" DECIMAL(14,3);
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "frameQty" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "frameUnitWeight" DECIMAL(10,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "frameWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "actualFrameWeight" DECIMAL(14,3);
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "weightOverrideReason" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "setQty" INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "totalWeight" DECIMAL(14,3) NOT NULL DEFAULT 0;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "workOrderId" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "productionPlanId" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "salesOrderId" TEXT;
        ALTER TABLE "ProductionDailyReportItem" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
      `);
    } catch (e) {
      // Ignore if table does not exist yet
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
