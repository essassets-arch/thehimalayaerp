const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const karan = await prisma.supplier.findFirst({
    where: { name: { equals: 'karan', mode: 'insensitive' } }
  });
  if (!karan) {
    throw new Error('Supplier karan not found');
  }

  const po = await prisma.purchaseOrder.findFirst({
    where: {
      OR: [
        { publicId: 'PO-DRAFT-2026-000002' },
        { draftPoNo: 'PO-DRAFT-2026-000002' },
        { id: '10961f4a-fc23-4d9e-91b9-ea02acc657a4' }
      ]
    }
  });

  if (po) {
    const snap = typeof po.snapshot === 'object' && po.snapshot ? po.snapshot : {};
    snap.vendorName = 'karan';
    delete snap.plantHeadApprovalRemarks;
    delete snap.approvalRemarks;

    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: 'DRAFT',
        publicId: 'PO-DRAFT-2026-000002',
        poNumber: 'PO-DRAFT-2026-000002',
        supplierId: karan.id,
        orderRemarks: null,
        superAdminApprovedAt: null,
        superAdminApprovedById: null,
        superAdminRejectedAt: null,
        superAdminRejectedById: null,
        superAdminRejectionReason: null,
        orderedAt: null,
        orderedById: null,
        snapshot: snap
      }
    });
    console.log('Reset PO-DRAFT-2026-000002 to DRAFT with supplier karan and poNumber PO-DRAFT-2026-000002');
  } else {
    console.log('PO-DRAFT-2026-000002 not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
