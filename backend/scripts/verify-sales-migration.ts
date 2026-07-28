import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const RAW_EXPORT_PATH = path.join(__dirname, '../migration-data/raw/legacy-sales-export.json');

async function main() {
  console.log('Starting Sales Migration Verification...');

  if (!fs.existsSync(RAW_EXPORT_PATH)) {
    console.error('Export file missing.');
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(RAW_EXPORT_PATH, 'utf-8'));
  const legacyOrders = exportData.orders || [];

  let missingOrders = 0;
  let financialMismatches = 0;

  for (const rawOrder of legacyOrders) {
    const legacyId = rawOrder.id || rawOrder.orderNo || rawOrder.orderNumber;
    if (!legacyId) continue;

    const ref = await prisma.legacyMigrationReference.findUnique({
      where: {
        sourceSystem_entityType_legacyId: {
          sourceSystem: 'legacy-zustand-sales',
          entityType: 'SalesOrder',
          legacyId: legacyId
        }
      }
    });

    if (!ref) {
      missingOrders++;
      console.warn(`[MISSING] Legacy Order ${legacyId} has no migration reference.`);
      continue;
    }

    const dbOrder = await prisma.salesOrder.findUnique({ where: { id: ref.newEntityId } });
    if (!dbOrder) {
      missingOrders++;
      console.warn(`[MISSING] Legacy Order ${legacyId} reference points to missing SalesOrder ${ref.newEntityId}.`);
      continue;
    }

    const legacyTotal = Number(rawOrder.totalAmount || rawOrder.totalValue || rawOrder.grandTotal || 0);
    if (Math.abs(legacyTotal - Number(dbOrder.totalAmount)) > 0.01) {
      financialMismatches++;
      console.warn(`[MISMATCH] Order ${legacyId} total legacy=${legacyTotal}, db=${dbOrder.totalAmount}`);
    }
  }

  console.log('\n--- Verification Summary ---');
  console.log(`Total Legacy Orders Checked: ${legacyOrders.length}`);
  console.log(`Missing from DB: ${missingOrders}`);
  console.log(`Financial Mismatches: ${financialMismatches}`);

  if (missingOrders === 0 && financialMismatches === 0) {
    console.log('\n✅ RECONCILIATION PASSED!');
  } else {
    console.error('\n❌ RECONCILIATION FAILED!');
    process.exit(1);
  }
}

main().catch(console.error);
