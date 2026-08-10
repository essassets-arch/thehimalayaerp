const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SIZES = [
  '10X10',
  '12X12',
  '15X15',
  '18X18',
  '18X24',
  '21X21',
  '24X24',
  '28X28',
  '30X30',
  '36X36',
];

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

async function migrate() {
  console.log('=== STARTING FRPMHCELD CANONICAL MIGRATION ===\n');

  const stats = {
    foundHcld: 0,
    foundHceld: 0,
    renamed: 0,
    inserted: 0,
    fgCreated: 0,
    duplicatesDetected: 0,
    finalProducts: [],
  };

  // 1. Initial Scan
  const initialHcld = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'FRPMHCLD', mode: 'insensitive' } },
        { sku: { contains: 'FRPMHCLD', mode: 'insensitive' } },
      ],
    },
  });
  stats.foundHcld = initialHcld.length;

  const initialHceld = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'FRPMHCELD', mode: 'insensitive' } },
        { sku: { contains: 'FRPMHCELD', mode: 'insensitive' } },
      ],
    },
  });
  stats.foundHceld = initialHceld.length;

  console.log(`Initial Scan: Found ${stats.foundHcld} FRPMHCLD products, ${stats.foundHceld} FRPMHCELD products.`);

  const companies = await prisma.company.findMany();
  let defaultUser = await prisma.user.findFirst();

  for (const comp of companies) {
    console.log(`\nProcessing Company: ${comp.name} (${comp.id})...`);

    // Ensure dummy Customer, SalesOrder & ProductionPlan for placeholder work orders if needed
    let dummyCustomer = await prisma.customer.findFirst({ where: { companyId: comp.id } });
    if (!dummyCustomer) {
      dummyCustomer = await prisma.customer.create({
        data: {
          customerCode: uid('CUST'),
          companyId: comp.id,
          companyName: 'Internal Stock Customer',
          email: `internal-${comp.id.substring(0, 5)}@himalaya.com`,
          phone: '0000000000',
        },
      });
    }

    const orderNo = `SO-BASE-STOCK-${comp.id.substring(0, 4)}`;
    let dummySo = await prisma.salesOrder.findFirst({ where: { orderNumber: orderNo } });
    if (!dummySo) {
      dummySo = await prisma.salesOrder.create({
        data: {
          orderNumber: orderNo,
          customerId: dummyCustomer.id,
          subtotal: 0,
          taxableAmount: 0,
          totalAmount: 0,
          createdById: defaultUser ? defaultUser.id : 'SYSTEM',
        },
      });
    }

    let dummyPlan = await prisma.productionPlan.findFirst({ where: { salesOrderId: dummySo.id } });
    if (!dummyPlan) {
      dummyPlan = await prisma.productionPlan.create({
        data: {
          planNumber: `PP-BASE-STOCK-${comp.id.substring(0, 4)}`,
          salesOrderId: dummySo.id,
          status: 'APPROVED',
        },
      });
    }

    for (const size of SIZES) {
      const canonicalName = `FRPMHCELD ${size}`;
      const canonicalSku = `FRPMHCELD${size}`;
      const legacyName = `FRPMHCLD ${size}`;
      const legacySku = `FRPMHCLD${size}`;

      // Check existing rows for this size in this company
      const existingHcldList = await prisma.product.findMany({
        where: {
          companyId: comp.id,
          OR: [
            { name: { equals: legacyName, mode: 'insensitive' } },
            { sku: { equals: legacySku, mode: 'insensitive' } },
          ],
        },
      });

      const existingHceldList = await prisma.product.findMany({
        where: {
          companyId: comp.id,
          OR: [
            { name: { equals: canonicalName, mode: 'insensitive' } },
            { sku: { equals: canonicalSku, mode: 'insensitive' } },
          ],
        },
      });

      let targetProduct = null;

      if (existingHcldList.length > 0 && existingHceldList.length === 0) {
        // Case A: FRPMHCLD exists, FRPMHCELD does not exist -> Rename FRPMHCLD in-place
        targetProduct = existingHcldList[0];
        console.log(`  [RENAME] Renaming FRPMHCLD (${targetProduct.id}) -> ${canonicalName}`);
        targetProduct = await prisma.product.update({
          where: { id: targetProduct.id },
          data: {
            name: canonicalName,
            sku: canonicalSku,
            brand: 'HIMALAYA',
            productType: 'MANUFACTURING',
            category: 'FRP COVER',
            dispatchCategory: 'D1',
            isActive: true,
          },
        });
        stats.renamed++;

        // If extra HCLD duplicates exist for this size, remove them
        for (let i = 1; i < existingHcldList.length; i++) {
          console.log(`  [CLEANUP DUPLICATE HCLD] Removing excess row ${existingHcldList[i].id}`);
          stats.duplicatesDetected++;
          await prisma.product.delete({ where: { id: existingHcldList[i].id } }).catch(() => {});
        }
      } else if (existingHceldList.length > 0) {
        // Case B: FRPMHCELD already exists
        targetProduct = existingHceldList[0];
        console.log(`  [UPDATE CANONICAL] Standardizing fields for FRPMHCELD (${targetProduct.id})`);
        targetProduct = await prisma.product.update({
          where: { id: targetProduct.id },
          data: {
            name: canonicalName,
            sku: canonicalSku,
            brand: 'HIMALAYA',
            productType: 'MANUFACTURING',
            category: 'FRP COVER',
            dispatchCategory: 'D1',
            isActive: true,
          },
        });

        // Clean up any extra HCELD or HCLD duplicate rows for this size
        for (let i = 1; i < existingHceldList.length; i++) {
          console.log(`  [CLEANUP DUPLICATE HCELD] Removing excess row ${existingHceldList[i].id}`);
          stats.duplicatesDetected++;
          await prisma.product.delete({ where: { id: existingHceldList[i].id } }).catch(() => {});
        }
        for (const hcldRow of existingHcldList) {
          console.log(`  [CLEANUP HCLD DUPLICATE] Removing duplicate HCLD row ${hcldRow.id}`);
          stats.duplicatesDetected++;
          await prisma.product.delete({ where: { id: hcldRow.id } }).catch(() => {});
        }
      } else {
        // Case C: Neither exists -> Create missing canonical product
        console.log(`  [INSERT] Creating missing canonical product ${canonicalName}`);
        targetProduct = await prisma.product.create({
          data: {
            companyId: comp.id,
            publicId: uid('PROD'),
            name: canonicalName,
            sku: canonicalSku,
            brand: 'HIMALAYA',
            productType: 'MANUFACTURING',
            category: 'FRP COVER',
            dispatchCategory: 'D1',
            isActive: true,
            unit: 'SET',
            unitPrice: 0,
            minimumStock: 0,
            description: `FRP Manhole Cover Extra Light Duty ${size}`,
          },
        });
        stats.inserted++;
      }

      stats.finalProducts.push({
        companyName: comp.name,
        companyId: comp.id,
        size,
        id: targetProduct.id,
        name: targetProduct.name,
        sku: targetProduct.sku,
        category: targetProduct.category,
        dispatchCategory: targetProduct.dispatchCategory,
        productType: targetProduct.productType,
      });

      // Ensure base FinishedGoods row exists for this product
      const existingFg = await prisma.finishedGoods.findFirst({
        where: { productId: targetProduct.id },
      });

      if (!existingFg) {
        console.log(`  [FG CREATE] Creating base FinishedGoods row for ${targetProduct.name} (${targetProduct.id})`);

        const woNumber = `WO-BASE-${targetProduct.id.substring(0, 8)}`;
        let baseWo = await prisma.workOrder.findFirst({ where: { workOrderNumber: woNumber } });
        if (!baseWo) {
          baseWo = await prisma.workOrder.create({
            data: {
              workOrderNumber: woNumber,
              productionPlanId: dummyPlan.id,
              status: 'COMPLETED',
              quantity: 0,
            },
          });
        }

        await prisma.finishedGoods.create({
          data: {
            workOrderId: baseWo.id,
            productId: targetProduct.id,
            quantity: 0,
            availableQuantity: 0,
            unit: 'SET',
            status: 'AVAILABLE',
            receivedAt: new Date(),
          },
        });
        stats.fgCreated++;
      }
    }
  }

  console.log('\n================ MIGRATION REPORT ================');
  console.log(`- Products found under FRPMHCLD: ${stats.foundHcld}`);
  console.log(`- Products found under FRPMHCELD: ${stats.foundHceld}`);
  console.log(`- Products renamed in-place: ${stats.renamed}`);
  console.log(`- Missing products inserted: ${stats.inserted}`);
  console.log(`- Base FinishedGoods rows created: ${stats.fgCreated}`);
  console.log(`- Duplicate products detected/cleaned: ${stats.duplicatesDetected}`);
  console.log(`\n- Final Product Count per company (should be 10 canonical products):`);

  const groupedFinal = {};
  stats.finalProducts.forEach((p) => {
    if (!groupedFinal[p.companyName]) groupedFinal[p.companyName] = [];
    groupedFinal[p.companyName].push(p);
  });

  for (const [compName, prods] of Object.entries(groupedFinal)) {
    console.log(`\nCompany: ${compName} (${prods.length} products):`);
    prods.forEach(p => {
      console.log(`   * ${p.name} | SKU: ${p.sku} | ID: ${p.id} | Type: ${p.productType} | Cat: ${p.category} | Dispatch: ${p.dispatchCategory}`);
    });
  }
}

migrate().finally(() => prisma.$disconnect());
