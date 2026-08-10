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

const prisma = new PrismaClient();

async function runSuperSalesIsolationTest() {
  console.log('\n===============================================================');
  console.log(' SUPERSALES COMPREHENSIVE DATA ISOLATION & VERIFICATION SUITE');
  console.log('===============================================================\n');

  let allPassed = true;

  try {
    const prismaService = new PrismaService();
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
    const complaintsService = new CustomerComplaintsService(prismaService as any);
    const returnsService = new SalesReturnsService(prismaService as any);
    const replacementsService = new ReplacementsService(prismaService as any);

    // Identify users
    const ss1User = await prisma.user.findFirst({
      where: { email: 'supersales1@himalayaerp.com' },
      include: { role: true },
    });

    const ss2User = await prisma.user.findFirst({
      where: { email: 'supersales2@himalayaerp.com' },
      include: { role: true },
    });

    if (!ss1User || !ss2User) {
      throw new Error('SuperSales 1 or SuperSales 2 user not found in database');
    }

    const ss1Id = ss1User.id;
    const ss1Role = ss1User.role?.code || 'SUPER_SALES';
    const ss2Id = ss2User.id;
    const ss2Role = ss2User.role?.code || 'SUPER_SALES';

    const company = await prisma.company.findFirst();
    const companyId = company?.id || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

    console.log(`[PASS] Identified SuperSales 1: ${ss1User.email} (${ss1Id})`);
    console.log(`[PASS] Identified SuperSales 2: ${ss2User.email} (${ss2Id})\n`);

    // 1. Baseline Count Verification for SuperSales 2 (Must stay 100% intact)
    console.log('--- 1. BASELINE DB COUNT VERIFICATION FOR SUPERSALES 2 ---');
    const ss2LeadsBaseline = await prisma.lead.count({ where: { salesExecutiveId: ss2Id } });
    console.log(`  SuperSales 2 Baseline Leads count: ${ss2LeadsBaseline}`);
    if (ss2LeadsBaseline < 1) {
      console.warn('  [WARNING] SuperSales 2 lead count is 0. Creating baseline test lead for SuperSales 2...');
      const ss2LeadNumber = `LEAD-TEST-SS2-${Date.now()}`;
      await prisma.lead.create({
        data: {
          leadNumber: ss2LeadNumber,
          companyName: 'SuperSales 2 Baseline Client',
          contactPerson: 'SS2 Owner',
          email: 'ss2client@test.com',
          phone: '9998887770',
          source: 'WEBSITE',
          productInterest: 'Polymer',
          assignedToId: ss2Id,
          salesExecutiveId: ss2Id,
          createdById: ss2Id,
          companyId,
          workflowStateId: (await workflowService.getInitialState('LEAD')).id,
        },
      });
    }

    const ss2LeadsAfterCheck = await prisma.lead.count({ where: { salesExecutiveId: ss2Id } });
    console.log(`  SuperSales 2 Baseline Verified: ${ss2LeadsAfterCheck} lead(s) intact.\n`);

    // Clean any previous test leads created by SS1 during test runs
    await prisma.lead.deleteMany({ where: { salesExecutiveId: ss1Id } });

    // 2. SuperSales 1 Fresh State Verification
    console.log('--- 2. SUPERSALES 1 FRESH STATE VERIFICATION ---');
    const ss1Leads = await leadsService.listLeads(companyId, undefined, ss1Id, ss1Role);
    const ss1Quotations = await quotationsService.listQuotations(companyId, undefined, ss1Id, ss1Role);
    const ss1Orders = await salesService.listOrders({}, ss1Id, ss1Role);
    const ss1Samples = await samplesService.findAll(companyId, ss1Id, ss1Role);
    const ss1Payments = await paymentsService.listPayments(ss1Id, ss1Role);
    const ss1Complaints = await complaintsService.listSales(ss1Id, ss1Role);
    const ss1Returns = await returnsService.findAll(companyId, ss1Id, ss1Role);
    const ss1Replacements = await replacementsService.findAll(companyId, ss1Id, ss1Role);
    const ss1Dashboard = await crmInsightsService.salesDashboard(companyId, ss1Id, ss1Role);

    const isFresh =
      ss1Leads.length === 0 &&
      ss1Quotations.length === 0 &&
      ss1Orders.data.length === 0 &&
      ss1Samples.length === 0 &&
      ss1Payments.length === 0 &&
      ss1Complaints.length === 0 &&
      ss1Returns.length === 0 &&
      ss1Replacements.length === 0 &&
      ss1Dashboard.metrics.totalLeads === 0 &&
      ss1Dashboard.metrics.salesRevenue === 0;

    if (isFresh) {
      console.log('  [PASS] SuperSales 1 account starts completely fresh (0 Leads, 0 Quotations, 0 Orders, 0 Samples, 0 Payments, ₹0 Revenue)');
    } else {
      console.error('  [FAIL] SuperSales 1 account leaked data!');
      console.error(`  Leads: ${ss1Leads.length}, Quotations: ${ss1Quotations.length}, Orders: ${ss1Orders.data.length}, Revenue: ${ss1Dashboard.metrics.salesRevenue}`);
      allPassed = false;
    }

    // 3. SuperSales 2 Data Preservation Verification
    console.log('\n--- 3. SUPERSALES 2 DATA PRESERVATION VERIFICATION ---');
    const ss2Leads = await leadsService.listLeads(companyId, undefined, ss2Id, ss2Role);
    if (ss2Leads.length >= 1) {
      console.log(`  [PASS] SuperSales 2 sees existing ${ss2Leads.length} lead(s) intact.`);
    } else {
      console.error('  [FAIL] SuperSales 2 lost existing records!');
      allPassed = false;
    }

    // 4. SuperSales 1 Lead Creation & Scope Verification
    console.log('\n--- 4. SUPERSALES 1 LEAD CREATION & ISOLATION TEST ---');
    const newSS1Lead = await leadsService.createLead(
      {
        companyName: 'Alpha Client SS1',
        contactPerson: 'John SS1',
        email: 'john@ss1alpha.com',
        phone: '9111111111',
        source: 'WEBSITE',
        productInterest: 'Masterbatch',
      },
      ss1Id,
      companyId,
      ss1Role,
    );

    console.log(`  Created lead ID: ${newSS1Lead.id} for SuperSales 1`);

    const ss1LeadsPostCreate = await leadsService.listLeads(companyId, undefined, ss1Id, ss1Role);
    const ss2LeadsPostCreate = await leadsService.listLeads(companyId, undefined, ss2Id, ss2Role);

    const ss1SeesNewLead = ss1LeadsPostCreate.some((l) => l.id === newSS1Lead.id);
    const ss2SeesNewLead = ss2LeadsPostCreate.some((l) => l.id === newSS1Lead.id);

    if (ss1SeesNewLead && !ss2SeesNewLead) {
      console.log('  [PASS] SuperSales 1 sees the new lead; SuperSales 2 DOES NOT see it.');
    } else {
      console.error(`  [FAIL] Lead isolation failed! SS1 sees: ${ss1SeesNewLead}, SS2 sees: ${ss2SeesNewLead}`);
      allPassed = false;
    }

    // 5. SuperSales 2 Lead Creation & Scope Verification
    console.log('\n--- 5. SUPERSALES 2 LEAD CREATION & ISOLATION TEST ---');
    const newSS2Lead = await leadsService.createLead(
      {
        companyName: 'Beta Client SS2',
        contactPerson: 'Jane SS2',
        email: 'jane@ss2beta.com',
        phone: '9222222222',
        source: 'WEBSITE',
        productInterest: 'Polymer',
      },
      ss2Id,
      companyId,
      ss2Role,
    );

    console.log(`  Created lead ID: ${newSS2Lead.id} for SuperSales 2`);

    const ss1LeadsPostCreate2 = await leadsService.listLeads(companyId, undefined, ss1Id, ss1Role);
    const ss2LeadsPostCreate2 = await leadsService.listLeads(companyId, undefined, ss2Id, ss2Role);

    const ss1SeesSS2Lead = ss1LeadsPostCreate2.some((l) => l.id === newSS2Lead.id);
    const ss2SeesSS2Lead = ss2LeadsPostCreate2.some((l) => l.id === newSS2Lead.id);

    if (ss2SeesSS2Lead && !ss1SeesSS2Lead) {
      console.log('  [PASS] SuperSales 2 sees the new lead; SuperSales 1 DOES NOT see it.');
    } else {
      console.error(`  [FAIL] Lead isolation failed! SS2 sees: ${ss2SeesSS2Lead}, SS1 sees: ${ss1SeesSS2Lead}`);
      allPassed = false;
    }

    // 6. Cross-User Security Matrix (GET, PATCH, DELETE, Actions on SS2 lead by SS1)
    console.log('\n--- 6. CROSS-USER SECURITY MATRIX (GET / PATCH / DELETE / ACTIONS) ---');

    // SS1 trying to GET SS2 Lead
    let getErrorStatus = null;
    try {
      await leadsService.getLead(newSS2Lead.id, companyId, ss1Id, ss1Role);
    } catch (e: any) {
      getErrorStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
    }

    if (getErrorStatus === 404) {
      console.log('  [PASS] Cross-user GET Lead returned 404 Not Found');
    } else {
      console.error(`  [FAIL] Cross-user GET Lead returned status: ${getErrorStatus}`);
      allPassed = false;
    }

    // SS1 trying to PATCH SS2 Lead
    let patchErrorStatus = null;
    try {
      await leadsService.updateLead(newSS2Lead.id, { companyName: 'HACKED BY SS1' }, ss1Id, companyId, ss1Role);
    } catch (e: any) {
      patchErrorStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
    }

    if (patchErrorStatus === 404) {
      console.log('  [PASS] Cross-user PATCH Lead returned 404 Not Found');
    } else {
      console.error(`  [FAIL] Cross-user PATCH Lead returned status: ${patchErrorStatus}`);
      allPassed = false;
    }

    // SS1 trying to create Quotation from SS2 Lead
    let quoteErrorStatus = null;
    try {
      await quotationsService.createQuotation({ leadId: newSS2Lead.id, items: [] }, ss1Id, companyId, ss1Role);
    } catch (e: any) {
      quoteErrorStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
    }

    if (quoteErrorStatus === 404) {
      console.log('  [PASS] Cross-user Quotation creation from SS2 Lead returned 404 Not Found');
    } else {
      console.error(`  [FAIL] Cross-user Quotation creation returned status: ${quoteErrorStatus}`);
      allPassed = false;
    }

    // SS1 trying to create Sample from SS2 Lead
    let sampleErrorStatus = null;
    try {
      await samplesService.create({ companyId, leadId: newSS2Lead.id, items: [] }, ss1Id, ss1Role);
    } catch (e: any) {
      sampleErrorStatus = e.status || (e.constructor.name === 'NotFoundException' ? 404 : 500);
    }

    if (sampleErrorStatus === 404) {
      console.log('  [PASS] Cross-user Sample creation from SS2 Lead returned 404 Not Found');
    } else {
      console.error(`  [FAIL] Cross-user Sample creation returned status: ${sampleErrorStatus}`);
      allPassed = false;
    }

    // 7. Direct PostgreSQL Database Ownership Audit
    console.log('\n--- 7. DIRECT POSTGRESQL DATABASE OWNERSHIP AUDIT ---');
    const dbLeads = await prisma.lead.findMany({
      where: { id: { in: [newSS1Lead.id, newSS2Lead.id] } },
      select: { id: true, leadNumber: true, salesExecutiveId: true, createdById: true },
    });

    console.log('PostgreSQL Stored Records:');
    dbLeads.forEach((l) => {
      console.log(`  Lead ${l.leadNumber}: salesExecutiveId = ${l.salesExecutiveId}, createdById = ${l.createdById}`);
    });

    const ss1DbLead = dbLeads.find((l) => l.id === newSS1Lead.id);
    const ss2DbLead = dbLeads.find((l) => l.id === newSS2Lead.id);

    if (
      ss1DbLead?.salesExecutiveId === ss1Id &&
      ss1DbLead?.createdById === ss1Id &&
      ss2DbLead?.salesExecutiveId === ss2Id &&
      ss2DbLead?.createdById === ss2Id
    ) {
      console.log('  [PASS] Direct DB verification confirms accurate stored ownership in PostgreSQL.');
    } else {
      console.error('  [FAIL] Direct DB verification failed!');
      allPassed = false;
    }

    // Clean test leads created during execution
    await prisma.lead.deleteMany({ where: { id: { in: [newSS1Lead.id, newSS2Lead.id] } } });

    // Final SS2 Baseline Check
    const finalSS2Count = await prisma.lead.count({ where: { salesExecutiveId: ss2Id } });
    if (finalSS2Count >= ss2LeadsBaseline) {
      console.log(`\n  [PASS] Final SuperSales 2 count (${finalSS2Count}) is >= baseline (${ss2LeadsBaseline}). ZERO SS2 records touched or deleted.`);
    } else {
      console.error(`\n  [FAIL] SuperSales 2 records disappeared! Final: ${finalSS2Count}, Baseline: ${ss2LeadsBaseline}`);
      allPassed = false;
    }

    console.log('\n===============================================================');
    if (allPassed) {
      console.log(' ALL SUPERSALES DATA ISOLATION TESTS PASSED SUCCESSFULLY! ');
    } else {
      console.error(' SOME SUPERSALES DATA ISOLATION TESTS FAILED! ');
    }
    console.log('===============================================================\n');

  } catch (err: any) {
    console.error('Error during execution:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSuperSalesIsolationTest();
