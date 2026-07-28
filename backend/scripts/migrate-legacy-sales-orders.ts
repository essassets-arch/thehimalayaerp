import { PrismaClient, Prisma, SalesOrderStatus, CreditStatus, AllocationStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { validateLegacyOrder } from './sales-migration/validators';
import { deriveStatuses } from './sales-migration/status-map';

const prisma = new PrismaClient();
const MIGRATION_SYSTEM_USER = 'migration-system@himalayaerp.local';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isApply = args.includes('--apply');

if (!isDryRun && !isApply) {
  console.error('Usage: tsx migrate-legacy-sales-orders.ts [--dry-run | --apply]');
  process.exit(1);
}

const RAW_EXPORT_PATH = path.join(__dirname, '../migration-data/raw/legacy-sales-export.json');
const REPORT_PATH = path.join(__dirname, '../migration-data/reports/sales-migration-summary.json');
const REJECTED_PATH = path.join(__dirname, '../migration-data/rejected/sales-orders.json');

async function main() {
  console.log(`Starting Sales Migration in ${isDryRun ? 'DRY RUN' : 'APPLY'} mode`);
  
  if (!fs.existsSync(RAW_EXPORT_PATH)) {
    console.error(`Export file not found at ${RAW_EXPORT_PATH}. Run frontend export first.`);
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(RAW_EXPORT_PATH, 'utf-8'));
  const legacyOrders = exportData.orders || [];

  const report = {
    sourceOrders: legacyOrders.length,
    validOrders: 0,
    createdOrders: 0,
    updatedOrders: 0,
    skippedExistingOrders: 0,
    rejectedOrders: 0,
    ambiguousCustomers: 0,
    unresolvedProducts: 0,
    financialMismatches: 0,
    statusWarnings: 0,
    timelineEventsCreated: 0
  };

  const rejectedRecords = [];
  
  // Find or create admin user for migration
  let migrationUser = await prisma.user.findUnique({ where: { email: MIGRATION_SYSTEM_USER } });
  if (!migrationUser && isApply) {
    const firstCompany = await prisma.company.findFirst();
    const firstRole = await prisma.role.findFirst();
    migrationUser = await prisma.user.create({
      data: {
        publicId: 'USR-MIG-' + Date.now(),
        email: MIGRATION_SYSTEM_USER,
        password: 'migration-only',
        name: 'System Migration',
        companyId: firstCompany?.id as string,
        roleId: firstRole?.id as string,
      }
    });
  }

  const defaultCompany = await prisma.company.findFirst();

  for (const rawOrder of legacyOrders) {
    const validation = validateLegacyOrder(rawOrder);
    
    if (!validation.valid || !validation.normalized) {
      report.rejectedOrders++;
      rejectedRecords.push({ reason: 'Validation Failed', errors: validation.errors, raw: rawOrder });
      continue;
    }

    const order = validation.normalized;
    report.validOrders++;

    // 1. Check Migration Idempotency
    const existingRef = await prisma.legacyMigrationReference.findUnique({
      where: {
        sourceSystem_entityType_legacyId: {
          sourceSystem: 'legacy-zustand-sales',
          entityType: 'SalesOrder',
          legacyId: order.legacyId
        }
      }
    });

    if (existingRef) {
      report.skippedExistingOrders++;
      continue;
    }

    // 2. Resolve Customer
    let dbCustomer = null;
    if (order.customerId && order.customerId.length === 36) { // UUID check roughly
      dbCustomer = await prisma.customer.findUnique({ where: { id: order.customerId } });
    }
    if (!dbCustomer && order.customerName) {
      // Search by exact name match
      dbCustomer = await prisma.customer.findFirst({
        where: { companyName: { equals: order.customerName, mode: 'insensitive' } }
      });
    }

    if (!dbCustomer) {
      report.ambiguousCustomers++;
      if (isApply && defaultCompany) {
        // Create stub customer
        dbCustomer = await prisma.customer.create({
          data: {
            publicId: 'CUST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            companyId: defaultCompany.id,
            companyName: order.customerName || 'Unknown Customer',
          }
        });
      } else {
        rejectedRecords.push({ reason: 'Ambiguous Customer', errors: ['Could not resolve or create customer'], raw: rawOrder });
        continue;
      }
    }

    // 3. Resolve Products & Check Items
    const resolvedItems = [];
    let subtotalCalc = 0;
    let itemResolveFailed = false;

    for (const item of order.items) {
      let dbProduct = null;
      if (item.productId && item.productId.length === 36) {
        dbProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      }
      if (!dbProduct && item.productName) {
        dbProduct = await prisma.product.findFirst({
          where: { name: { equals: item.productName, mode: 'insensitive' } }
        });
      }

      if (!dbProduct) {
        report.unresolvedProducts++;
        if (isApply && defaultCompany) {
          dbProduct = await prisma.product.create({
            data: {
              publicId: 'PRD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
              companyId: defaultCompany.id,
              name: item.productName || 'Unknown Product',
              unit: item.unit || 'PCS',
              unitPrice: Number(item.unitPrice || 0),
            }
          });
        } else {
          itemResolveFailed = true;
          break;
        }
      }

      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || dbProduct?.unitPrice || 0);
      const lineTotal = qty * price;
      subtotalCalc += lineTotal;

      resolvedItems.push({
        productId: dbProduct!.id,
        productNameSnapshot: dbProduct!.name,
        productCodeSnapshot: dbProduct!.sku || null,
        orderedQuantity: qty,
        unit: dbProduct!.unit,
        unitPrice: price,
        lineTotal: lineTotal,
      });
    }

    if (itemResolveFailed || resolvedItems.length === 0) {
      report.rejectedOrders++;
      rejectedRecords.push({ reason: 'Unresolved Products / Missing Items', raw: rawOrder });
      continue;
    }

    // 4. Recalculate Financials
    const legacyTotal = Number(order.totalAmount || order.totalValue || order.grandTotal || 0);
    const computedTotal = subtotalCalc + Number(order.taxAmount || 0) + Number(order.freightAmount || 0) - Number(order.discountAmount || 0);
    
    if (Math.abs(legacyTotal - computedTotal) > 0.01) {
      report.financialMismatches++;
      // Warning logged, but continue with computed total if safe, or legacy total. Let's use legacy total to preserve history.
    }

    // 5. Derive Statuses
    const statuses = deriveStatuses(order.status || 'NEW', order);

    if (isApply) {
      try {
        await prisma.$transaction(async (tx) => {
          const createdOrder = await tx.salesOrder.create({
            data: {
              orderNumber: order.orderNumber!,
              customerId: dbCustomer!.id,
              orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
              subtotal: subtotalCalc,
              taxableAmount: subtotalCalc,
              taxAmount: Number(order.taxAmount || 0),
              freightAmount: Number(order.freightAmount || 0),
              discountAmount: Number(order.discountAmount || 0),
              totalAmount: legacyTotal || computedTotal,
              
              orderStatus: statuses.orderStatus,
              creditStatus: CreditStatus.PASSED,
              allocationStatus: AllocationStatus.FULLY_ALLOCATED,
              productionStatus: statuses.productionStatus,
              qcStatus: 'NOT_REQUIRED',
              dispatchStatus: statuses.dispatchStatus,
              paymentStatus: statuses.paymentStatus,
              invoiceStatus: 'PENDING',
              closureStatus: statuses.closureStatus,
              
              createdById: migrationUser!.id,

              items: {
                create: resolvedItems.map(item => ({
                  ...item,
                  taxableAmount: item.lineTotal,
                }))
              }
            }
          });

          await tx.legacyMigrationReference.create({
            data: {
              sourceSystem: 'legacy-zustand-sales',
              entityType: 'SalesOrder',
              legacyId: order.legacyId,
              newEntityId: createdOrder.id
            }
          });

          await tx.auditLog.create({
            data: {
              action: 'MIGRATED',
              entityType: 'SalesOrder',
              entityId: createdOrder.id,
              actorUserId: migrationUser!.id,
            }
          });

          report.createdOrders++;
          report.timelineEventsCreated++;
        });
      } catch (err: any) {
        report.rejectedOrders++;
        rejectedRecords.push({ reason: 'Transaction Failed', errors: [err.message], raw: rawOrder });
      }
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  if (rejectedRecords.length > 0) {
    fs.writeFileSync(REJECTED_PATH, JSON.stringify(rejectedRecords, null, 2));
  }

  console.log('Migration Completed.');
  console.log(report);
}

main().catch(console.error);
