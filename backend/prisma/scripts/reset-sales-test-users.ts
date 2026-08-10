import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TARGET_EMAILS = [
  'supersales1@himalayaerp.com',
  'supersales2@himalayaerp.com',
  'sales1@himalayaerp.com',
  'sales2@himalayaerp.com',
  'sales3@himalayaerp.com',
  'sales4@himalayaerp.com',
  'sales5@himalayaerp.com',
  'sales6@himalayaerp.com',
  'sales7@himalayaerp.com',
] as const;

const EXPECTED_PASSWORDS: Record<string, string> = {
  'supersales1@himalayaerp.com': 'HimalayaSuperSales#1',
  'supersales2@himalayaerp.com': 'HimalayaSuperSales#2',
  'sales1@himalayaerp.com': 'HimalayaSales#1',
  'sales2@himalayaerp.com': 'HimalayaSales#2',
  'sales3@himalayaerp.com': 'HimalayaSales#3',
  'sales4@himalayaerp.com': 'HimalayaSales#4',
  'sales5@himalayaerp.com': 'HimalayaSales#5',
  'sales6@himalayaerp.com': 'HimalayaSales#6',
  'sales7@himalayaerp.com': 'HimalayaSales#7',
};

async function main() {
  console.log('======================================================================');
  console.log(' Master Database Reset Script — Fresh Sales & SuperSales Accounts');
  console.log('======================================================================\n');

  // Guard 1: Environmental execution flag
  if (process.env.RESET_SALES_TEST_USERS !== 'true') {
    console.error('❌ Error: RESET_SALES_TEST_USERS=true is required to run this script.');
    console.error('Example execution: RESET_SALES_TEST_USERS=true RESET_DRY_RUN=true npx ts-node prisma/scripts/reset-sales-test-users.ts');
    process.exit(1);
  }

  const isDryRun = process.env.RESET_DRY_RUN !== 'false';
  const allowProtectedDelete = process.env.RESET_PROTECTED_SALES_ORDERS === 'true';

  console.log(`MODE: ${isDryRun ? '🔍 DRY RUN (No records will be deleted)' : '⚡ LIVE EXECUTION (Destructive)'}`);
  console.log(`PROTECTED SALES ORDER OVERRIDE: ${allowProtectedDelete ? 'YES' : 'NO (Protected records skipped)'}\n`);

  // Step 1: Target Account Assertion (Must equal exactly 9)
  const targetUsers = await prisma.user.findMany({
    where: { email: { in: Array.from(TARGET_EMAILS) } },
    include: { role: true },
  });

  console.log(`--- 1. TARGET ACCOUNT ASSERTION ---`);
  console.log(`Target Emails Expected: ${TARGET_EMAILS.length}`);
  console.log(`Target Users Found:    ${targetUsers.length}`);

  if (targetUsers.length !== 9) {
    console.error(`❌ Assertion Failed: Expected exactly 9 users, found ${targetUsers.length}. Aborting execution.`);
    process.exit(1);
  }

  const targetUserIds = targetUsers.map(u => u.id);

  // Check passwords via bcrypt.compare
  console.log('\n--- 2. CREDENTIAL INTEGRITY VERIFICATION ---');
  for (const user of targetUsers) {
    const expectedPass = EXPECTED_PASSWORDS[user.email];
    let isMatch = false;
    if (expectedPass && user.password) {
      isMatch = await bcrypt.compare(expectedPass, user.password);
    }
    console.log(`  User ${user.email} (${user.role?.name || user.roleId}): Password Hash Valid? ${isMatch ? '✅ MATCH' : '⚠️ MISMATCH'}`);
  }

  // Step 2: Baseline Snapshot (Master Data & Non-Target Data)
  console.log('\n--- 3. BASELINE MASTER & NON-TARGET SNAPSHOT ---');
  const baselineMaster = {
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    companies: await prisma.company.count(),
    roles: await prisma.role.count(),
    warehouses: await prisma.warehouse.count(),
    finishedGoods: await prisma.finishedGoods.count(),
    rawMaterials: await prisma.rawMaterial.count(),
  };

  const baselineNonTarget = {
    leads: await prisma.lead.count({ where: { createdById: { notIn: targetUserIds } } }),
    quotations: await prisma.quotation.count({ where: { createdById: { notIn: targetUserIds } } }),
    samples: await prisma.sampleRequest.count({ where: { createdById: { notIn: targetUserIds } } }),
    salesOrders: await prisma.salesOrder.count({ where: { createdById: { notIn: targetUserIds } } }),
  };

  console.log('Shared Master Data Baseline:', baselineMaster);
  console.log('Non-Target Operational Data Baseline:', baselineNonTarget);

  // Step 3: Pre-Reset Counts per Target Account
  console.log('\n--- 4. PRE-RESET OPERATIONAL COUNTS PER TARGET ACCOUNT ---');
  const preCounts: Record<string, Record<string, number>> = {};

  for (const email of TARGET_EMAILS) {
    const user = targetUsers.find(u => u.email === email);
    if (!user) continue;

    const uId = user.id;
    preCounts[email] = {
      leads: await prisma.lead.count({ where: { OR: [{ createdById: uId }, { assignedToId: uId }] } }),
      quotations: await prisma.quotation.count({ where: { createdById: uId } }),
      samples: await prisma.sampleRequest.count({ where: { createdById: uId } }),
      salesOrders: await prisma.salesOrder.count({ where: { createdById: uId } }),
      complaints: await prisma.customerComplaint.count({ where: { OR: [{ createdBy: uId }, { submittedBy: uId }] } }),
      returns: await prisma.salesReturn.count({ where: { requestedById: uId } }),
      replacements: await prisma.replacementRequest.count({ where: { requestedById: uId } }),
    };

    console.log(
      `  ${email.padEnd(28)} | Leads: ${preCounts[email].leads} | Quotes: ${preCounts[email].quotations} | Samples: ${preCounts[email].samples} | Orders: ${preCounts[email].salesOrders} | Complaints: ${preCounts[email].complaints} | Returns: ${preCounts[email].returns} | Replacements: ${preCounts[email].replacements}`
    );
  }

  // Step 4: Downstream Dependency Discovery & Protected Record Gate
  console.log('\n--- 5. PROTECTED RECORD GATE ANALYSIS ---');
  const targetOrders = await prisma.salesOrder.findMany({
    where: { createdById: { in: targetUserIds } },
    include: {
      productionPlans: true,
      dispatches: true,
      invoices: true,
      returns: true,
      replacementRequests: true,
      FinishedGoods: true,
    },
  });

  const protectedOrderIds: string[] = [];
  const safeOrderIds: string[] = [];

  for (const order of targetOrders) {
    const reasons: string[] = [];
    if (order.productionPlans.length > 0) reasons.push(`Production Plans (${order.productionPlans.length})`);
    if (order.dispatches.length > 0) reasons.push(`Dispatches (${order.dispatches.length})`);
    if (order.invoices.length > 0) reasons.push(`Invoices (${order.invoices.length})`);
    if (order.returns.length > 0) reasons.push(`Returns (${order.returns.length})`);
    if (order.replacementRequests.length > 0) reasons.push(`Replacements (${order.replacementRequests.length})`);
    if (order.FinishedGoods.length > 0) reasons.push(`Finished Goods (${order.FinishedGoods.length})`);

    if (reasons.length > 0) {
      protectedOrderIds.push(order.id);
      console.log(`  🛡️ PROTECTED RECORD: ${order.orderNumber} (ID: ${order.id}) | CreatedBy: ${order.createdById} | Status: ${order.status}`);
      console.log(`     Downstream Reasons: ${reasons.join(', ')}`);
    } else {
      safeOrderIds.push(order.id);
    }
  }

  console.log(`\nTotal Target Sales Orders: ${targetOrders.length}`);
  console.log(`Safe Disposable Orders:   ${safeOrderIds.length}`);
  console.log(`Protected Orders:         ${protectedOrderIds.length}`);

  if (isDryRun) {
    console.log('\n======================================================================');
    console.log(' DRY RUN SUMMARY REPORT — NO DATABASE MUTATIONS WERE EXECUTED');
    console.log('======================================================================');
    console.log('To execute actual database deletion, run with: RESET_DRY_RUN=false');
    await prisma.$disconnect();
    return;
  }

  // Step 5: Transactional Deletion
  console.log('\n--- 6. EXECUTE TRANSACTIONAL DELETION ---');

  const ordersToDelete = allowProtectedDelete ? targetOrders.map(o => o.id) : safeOrderIds;

  await prisma.$transaction(async tx => {
    // 1. Followups & Lead Activities
    const targetLeads = await tx.lead.findMany({
      where: { OR: [{ createdById: { in: targetUserIds } }, { assignedToId: { in: targetUserIds } }] },
      select: { id: true },
    });
    const targetLeadIds = targetLeads.map(l => l.id);

    if (targetLeadIds.length > 0) {
      const deletedFollowups = await tx.followUp.deleteMany({ where: { leadId: { in: targetLeadIds } } });
      const deletedActivities = await tx.leadActivity.deleteMany({ where: { leadId: { in: targetLeadIds } } });
      const deletedLeads = await tx.lead.deleteMany({ where: { id: { in: targetLeadIds } } });
      console.log(`  ✓ Deleted Leads: ${deletedLeads.count} (FollowUps: ${deletedFollowups.count}, Activities: ${deletedActivities.count})`);
    }

    // 2. Quotations
    const targetQuotations = await tx.quotation.findMany({
      where: { createdById: { in: targetUserIds } },
      select: { id: true },
    });
    const targetQuoteIds = targetQuotations.map(q => q.id);

    if (targetQuoteIds.length > 0) {
      const deletedQuoteItems = await tx.quotationItem.deleteMany({ where: { quotationId: { in: targetQuoteIds } } });
      const deletedQuotes = await tx.quotation.deleteMany({ where: { id: { in: targetQuoteIds } } });
      console.log(`  ✓ Deleted Quotations: ${deletedQuotes.count} (Items: ${deletedQuoteItems.count})`);
    }

    // 3. Samples
    const targetSamples = await tx.sampleRequest.findMany({
      where: { createdById: { in: targetUserIds } },
      select: { id: true },
    });
    const targetSampleIds = targetSamples.map(s => s.id);

    if (targetSampleIds.length > 0) {
      const deletedSampleItems = await tx.sampleItem.deleteMany({ where: { sampleRequestId: { in: targetSampleIds } } });
      const deletedSampleHistories = await tx.sampleHistory.deleteMany({ where: { sampleRequestId: { in: targetSampleIds } } });
      const deletedSamples = await tx.sampleRequest.deleteMany({ where: { id: { in: targetSampleIds } } });
      console.log(`  ✓ Deleted Samples: ${deletedSamples.count} (Items: ${deletedSampleItems.count}, Histories: ${deletedSampleHistories.count})`);
    }

    // 4. Sales Orders (Filtered by safety gate)
    if (ordersToDelete.length > 0) {
      await tx.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: ordersToDelete } } });
      await tx.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: ordersToDelete } } });
      await tx.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: ordersToDelete } } });
      await tx.salesOrderItem.deleteMany({ where: { salesOrderId: { in: ordersToDelete } } });
      const deletedOrders = await tx.salesOrder.deleteMany({ where: { id: { in: ordersToDelete } } });
      console.log(`  ✓ Deleted Sales Orders: ${deletedOrders.count}`);
    }

    // 5. Complaints
    const deletedComplaints = await tx.customerComplaint.deleteMany({
      where: { OR: [{ createdBy: { in: targetUserIds } }, { submittedBy: { in: targetUserIds } }] },
    });
    console.log(`  ✓ Deleted Customer Complaints: ${deletedComplaints.count}`);

    // 6. Returns & Replacements
    const targetReturns = await tx.salesReturn.findMany({ where: { requestedById: { in: targetUserIds } }, select: { id: true } });
    const targetReturnIds = targetReturns.map(r => r.id);

    if (targetReturnIds.length > 0) {
      await tx.salesReturnItem.deleteMany({ where: { salesReturnId: { in: targetReturnIds } } });
      await tx.salesReturn.deleteMany({ where: { id: { in: targetReturnIds } } });
    }

    const targetReplacements = await tx.replacementRequest.findMany({ where: { requestedById: { in: targetUserIds } }, select: { id: true } });
    const targetReplIds = targetReplacements.map(r => r.id);

    if (targetReplIds.length > 0) {
      await tx.replacementRequestItem.deleteMany({ where: { replacementRequestId: { in: targetReplIds } } });
      await tx.replacementRequest.deleteMany({ where: { id: { in: targetReplIds } } });
    }
  });

  // Step 6: Post-Reset Verification Assertions
  console.log('\n--- 7. POST-RESET VERIFICATION COUNTS PER TARGET ACCOUNT ---');
  let allZero = true;

  for (const email of TARGET_EMAILS) {
    const user = targetUsers.find(u => u.email === email);
    if (!user) continue;
    const uId = user.id;

    const post = {
      leads: await prisma.lead.count({ where: { OR: [{ createdById: uId }, { assignedToId: uId }] } }),
      quotations: await prisma.quotation.count({ where: { createdById: uId } }),
      samples: await prisma.sampleRequest.count({ where: { createdById: uId } }),
      salesOrders: await prisma.salesOrder.count({ where: { createdById: uId } }),
      complaints: await prisma.customerComplaint.count({ where: { OR: [{ createdBy: uId }, { submittedBy: uId }] } }),
      returns: await prisma.salesReturn.count({ where: { requestedById: uId } }),
      replacements: await prisma.replacementRequest.count({ where: { requestedById: uId } }),
    };

    console.log(
      `  ${email.padEnd(28)} | Leads: ${post.leads} | Quotes: ${post.quotations} | Samples: ${post.samples} | Orders: ${post.salesOrders} | Complaints: ${post.complaints} | Returns: ${post.returns} | Replacements: ${post.replacements}`
    );

    if (post.leads !== 0 || post.quotations !== 0 || post.samples !== 0 || post.salesOrders !== 0 || post.complaints !== 0 || post.returns !== 0 || post.replacements !== 0) {
      allZero = false;
    }
  }

  // Master Data & Non-Target Delta Assertions
  const postMaster = {
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    companies: await prisma.company.count(),
    roles: await prisma.role.count(),
    warehouses: await prisma.warehouse.count(),
    finishedGoods: await prisma.finishedGoods.count(),
    rawMaterials: await prisma.rawMaterial.count(),
  };

  const postNonTarget = {
    leads: await prisma.lead.count({ where: { createdById: { notIn: targetUserIds } } }),
    quotations: await prisma.quotation.count({ where: { createdById: { notIn: targetUserIds } } }),
    samples: await prisma.sampleRequest.count({ where: { createdById: { notIn: targetUserIds } } }),
    salesOrders: await prisma.salesOrder.count({ where: { createdById: { notIn: targetUserIds } } }),
  };

  console.log('\n--- 8. DELTA ASSERTIONS ---');
  console.log('Master Data Delta (Expected 0):', {
    products: postMaster.products - baselineMaster.products,
    customers: postMaster.customers - baselineMaster.customers,
    companies: postMaster.companies - baselineMaster.companies,
    roles: postMaster.roles - baselineMaster.roles,
    warehouses: postMaster.warehouses - baselineMaster.warehouses,
    finishedGoods: postMaster.finishedGoods - baselineMaster.finishedGoods,
    rawMaterials: postMaster.rawMaterials - baselineMaster.rawMaterials,
  });

  console.log('Non-Target Data Delta (Expected 0):', {
    leads: postNonTarget.leads - baselineNonTarget.leads,
    quotations: postNonTarget.quotations - baselineNonTarget.quotations,
    samples: postNonTarget.samples - baselineNonTarget.samples,
    salesOrders: postNonTarget.salesOrders - baselineNonTarget.salesOrders,
  });

  if (allZero) {
    console.log('\n✅ SUCCESS: All 9 target accounts successfully reset to ZERO operational records.');
  } else {
    console.warn('\n⚠️ WARNING: Operational records remain for some accounts.');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Reset Script Exception:', err);
  prisma.$disconnect();
  process.exit(1);
});
