const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const company = await prisma.company.findFirst();
  const user = await prisma.user.findFirst();
  const product = await prisma.product.findFirst();
  const warehouse = await prisma.warehouse.findFirst();

  console.log('Parameters:');
  console.log('Company ID:', company?.id);
  console.log('User ID:', user?.id);
  console.log('Product ID:', product?.id);
  console.log('Warehouse ID:', warehouse?.id);

  try {
    const res = await prisma.$transaction(async tx => {
      // 1. Create PurchaseIndent
      const row = await tx.purchaseIndent.create({
        data: {
          publicId: 'PI-TEST-9999',
          companyId: company.id,
          requestedById: user.id,
          status: 'DRAFT',
          department: 'STORE',
          warehouseId: warehouse.id,
          requiredDate: new Date(),
          priority: 'NORMAL',
          businessReason: 'Test business reason',
          remarks: 'Test remarks',
          items: {
            create: [
              {
                productId: product.id,
                quantity: 50,
                estimatedUnitRate: 10,
                lineRemarks: 'Test line remarks'
              }
            ]
          }
        }
      });
      console.log('Step 1: PurchaseIndent created.');

      // 2. Create status history
      await tx.purchaseIndentStatusHistory.create({
        data: {
          purchaseIndentId: row.id,
          newStatus: row.status,
          actorId: user.id
        }
      });
      console.log('Step 2: Status history created.');

      // 3. Create AuditLog
      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          companyId: company.id,
          action: 'INDENT_CREATED',
          entityType: 'PurchaseIndent',
          entityId: row.id,
          after: { status: row.status }
        }
      });
      console.log('Step 3: AuditLog created.');

      // 4. NotifyRole
      const roleCode = 'PLANT_HEAD';
      const title = 'Material indent created';
      const message = `${row.publicId} is ready for review.`;
      const entityType = 'PurchaseIndent';
      const entityId = row.id;

      const usersToNotify = await tx.user.findMany({
        where: {
          companyId: company.id,
          isActive: true,
          role: { code: Array.isArray(roleCode) ? { in: roleCode } : roleCode }
        },
        select: { id: true }
      });
      console.log('Found users to notify:', usersToNotify);

      if (usersToNotify.length) {
        await tx.notification.createMany({
          data: usersToNotify.map(u => ({
            companyId: company.id,
            userId: u.id,
            title,
            message,
            entityType,
            entityId
          }))
        });
        console.log('Step 4: Notifications created.');
      }

      return row;
    });

    console.log('Full transaction succeeded!', res);
  } catch (err) {
    console.error('Error during transaction:', err);
  }
}

run().finally(() => prisma.$disconnect());
