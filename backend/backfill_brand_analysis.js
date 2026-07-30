const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  const legacyRecords = await prisma.brandAnalysis.findMany();
  console.log(`Found ${legacyRecords.length} legacy BrandAnalysis records to migrate.`);

  let migrated = 0;
  for (const record of legacyRecords) {
    // Check if it already exists
    const existing = await prisma.brandAnalysisRequest.findUnique({
      where: { requestNo: record.requestNumber },
    });

    if (!existing) {
      await prisma.brandAnalysisRequest.create({
        data: {
          requestNo: record.requestNumber,
          productName: record.productName,
          brandName: record.brandName,
          quantity: record.quantity || 1,
          quantityUnit: 'Pieces', // Defaulting since it wasn't tracked
          imageUrl: 'https://via.placeholder.com/150', // Default since it wasn't required
          reason: record.remarks || 'Migrated from legacy system',
          orderDetails: `PO: ${record.poNumber}, Invoice: ${record.invoiceNumber}`,
          requestedById: record.createdById,
          status: record.status === 'PENDING' ? 'PENDING_SUPER_ADMIN_APPROVAL' :
                 record.status === 'REVIEWED' ? 'FINANCE_ANALYSIS_IN_PROGRESS' : 'FINANCE_ANALYSIS_COMPLETED',
          approvedById: record.reviewedById,
          approvedAt: record.reviewedAt,
          financeCompletedById: record.completedById,
          financeCompletedAt: record.completedAt,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }
      });
      migrated++;
    }
  }

  console.log(`Successfully migrated ${migrated} records.`);
}

backfill()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
