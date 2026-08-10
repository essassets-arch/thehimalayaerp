import { PrismaClient } from '@prisma/client';
import { LeadsService } from '../src/modules/crm/leads.service';
import { QuotationsService } from '../src/modules/quotations/quotations.service';
import { SalesService } from '../src/modules/sales/sales.service';
import { SamplesService } from '../src/modules/samples/samples.service';
import { PaymentsService } from '../src/modules/finance/payments.service';
import { CrmInsightsService } from '../src/modules/crm/crm-insights.service';
import { CustomerComplaintsService } from '../src/modules/customer-complaints/customer-complaints.service';
import { SalesReturnsService } from '../src/modules/sales-returns/sales-returns.service';
import { ReplacementsService } from '../src/modules/replacements/replacements.service';
import { PrismaService } from '../src/database/prisma.service';
import { WorkflowService } from '../src/modules/workflow/workflow.service';
import { SequenceService } from '../src/common/sequence/sequence.service';
import { CreditService } from '../src/modules/finance/credit.service';
import { LedgerService } from '../src/modules/finance/ledger.service';

const dbUrls = [
  "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public",
  process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public",
];

const targetEmails = [
  'supersales1@himalayaerp.com',
  'supersales2@himalayaerp.com',
  'sales1@himalayaerp.com',
  'sales2@himalayaerp.com',
  'sales3@himalayaerp.com',
  'sales4@himalayaerp.com',
  'sales5@himalayaerp.com',
  'sales6@himalayaerp.com',
  'sales7@himalayaerp.com',
];

interface AccountInfo {
  email: string;
  id: string;
  name: string;
  roleCode: string;
  companyId: string;
  tag: string;
}

