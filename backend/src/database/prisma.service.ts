import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const boundedDatabaseUrl = (databaseUrl?: string): string => {
  if (!databaseUrl) return '';

  try {
    const url = new URL(databaseUrl);
    // One NestJS process must not consume the whole PostgreSQL connection budget.
    url.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '5');
    url.searchParams.set('pool_timeout', process.env.DATABASE_POOL_TIMEOUT || '20');
    return url.toString();
  } catch {
    // Let Prisma report malformed URLs using its normal, actionable error message.
    return databaseUrl;
  }
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: { url: boundedDatabaseUrl(process.env.DATABASE_URL) },
      },
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

    // Run Daily Production Report stock auto-post reconciliation
    try {
      const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
      const unpostedProd = await this.productionDailyReport.findMany({
        where: {
          status: 'SUBMITTED',
          stockPostedAt: null,
        },
        include: {
          items: true,
        },
      });

      if (unpostedProd.length > 0) {
        console.log(`[STARTUP] Found ${unpostedProd.length} unposted submitted production daily reports. Posting stock...`);
        for (const report of unpostedProd) {
          await this.$transaction(async (tx) => {
            for (const item of report.items) {
              if (item.productId && item.setQty > 0) {
                const qty = Number(item.setQty);

                // Check if FinishedGoods record exists
                const fgRecords = await tx.$queryRaw<any[]>`
                  SELECT id, quantity, "availableQuantity", "reservedQuantity"
                  FROM "FinishedGoods"
                  WHERE "productId" = ${item.productId}
                  FOR UPDATE
                `;

                if (fgRecords.length > 0) {
                  const fg = fgRecords[0];
                  const beforeQty = Number(fg.quantity || 0);
                  const beforeAvail = Number(fg.availableQuantity || 0);
                  const reserved = Number(fg.reservedQuantity || 0);
                  const afterQty = beforeQty + qty;
                  const afterAvail = afterQty - reserved;

                  await tx.finishedGoods.update({
                    where: { id: fg.id },
                    data: {
                      quantity: afterQty,
                      availableQuantity: afterAvail,
                      status: afterAvail <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
                    },
                  });

                  await tx.stockHistory.create({
                    data: {
                      companyId: report.companyId,
                      productId: item.productId,
                      event: 'PRODUCTION_IN',
                      quantity: qty,
                      beforeQuantity: beforeQty,
                      afterQuantity: afterQty,
                      sourceType: 'PRODUCTION_REPORT',
                      sourceId: report.id,
                      sourceItemId: item.id,
                      referenceNumber: report.reportNo,
                      actor: report.createdById || 'system',
                      remarks: `Startup auto-post for report ${report.reportNo}`,
                    },
                  });
                } else {
                  // Create dummy workOrder & finished goods
                  let customer = await tx.customer.findFirst({ where: { companyId } });
                  if (!customer) {
                    customer = await tx.customer.create({
                      data: {
                        companyId,
                        companyName: 'Default Client',
                        status: 'ACTIVE',
                      }
                    });
                  }

                  const plan = await tx.productionPlan.findFirst({ where: { salesOrder: { customer: { companyId } } } }) || 
                    await tx.productionPlan.create({
                      data: {
                        planNumber: `PP-AUTO-${Date.now().toString().slice(-6)}`,
                        status: 'APPROVED',
                        salesOrder: {
                          create: {
                            orderNumber: `SO-AUTO-${Date.now().toString().slice(-6)}`,
                            status: 'CONFIRMED',
                            totalAmount: 0,
                            subtotal: 0,
                            taxableAmount: 0,
                            createdById: report.createdById || 'system',
                            customerId: customer.id,
                          }
                        }
                      }
                    });

                  const wo = await tx.workOrder.create({
                    data: {
                      workOrderNumber: `WO-AUTO-${Date.now().toString().slice(-6)}`,
                      productionPlanId: plan.id,
                      quantity: qty,
                      status: 'READY_FOR_DISPATCH',
                    },
                  });

                  await tx.finishedGoods.create({
                    data: {
                      workOrderId: wo.id,
                      productId: item.productId,
                      quantity: qty,
                      availableQuantity: qty,
                      reservedQuantity: 0,
                      unit: 'PCS',
                      status: 'AVAILABLE',
                      receivedById: report.createdById || 'system',
                    },
                  });

                  await tx.stockHistory.create({
                    data: {
                      companyId: report.companyId,
                      productId: item.productId,
                      event: 'PRODUCTION_IN',
                      quantity: qty,
                      beforeQuantity: 0,
                      afterQuantity: qty,
                      sourceType: 'PRODUCTION_REPORT',
                      sourceId: report.id,
                      sourceItemId: item.id,
                      referenceNumber: report.reportNo,
                      actor: report.createdById || 'system',
                      remarks: `Startup auto-post for report ${report.reportNo}`,
                    },
                  });
                }
              }
            }

            await tx.productionDailyReport.update({
              where: { id: report.id },
              data: {
                stockPostedAt: new Date(),
                stockPostedBy: report.createdById || 'system',
              },
            });
          });
        }
        console.log('[STARTUP] Posting stock completed successfully.');
      }
    } catch (autoPostErr) {
      console.error('[PrismaService] Auto-post failed:', autoPostErr);
    }

    // Run target account provisioning & company alignment dynamically on startup
    try {
      const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

      // Ensure target company exists first to avoid FKEY violations
      let targetCompany = await this.company.findUnique({ where: { id: companyId } });
      if (!targetCompany) {
        targetCompany = await this.company.create({
          data: {
            id: companyId,
            publicId: 'COM-001',
            name: 'Himalaya Corp',
          }
        });
      }
      // 1. Align all existing company partitions
      try {
        await this.user.updateMany({
          where: { companyId: { not: companyId } },
          data: { companyId }
        });
        await this.employee.updateMany({
          where: { companyId: { not: companyId } },
          data: { companyId }
        });
        await this.workLocation.updateMany({
          where: { companyId: { not: companyId } },
          data: { companyId }
        });
        await this.attendance.updateMany({
          where: { companyId: { not: companyId } },
          data: { companyId }
        });
      } catch (alignErr) {
        console.warn('[PrismaService] Partition alignment notice:', alignErr?.message || alignErr);
      }

      // 2. Ensure all target accounts are seeded & linked
      const targetUsers = [
        { email: 'super.admin@himalayaerp.com', name: 'Super Admin', role: 'SUPER_ADMIN', empCode: 'EMP-SA-1' },
        { email: 'supersales1@himalayaerp.com', name: 'SuperSales 1', role: 'SUPER_SALES', empCode: 'EMP-SS-1' },
        { email: 'supersales2@himalayaerp.com', name: 'SuperSales 2', role: 'SUPER_SALES', empCode: 'EMP-SS-2' },
        { email: 'sales1@himalayaerp.com', name: 'Sales Executive 1', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-1' },
        { email: 'sales2@himalayaerp.com', name: 'Sales Executive 2', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-2' },
        { email: 'sales3@himalayaerp.com', name: 'Sales Executive 3', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-3' },
        { email: 'sales4@himalayaerp.com', name: 'Sales Executive 4', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-4' },
        { email: 'sales5@himalayaerp.com', name: 'Sales Executive 5', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-5' },
        { email: 'sales6@himalayaerp.com', name: 'Sales Executive 6', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-6' },
        { email: 'sales7@himalayaerp.com', name: 'Sales Executive 7', role: 'SALES_EXECUTIVE', empCode: 'EMP-S-7' },
        { email: 'plant.head@himalayaerp.com', name: 'Plant Head', role: 'PLANT_HEAD', empCode: 'EMP-PH-1' },
        { email: 'production.operator@himalayaerp.com', name: 'Production Operator', role: 'PRODUCTION_OPERATOR', empCode: 'EMP-PO-1' },
        { email: 'ravikant.tiwari@himalayaerp.com', name: 'Ravikant Tiwari', role: 'DISPATCH_EXECUTIVE', empCode: 'EMP-DE-1' },
        { email: 'sahad.dispatch@himalayaerp.com', name: 'Sahad Dispatch', role: 'DISPATCH_2', empCode: 'EMP-DE-2' },
        { email: 'finance.executive@himalayaerp.com', name: 'Finance Executive', role: 'FINANCE_EXECUTIVE', empCode: 'EMP-FE-1' },
        { email: 'sahad.accounts@himalayaerp.com', name: 'Finance Manager', role: 'FINANCE_MANAGER', empCode: 'EMP-FM-1' },
        { email: 'store.manager@himalayaerp.com', name: 'Store Manager', role: 'STORE_MANAGER', empCode: 'EMP-SM-1' },
        { email: 'hr@himalayaerp.com', name: 'HR Test', role: 'HR', empCode: 'EMP-1012' },
        { email: 'backoffice@himalayaerp.com', name: 'Back Office Executive', role: 'BACK_OFFICE', empCode: 'EMP-BO-1' },
      ];

      let dept = await this.department.findFirst({ where: { companyId, isActive: true } });
      if (!dept) {
        dept = await this.department.create({
          data: { code: 'DEPT-OPS', name: 'Operations', companyId, isActive: true }
        });
      }
      let loc = await this.workLocation.findFirst({ where: { companyId, isActive: true } });
      if (!loc) {
        loc = await this.workLocation.create({
          data: { code: 'LOC-HQ', name: 'Ahmedabad Head Office', companyId, isActive: true }
        });
      }

      const { hash } = require('bcrypt');
      const { randomUUID } = require('crypto');

      for (const t of targetUsers) {
        try {
          const dbRole = await this.role.findFirst({ where: { code: t.role } });
          if (!dbRole) continue;

          const passwordHash = await hash('admin123', 12);
          let user = await this.user.findUnique({ where: { email: t.email } });
          if (!user) {
            user = await this.user.create({
              data: {
                publicId: randomUUID(),
                email: t.email,
                password: passwordHash,
                name: t.name,
                roleId: dbRole.id,
                companyId,
                isActive: true
              }
            });
          } else {
            user = await this.user.update({
              where: { id: user.id },
              data: { companyId, roleId: dbRole.id, password: passwordHash, isActive: true }
            });
          }

          let employee = await this.employee.findFirst({
            where: { OR: [{ userId: user.id }, { workEmail: t.email }, { employeeCode: t.empCode }] }
          });

          if (!employee) {
            await this.employee.create({
              data: {
                publicId: `EMP-${t.empCode}`,
                companyId,
                userId: user.id,
                employeeCode: t.empCode,
                firstName: t.name.split(' ')[0],
                lastName: t.name.split(' ').slice(1).join(' ') || 'Staff',
                fullName: t.name,
                dateOfBirth: new Date('1990-01-01'),
                gender: 'OTHER',
                jobTitle: t.name,
                departmentId: dept.id,
                workLocationId: loc.id,
                employmentType: 'PERMANENT',
                joiningDate: new Date(),
                status: 'ACTIVE',
                workEmail: t.email,
                phoneNumber: '9876543210',
                residentialAddress: 'Default Address',
                emergencyContactName: 'Emergency',
                emergencyContactPhone: '9876543210',
                emergencyRelationship: 'Friend',
                panNumber: `PAN-${t.empCode}`.toUpperCase(),
                aadhaarNumberEncrypted: 'enc-auto',
                aadhaarLastFour: '1234',
                aadhaarHash: `hash-${t.empCode}`,
                bankName: 'State Bank of India',
                accountHolderName: t.name,
                bankAccountType: 'SAVINGS',
                bankAccountEncrypted: 'enc-auto',
                bankAccountLastFour: '1234',
                bankAccountHash: `bhash-${t.empCode}`,
                ifscCode: 'SBIN0001234'
              }
            });
          } else {
            await this.employee.update({
              where: { id: employee.id },
              data: { userId: user.id, companyId }
            });
          }
        } catch (innerErr) {
          console.error(`[PrismaService] Failed to provision/link user ${t.email}:`, innerErr);
        }
      }
      console.log('[PrismaService] Startup Target 17 accounts provisioning completed successfully.');

      // Reconciled at start of hook
    } catch (e) {
      console.error('[PrismaService] Error during startup target provisioning:', e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
