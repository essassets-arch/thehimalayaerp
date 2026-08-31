import { PrismaClient, Prisma } from '@prisma/client';
import { ProcurementService } from '../src/modules/procurement/procurement.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { ProductsService } from '../src/modules/products/products.service';
import { SequenceService } from '../src/common/sequence/sequence.service';

const prisma = new PrismaClient();
const sequenceService = new SequenceService(prisma as any);
const procurementService = new ProcurementService(prisma as any, sequenceService);
const inventoryService = new InventoryService(prisma as any);
const productsService = new ProductsService(prisma as any);

async function runTest() {
  console.log('--- Testing Verify Delivery → Automatic Raw Inventory Update Workflow ---');

  const runId = Date.now().toString().slice(-6);
  const testCompany = await prisma.company.upsert({
    where: { publicId: `COMP-RAWINV-${runId}` },
    update: {},
    create: {
      publicId: `COMP-RAWINV-${runId}`,
      name: `Raw Inv Test Corp ${runId}`,
    },
  });
  const companyId = testCompany.id;

  // 1. Create Supplier & Raw Material & Product
  const supplier = await prisma.supplier.create({
    data: {
      publicId: `SUP-TEST-${runId}`,
      companyId,
      name: `Apex Minerals & Materials Ltd ${runId}`,
    },
  });

  const product = await prisma.product.create({
    data: {
      publicId: `PRD-CEM-${runId}`,
      companyId,
      name: `OPC-53 Grade Cement Clinker ${runId}`,
      sku: `RM-CEM-${runId}`,
      category: 'Raw Material',
      productType: 'RAW_MATERIAL',
      unit: 'Bags',
      unitPrice: new Prisma.Decimal(500),
      minimumStock: new Prisma.Decimal(100),
    },
  });

  const rawMat = await prisma.rawMaterial.create({
    data: {
      publicId: `RM-CEMENT-${runId}`,
      companyId,
      name: `OPC-53 Grade Cement Clinker ${runId}`,
      sku: `RM-CEM-${runId}`,
      category: 'Raw Material',
      unit: 'Bags',
      minimumStock: new Prisma.Decimal(100),
    },
  });

  // Initial stock check
  let initialStockLevels = await inventoryService.getStockLevels(companyId);
  let rawMatStock = initialStockLevels.find((s) => s.productId === product.id || s.rawMaterialId === rawMat.id);
  console.log(`Initial stock for ${rawMat.name}:`, rawMatStock ? rawMatStock.quantity : 0);

  // 2. Create Purchase Order for 500 Bags
  const poCreated = await prisma.purchaseOrder.create({
    data: {
      publicId: `PO-AUTOINV-${runId}`,
      poNumber: `PO-AUTOINV-${runId}`,
      companyId,
      supplierId: supplier.id,
      status: 'ORDERED',
      totalAmount: new Prisma.Decimal(250000),
      currency: 'INR',
      items: {
        create: [
          {
            productId: product.id,
            quantity: new Prisma.Decimal(500),
            unitPrice: new Prisma.Decimal(500),
            receivedQuantity: new Prisma.Decimal(0),
            acceptedQuantity: new Prisma.Decimal(0),
          },
        ],
      },
    },
  });

  const po: any = await prisma.purchaseOrder.findUnique({
    where: { id: poCreated.id },
    include: { items: true },
  });

  console.log(`Created PO ${po.poNumber} for 500 ${product.unit} of ${product.name}`);

  // 3. Perform Delivery Verification (Verify Delivery & Confirm)
  console.log('--- Executing Delivery Verification on Purchase Order ---');
  const deliveryResult: any = await procurementService.verifyDelivery({
    purchaseOrderId: po.id,
    deliveryDate: new Date().toISOString(),
    deliveryChallanNumber: `CH-DEL-${runId}`,
    invoiceNumber: `INV-DEL-${runId}`,
    remarks: 'Delivered at Central Raw Material Depot Dock Bay #1',
    items: [
      {
        purchaseOrderItemId: po.items[0].id,
        productId: product.id,
        materialName: product.name,
        materialCode: product.sku,
        deliveredQuantity: 500,
        acceptedQuantity: 500,
        rejectedQuantity: 0,
        remarks: '100% Inspected & Accepted in Full',
      },
    ],
  }, undefined, companyId);

  console.log(`✅ Delivery Verified successfully. GRN generated: ${deliveryResult.delivery.grnNumber || deliveryResult.delivery.publicId}, Status: ${deliveryResult.delivery.status}`);

  // 4. Verify Automatic Inventory Update
  const updatedStockLevels = await inventoryService.getStockLevels(companyId);
  const updatedRawMatStock = updatedStockLevels.find((s) => s.productId === product.id || s.rawMaterialId === rawMat.id);

  console.log(`Updated stock for ${rawMat.name}:`, updatedRawMatStock ? updatedRawMatStock.quantity : 0);

  if (!updatedRawMatStock || updatedRawMatStock.quantity !== 500) {
    throw new Error(`Expected stock to be 500 Bags, but got ${updatedRawMatStock?.quantity}`);
  }

  // 5. Verify /products?type=RAW_MATERIAL mapping
  const rawMaterialsList: any[] = await productsService.findAll(companyId, undefined, undefined, 'RAW_MATERIAL');
  const listedItem = rawMaterialsList.find((rm: any) => rm.id === rawMat.id || rm.sku === product.sku);
  console.log(`Raw Inventory Product listing found item: ${listedItem?.name}, SKU: ${listedItem?.sku}`);

  // Match stock in enriched inventory
  const enrichedStock = updatedStockLevels.find((s: any) => s.productId === listedItem.id || s.rawMaterialId === listedItem.id || s.productId === product.id);
  console.log(`Enriched stock quantity displayed in /store/raw-inventory: ${enrichedStock?.quantity} ${listedItem?.unit}`);

  if (!enrichedStock || enrichedStock.quantity !== 500) {
    throw new Error(`Enriched stock in /store/raw-inventory should be 500, but got ${enrichedStock?.quantity}`);
  }

  console.log('\n======================================================');
  console.log('🎉 VERIFY DELIVERY → RAW INVENTORY AUTOMATION VERIFIED! 🎉');
  console.log('======================================================');
}

runTest()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