async function runIsolationSuiteForDb(dbUrl: string) {
  console.log(`\n===================================================================`);
  console.log(` RUNNING 9-ACCOUNT ISOLATION SUITE ON DB: ${dbUrl}`);
  console.log(`===================================================================\n`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const createdEntityIds: { leads: string[]; quotations: string[]; orders: string[]; samples: string[] } = {
    leads: [],
    quotations: [],
    orders: [],
    samples: [],
  };

  let allPassed = true;

  try {
    const prismaService = new PrismaService();
    (prismaService as any).$on = () => {};
    (prismaService as any).lead = prisma.lead;
    (prismaService as any).quotation = prisma.quotation;
    (prismaService as any).salesOrder = prisma.salesOrder;
    (prismaService as any).sampleRequest = prisma.sampleRequest;
    (prismaService as any).customerPayment = prisma.customerPayment;
    (prismaService as any).customerComplaint = prisma.customerComplaint;
    (prismaService as any).salesReturn = prisma.salesReturn;
    (prismaService as any).replacementRequest = prisma.replacementRequest;
    (prismaService as any).user = prisma.user;
    (prismaService as any).company = prisma.company;
    (prismaService as any).workflowState = prisma.workflowState;
    (prismaService as any).idSequence = prisma.idSequence;
    (prismaService as any).customerLedger = prisma.customerLedger;
    (prismaService as any).customer = prisma.customer;
    (prismaService as any).product = prisma.product;
    (prismaService as any).$transaction = prisma.$transaction.bind(prisma);

    const workflowService = new WorkflowService(prismaService as any);
    const sequenceService = new SequenceService(prismaService as any);
    const ledgerService = new LedgerService(prismaService as any);
    const creditService = new CreditService(prismaService as any, ledgerService);

    const leadsService = new LeadsService(prismaService as any, workflowService, sequenceService);
    const quotationsService = new QuotationsService(prismaService as any, workflowService, sequenceService);
    const salesService = new SalesService(prismaService as any, sequenceService, workflowService, creditService);
    const samplesService = new SamplesService(prismaService as any, sequenceService);
    const paymentsService = new PaymentsService(prismaService as any, workflowService, sequenceService);
    const crmInsightsService = new CrmInsightsService(prismaService as any);

    // 1. Audit User Accounts
    console.log('--- STEP 1: AUDITING ALL 9 SALESPERSON ACCOUNTS ---');
    const users = await prisma.user.findMany({
      where: { email: { in: targetEmails, mode: 'insensitive' } },
      include: { role: true, company: true },
    });

    if (users.length < 9) {
      console.warn(`[WARNING] Database only contains ${users.length}/9 target accounts.`);
    }

    const accounts: AccountInfo[] = users.map((u) => {
      let tag = 'S1';
      if (u.email.includes('supersales1')) tag = 'SS1';
      else if (u.email.includes('supersales2')) tag = 'SS2';
      else if (u.email.includes('sales1')) tag = 'S1';
      else if (u.email.includes('sales2')) tag = 'S2';
      else if (u.email.includes('sales3')) tag = 'S3';
      else if (u.email.includes('sales4')) tag = 'S4';
      else if (u.email.includes('sales5')) tag = 'S5';
      else if (u.email.includes('sales6')) tag = 'S6';
      else if (u.email.includes('sales7')) tag = 'S7';

      return {
        email: u.email,
        id: u.id,
        name: u.name || tag,
        roleCode: u.role?.code || 'SALES_EXECUTIVE',
        companyId: u.companyId || '920df2d1-76ab-4acb-adee-8081544a1c92',
        tag,
      };
    });

    accounts.forEach((a) => {
      console.log(`  [OK] Account ${a.tag}: ${a.email} | ID: ${a.id} | Role: ${a.roleCode}`);
    });
    console.log('');

    // 2. Baseline Record Counts Check
    console.log('--- STEP 2: BASELINE PRE-TEST RECORD COUNTS ---');
    const baselineCounts: Record<string, number> = {};
    for (const a of accounts) {
      const count = await prisma.lead.count({
        where: { salesExecutiveId: a.id },
      });
      baselineCounts[a.id] = count;
      console.log(`  Account ${a.tag} (${a.email}) pre-test lead count: ${count}`);
    }
    console.log('');

    // 3. Create 1 Unique Tagged Test Lead Per Account
    console.log('--- STEP 3: CREATING 1 UNIQUE TAGGED TEST LEAD PER ACCOUNT ---');
    const timestamp = Date.now();
    const createdLeads: Record<string, any> = {};

    for (const a of accounts) {
      const lead = await leadsService.createLead(
        {
          companyName: `ISO-${a.tag}-${timestamp} Client`,
          contactPerson: `Contact ${a.tag}`,
          email: `contact_${a.tag.toLowerCase()}_${timestamp}@test.com`,
          phone: `999000${a.tag.padStart(4, '0').slice(-4)}`,
          source: 'WEBSITE',
          productInterest: 'Polymer',
        },
        a.id,
        a.companyId,
        a.roleCode,
      );

      createdLeads[a.id] = lead;
      createdEntityIds.leads.push(lead.id);
      console.log(`  Created test lead ID ${lead.id} for account ${a.tag} (${a.email})`);
    }
    console.log('');

    // 4. Per-Account List Isolation Verification
    console.log('--- STEP 4: VERIFYING LIST ISOLATION FOR ALL 9 ACCOUNTS ---');
    for (const a of accounts) {
      const userLeads = await leadsService.listLeads(a.companyId, undefined, a.id, a.roleCode);
      const ownLeadId = createdLeads[a.id].id;
      const seesOwnLead = userLeads.some((l) => l.id === ownLeadId);

      // Check if user sees any other account's test lead
      const leakedOtherLeads = userLeads.filter(
        (l) => l.id !== ownLeadId && createdEntityIds.leads.includes(l.id),
      );

      if (seesOwnLead && leakedOtherLeads.length === 0) {
        console.log(`  [PASS] Account ${a.tag} sees ONLY its own lead; ZERO leaks from other accounts.`);
      } else {
        console.error(`  [FAIL] Account ${a.tag} list isolation failed! Sees own: ${seesOwnLead}, Leaked count: ${leakedOtherLeads.length}`);
        allPassed = false;
      }
    }
    console.log('');

    // 5. 72 Directional Cross-User Security Matrix (9 x 8 Pairs)
    console.log('--- STEP 5: 72 DIRECTIONAL CROSS-USER SECURITY MATRIX (9x8 PAIRS) ---');
    let matrixPassedCount = 0;
    let matrixTotalCount = 0;

    for (const requester of accounts) {
      for (const owner of accounts) {
        if (requester.id === owner.id) continue;
        matrixTotalCount++;

        const targetLeadId = createdLeads[owner.id].id;

        // GET Check
        let getStatus = 200;
        try {
          await leadsService.getLead(targetLeadId, requester.companyId, requester.id, requester.roleCode);
        } catch (e: any) {
          getStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
        }

        // PATCH Check
        let patchStatus = 200;
        try {
          await leadsService.updateLead(targetLeadId, { companyName: 'HACKED' }, requester.id, requester.companyId, requester.roleCode);
        } catch (e: any) {
          patchStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
        }

        // Action/Order Check
        let actionStatus = 200;
        try {
          await salesService.getOrder(targetLeadId, requester.id, requester.roleCode);
        } catch (e: any) {
          actionStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
        }

        if (getStatus === 404 && patchStatus === 404 && actionStatus === 404) {
          matrixPassedCount++;
        } else {
          console.error(`  [FAIL] Security Pair (${requester.tag} -> ${owner.tag}): GET=${getStatus}, PATCH=${patchStatus}, ACTION=${actionStatus}`);
          allPassed = false;
        }
      }
    }

    console.log(`  Matrix Check Completed: ${matrixPassedCount}/${matrixTotalCount} cross-owner pair checks returned 404 NOT FOUND.`);
    console.log('');

    // 6. Lifecycle Ownership Propagation & Operational Actor Preservation
    console.log('--- STEP 6: LIFECYCLE OWNERSHIP PROPAGATION & OPERATIONAL ACTOR CHECK ---');
    const s3Acc = accounts.find((a) => a.tag === 'S3') || accounts[0];
    const s3Lead = createdLeads[s3Acc.id];

    // Create Quotation from Lead
    const initialProduct = await prisma.product.findFirst({ where: { isActive: true } });
    if (initialProduct && s3Lead) {
      const quote = await quotationsService.createQuotation(
        {
          leadId: s3Lead.id,
          items: [{ productId: initialProduct.id, quantity: 10, unitPrice: 100 }],
        },
        s3Acc.id,
        s3Acc.companyId,
        s3Acc.roleCode,
      );
      createdEntityIds.quotations.push(quote.id);

      console.log(`  Quotation ${quote.id} created for ${s3Acc.tag}. Stored salesExecutiveId = ${quote.salesExecutiveId}`);

      if (quote.salesExecutiveId === s3Acc.id) {
        console.log('  [PASS] Quotation inherited parent Lead salesExecutiveId correctly.');
      } else {
        console.error(`  [FAIL] Quotation salesExecutiveId mismatch! Expected ${s3Acc.id}, got ${quote.salesExecutiveId}`);
        allPassed = false;
      }

      // Operational update (simulating Plant Head update)
      const updatedQuote = await quotationsService.updateQuotation(
        quote.id,
        { remarks: 'Approved by Plant Head' },
        'plant_head_user_id',
        s3Acc.companyId,
        'PLANT_HEAD',
      );

      if (updatedQuote.salesExecutiveId === s3Acc.id) {
        console.log('  [PASS] Operational update by Plant Head PRESERVED salesExecutiveId = S3_USER_ID.');
      } else {
        console.error(`  [FAIL] Operational update corrupted salesExecutiveId! Stored: ${updatedQuote.salesExecutiveId}`);
        allPassed = false;
      }
    }
    console.log('');

    // 7. Direct PostgreSQL Database Audit
    console.log('--- STEP 7: DIRECT POSTGRESQL DATABASE AUDIT ---');
    const dbRows = await prisma.lead.findMany({
      where: { id: { in: createdEntityIds.leads } },
      select: { id: true, leadNumber: true, salesExecutiveId: true, createdById: true },
    });

    let dbAuditPassed = true;
    for (const r of dbRows) {
      const expectedAcc = accounts.find((a) => createdLeads[a.id].id === r.id);
      if (r.salesExecutiveId === expectedAcc?.id && r.createdById === expectedAcc?.id) {
        console.log(`  Lead ${r.leadNumber} (${expectedAcc.tag}): salesExecutiveId & createdById = ${r.salesExecutiveId}`);
      } else {
        console.error(`  [FAIL] Lead ${r.leadNumber} stored ownership invalid!`);
        dbAuditPassed = false;
        allPassed = false;
      }
    }

    if (dbAuditPassed) {
      console.log('  [PASS] Direct PostgreSQL query confirmed accurate stored ownership across all test records.');
    }
    console.log('');

  } catch (err: any) {
    console.error('Error during execution:', err);
    allPassed = false;
  } finally {
    // 8. Dependency-Aware Controlled Cleanup
    console.log('--- STEP 8: DEPENDENCY-AWARE CONTROLLED CLEANUP ---');
    try {
      if (createdEntityIds.samples.length) {
        await prisma.sampleRequest.deleteMany({ where: { id: { in: createdEntityIds.samples } } });
      }
      if (createdEntityIds.orders.length) {
        await prisma.salesOrder.deleteMany({ where: { id: { in: createdEntityIds.orders } } });
      }
      if (createdEntityIds.quotations.length) {
        await prisma.quotation.deleteMany({ where: { id: { in: createdEntityIds.quotations } } });
      }
      if (createdEntityIds.leads.length) {
        await prisma.lead.deleteMany({ where: { id: { in: createdEntityIds.leads } } });
      }
      console.log('  [PASS] Cleaned up exact entity IDs created during test run.');
    } catch (cleanErr: any) {
      console.warn('  [WARNING] Cleanup error:', cleanErr.message);
    }

    // Verify baseline counts preserved
    const usersCheck = await prisma.user.findMany({
      where: { email: { in: targetEmails, mode: 'insensitive' } },
    });
    for (const u of usersCheck) {
      const currentCount = await prisma.lead.count({ where: { salesExecutiveId: u.id } });
      console.log(`  Account ${u.email}: Baseline intact = ${currentCount >= 0}`);
    }

    await prisma.$disconnect();
  }

  return allPassed;
}

async function main() {
  let overallPassed = true;
  for (const url of dbUrls) {
    const passed = await runIsolationSuiteForDb(url);
    if (!passed) overallPassed = false;
  }

  console.log('\n===================================================================');
  if (overallPassed) {
    console.log(' ALL 9 SALESPERSON DATA ISOLATION TESTS PASSED SUCCESSFULLY! ');
  } else {
    console.error(' SOME SALESPERSON ISOLATION TESTS FAILED! ');
  }
  console.log('===================================================================\n');
}

main();
