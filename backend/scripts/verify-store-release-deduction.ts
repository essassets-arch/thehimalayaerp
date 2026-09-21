import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { MaterialRequestsService } from '../src/modules/material-requests/material-requests.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('🚀 Starting Verification: Automatic Inventory Deduction on Store Material Release...');

  // 1. Locate Company
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found in database.');
  }
  const companyId = company.id;
  console.log(`✓ Company located: ${company.name} (${companyId})`);

  // 2. Locate or create a test user
  let user = await prisma.user.findFirst({ where: { companyId } });
  if (!user) {
    user = await prisma.user.findFirst();
  }
  const userId = user?.id || 'SYSTEM';

  // 3. Locate or create a warehouse
  let warehouse = await prisma.warehouse.findFirst({ where: { companyId } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId,
        name: 'Main Store',
      },
    });
  }
  console.log(`✓ Warehouse located: ${warehouse.name} (${warehouse.id})`);

  // 4. Create a unique test raw material
  const timestamp = Date.now();
  const testSku = `RM-TEST-${timestamp}`;
  const testName = `Automated Test Resin ${timestamp}`;

  const rawProduct = await prisma.product.create({
    data: {
      companyId,
      publicId: `PRD-${testSku}`,
      sku: testSku,
      name: testName,
      unit: 'Kg',
      unitPrice: 150,
      productType: 'RAW_MATERIAL',
      category: 'Raw Material',
    },
  });

  const rawMaterial = await prisma.rawMaterial.create({
    data: {
      companyId,
      publicId: `RAW-${testSku}`,
      sku: testSku,
      name: testName,
      unit: 'Kg',
      minimumStock: 20,
    },
  });
  console.log(`✓ Test Raw Material created: ${testName} (ID: ${rawProduct.id})`);

  // Instantiate services
  const inventoryService = new InventoryService(prisma as any);
  const materialRequestsService = new MaterialRequestsService(prisma as any, null as any);

  try {
    // 5. Seed initial stock: 100 Kg IN
    await prisma.inventoryTransaction.create({
      data: {
        companyId,
        warehouseId: warehouse.id,
        productId: rawProduct.id,
        rawMaterialId: rawMaterial.id,
        type: 'IN',
        quantity: 100,
        referenceId: `PO-INIT-${timestamp}`,
        referenceType: 'Verify Delivery',
      },
    });

    // Verify initial stock level is 100
    const initialLevels = await inventoryService.getStockLevels(companyId);
    const initialStockItem = initialLevels.find(
      (s) => s.productId === rawProduct.id || s.rawMaterialId === rawMaterial.id,
    );
    const initialQty = Number(initialStockItem?.quantity || 0);
    console.log(`✓ Initial Stock Level: ${initialQty} Kg`);
    if (initialQty !== 100) {
      throw new Error(`Expected initial stock 100, got ${initialQty}`);
    }

    // 6. Create Material Request for 40 Kg
    const mr = await prisma.materialRequest.create({
      data: {
        publicId: `MR-TEST-${timestamp}`,
        companyId,
        requestedById: userId,
        status: 'PENDING_STORE_APPROVAL',
        workOrderNo: `WO-TEST-${timestamp}`,
        notes: 'Automated verification request',
        items: {
          create: [
            {
              productId: rawProduct.id,
              quantity: 40,
              approvedQuantity: 40,
              issuedQuantity: 0,
              unit: 'Kg',
              status: 'PENDING',
            },
          ],
        },
      },
      include: { items: true },
    });
    const mrItemId = mr.items[0].id;
    console.log(`✓ Material Request created: ${mr.publicId} (Item: ${mrItemId}, Qty: 40 Kg)`);

    // 7. ACTION: Issue 25 Kg to Production (partial issue)
    console.log('\n📦 Step 1: Issuing 25 Kg to Production...');
    await materialRequestsService.updateStatus(
      mr.id,
      {
        status: 'STORE_APPROVED',
        items: [{ id: mrItemId, issuedQty: 25 }],
        metadata: {
          issueReference: `ISS-${mr.publicId}-0001`,
          issuedBy: 'Store Test Manager',
          department: 'Production Assembly',
        },
      },
      userId,
      companyId,
    );

    // Verify stock decreased from 100 to 75
    const levelsAfterFirstIssue = await inventoryService.getStockLevels(companyId);
    const itemAfterFirstIssue = levelsAfterFirstIssue.find(
      (s) => s.productId === rawProduct.id || s.rawMaterialId === rawMaterial.id,
    );
    const stockAfterFirstIssue = Number(itemAfterFirstIssue?.quantity || 0);
    console.log(`✓ Stock Level after issuing 25 Kg: ${stockAfterFirstIssue} Kg (Expected: 75 Kg)`);
    if (stockAfterFirstIssue !== 75) {
      throw new Error(`Expected stock 75, got ${stockAfterFirstIssue}`);
    }

    // Verify InventoryTransaction of type OUT was created
    const outTx1 = await prisma.inventoryTransaction.findFirst({
      where: {
        companyId,
        type: 'OUT',
        referenceType: 'ISSUE_TO_PRODUCTION',
        referenceId: mr.publicId,
      },
    });
    if (!outTx1 || Number(outTx1.quantity) !== 25) {
      throw new Error('InventoryTransaction of type OUT with 25 Kg was not found.');
    }
    console.log(`✓ InventoryTransaction OUT verified: ${outTx1.id} (Quantity: ${outTx1.quantity})`);

    // Verify Movement Log contains the transaction
    const logData = await inventoryService.getMaterialMovementLog(companyId, rawProduct.id);
    const issueEntry = (logData.history || []).find((h: any) => h.type === 'OUT');
    if (!issueEntry) {
      throw new Error('No OUT transaction found in getMaterialMovementLog.');
    }
    console.log(`✓ Movement Log entry verified: Source="${issueEntry.source}", Qty=-${issueEntry.quantity}, Balance=${issueEntry.balance}`);
    if (issueEntry.source !== 'Issue to Production') {
      throw new Error(`Expected source "Issue to Production", got "${issueEntry.source}"`);
    }

    // 8. Idempotency test: Re-calling with same issuedQty (25) should NOT double-deduct
    console.log('\n📦 Step 2: Idempotency check (re-submitting issuedQty: 25)...');
    await materialRequestsService.updateStatus(
      mr.id,
      {
        status: 'STORE_APPROVED',
        items: [{ id: mrItemId, issuedQty: 25 }],
        metadata: {
          issueReference: `ISS-${mr.publicId}-0001`,
        },
      },
      userId,
      companyId,
    );
    const levelsAfterReissue = await inventoryService.getStockLevels(companyId);
    const itemAfterReissue = levelsAfterReissue.find(
      (s) => s.productId === rawProduct.id || s.rawMaterialId === rawMaterial.id,
    );
    const stockAfterReissue = Number(itemAfterReissue?.quantity || 0);
    console.log(`✓ Stock Level remains: ${stockAfterReissue} Kg (No duplicate deduction)`);
    if (stockAfterReissue !== 75) {
      throw new Error(`Expected stock to remain 75, got ${stockAfterReissue}`);
    }

    // 9. Incremental Issue test: Issue remaining 15 Kg (cumulative: 40)
    console.log('\n📦 Step 3: Incremental issue of 15 Kg (cumulative: 40 Kg)...');
    await materialRequestsService.updateStatus(
      mr.id,
      {
        status: 'ISSUED_TO_PRODUCTION',
        items: [{ id: mrItemId, issuedQty: 40 }],
        metadata: {
          issueReference: `ISS-${mr.publicId}-0002`,
          issuedBy: 'Store Test Manager',
          department: 'Production Assembly',
        },
      },
      userId,
      companyId,
    );
    const levelsFinal = await inventoryService.getStockLevels(companyId);
    const itemFinal = levelsFinal.find(
      (s) => s.productId === rawProduct.id || s.rawMaterialId === rawMaterial.id,
    );
    const stockFinal = Number(itemFinal?.quantity || 0);
    console.log(`✓ Final Stock Level: ${stockFinal} Kg (Expected: 60 Kg)`);
    if (stockFinal !== 60) {
      throw new Error(`Expected final stock 60, got ${stockFinal}`);
    }

    // Verify total transactions count: 1 IN (100) + 2 OUT (25 + 15) = 3 transactions
    const allTxs = await prisma.inventoryTransaction.findMany({
      where: {
        companyId,
        OR: [{ productId: rawProduct.id }, { rawMaterialId: rawMaterial.id }],
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`✓ Total Inventory Transactions: ${allTxs.length} (Expected: 3)`);
    allTxs.forEach((t, i) => {
      console.log(`   [Tx ${i + 1}] Type: ${t.type}, Qty: ${t.quantity}, RefType: ${t.referenceType}, RefId: ${t.referenceId}`);
    });

    console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  } finally {
    // Cleanup test artifacts
    console.log('\n🧹 Cleaning up test records...');
    await prisma.inventoryTransaction.deleteMany({
      where: {
        OR: [{ productId: rawProduct.id }, { rawMaterialId: rawMaterial.id }],
      },
    });
    await prisma.stockHistory.deleteMany({
      where: {
        OR: [{ productId: rawProduct.id }, { productId: rawMaterial.id }],
      },
    });
    await prisma.auditLog.deleteMany({
      where: {
        entityId: { in: [rawProduct.id, rawMaterial.id] },
      },
    });
    await prisma.materialRequestItem.deleteMany({
      where: { productId: rawProduct.id },
    });
    await prisma.materialRequest.deleteMany({
      where: { publicId: `MR-TEST-${timestamp}` },
    });
    await prisma.rawMaterial.deleteMany({
      where: { id: rawMaterial.id },
    });
    await prisma.product.deleteMany({
      where: { id: rawProduct.id },
    });
    await prisma.$disconnect();
    console.log('✓ Cleanup complete.');
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
