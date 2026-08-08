import { PrismaClient } from '@prisma/client';
import { LeadsService } from './src/modules/crm/leads.service';
import { QuotationsService } from './src/modules/quotations/quotations.service';
import { SalesService } from './src/modules/sales/sales.service';
import { SamplesService } from './src/modules/samples/samples.service';
import { PaymentsService } from './src/modules/finance/payments.service';
import { CrmInsightsService } from './src/modules/crm/crm-insights.service';
import { PrismaService } from './src/database/prisma.service';
import { WorkflowService } from './src/modules/workflow/workflow.service';
import { SequenceService } from './src/common/sequence/sequence.service';
import { CreditService } from './src/modules/finance/credit.service';
import { LedgerService } from './src/modules/finance/ledger.service';

const prisma = new PrismaClient();

async function runSuperSalesMatrixTest() {
  console.log('\n========================================');
  console.log(' SUPERSALES SECURITY & DATA ISOLATION VERIFICATION');
  console.log('========================================\n');

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

    const salesUser = await prisma.user.findFirst({
      where: { role: { code: 'SALES_EXECUTIVE' } },
      include: { role: true },
    });

    const superSalesUser = await prisma.user.findFirst({
      where: { role: { code: 'SUPER_SALES' } },
      include: { role: true },
    });

    const superAdminUser = await prisma.user.findFirst({
      where: { role: { code: 'SUPER_ADMIN' } },
      include: { role: true },
    });

    const customer = await prisma.customer.findFirst({ select: { id: true, companyId: true } });
    if (!customer) throw new Error('No customer found in database');

    console.log(`✓ Standard Sales User: ${salesUser?.email} (${salesUser?.role?.code})`);
    console.log(`✓ SuperSales User: ${superSalesUser?.email} (${superSalesUser?.role?.code})`);
    console.log(`✓ Super Admin User: ${superAdminUser?.email} (${superAdminUser?.role?.code})\n`);

    let allPassed = true;

    // Clean up any previously created test data for fresh testing
    await prisma.lead.deleteMany({ where: { createdById: superSalesUser!.id } });
    await prisma.quotation.deleteMany({ where: { createdById: superSalesUser!.id } });
    await prisma.salesOrder.deleteMany({ where: { createdById: superSalesUser!.id } });

    console.log('--- 1. FRESH ACCOUNT DATA ISOLATION TEST (super.sales@himalayaerp.com) ---');
    const freshLeads = await leadsService.listLeads(customer.companyId, undefined, superSalesUser!.id, superSalesUser!.role?.code);
    const freshQuotations = await quotationsService.listQuotations(customer.companyId, undefined, superSalesUser!.id, superSalesUser!.role?.code);
    const freshOrders = await salesService.listOrders({}, superSalesUser!.id, superSalesUser!.role?.code);
    const freshSamples = await samplesService.findAll(customer.companyId, superSalesUser!.id, superSalesUser!.role?.code);
    const freshPayments = await paymentsService.listPayments(superSalesUser!.id, superSalesUser!.role?.code);
    const freshDashboard = await crmInsightsService.salesDashboard(customer.companyId, superSalesUser!.id, superSalesUser!.role?.code);

    if (
      freshLeads.length === 0 &&
      freshQuotations.length === 0 &&
      freshOrders.data.length === 0 &&
      freshSamples.length === 0 &&
      freshPayments.length === 0 &&
      freshDashboard.metrics.totalLeads === 0 &&
      freshDashboard.metrics.salesRevenue === 0
    ) {
      console.log('  [PASS] Fresh SuperSales Account correctly starts with 0 Leads, 0 Quotations, 0 Orders, 0 Samples, 0 Payments, 0 Revenue!');
    } else {
      console.error('  [FAIL] Fresh SuperSales Account leaked existing Sales data!');
      console.error(`         Leads: ${freshLeads.length}, Quotations: ${freshQuotations.length}, Orders: ${freshOrders.data.length}, Samples: ${freshSamples.length}`);
      allPassed = false;
    }

    console.log('\n--- 2. CREATING SUPERSALES LEAD & VERIFYING CROSS-USER ISOLATION ---');
    const createdLead = await leadsService.createLead(
      {
        companyName: 'SuperSales Test Client Alpha',
        contactPerson: 'Jane Doe',
        email: 'jane@supersales.com',
        phone: '9876543210',
        source: 'WEBSITE',
        productInterest: 'Polymer Masterbatch',
      },
      superSalesUser!.id,
      customer.companyId,
      superSalesUser!.role?.code
    );

    const superSalesLeadsAfter = await leadsService.listLeads(customer.companyId, undefined, superSalesUser!.id, superSalesUser!.role?.code);
    const superSalesDashboardAfter = await crmInsightsService.salesDashboard(customer.companyId, superSalesUser!.id, superSalesUser!.role?.code);
    const standardSalesLeadsAfter = await leadsService.listLeads(customer.companyId, undefined, salesUser!.id, salesUser!.role?.code);
    const adminLeadsAfter = await leadsService.listLeads(customer.companyId, undefined, superAdminUser!.id, superAdminUser!.role?.code);

    const isVisibleToSuperSales = superSalesLeadsAfter.some((l) => l.id === createdLead.id);
    const isHiddenFromSalesExec = !standardSalesLeadsAfter.some((l) => l.id === createdLead.id);
    const isVisibleToAdmin = adminLeadsAfter.some((l) => l.id === createdLead.id);

    if (isVisibleToSuperSales && superSalesDashboardAfter.metrics.totalLeads === 1) {
      console.log(`  [PASS] SuperSales User sees created lead "${createdLead.companyName}" (Dashboard Total Leads = 1)`);
    } else {
      console.error('  [FAIL] SuperSales User could not see created lead or dashboard count failed');
      allPassed = false;
    }

    if (isHiddenFromSalesExec) {
      console.log('  [PASS] Standard Sales Executive correctly CANNOT see SuperSales lead!');
    } else {
      console.error('  [FAIL] Standard Sales Executive leaked SuperSales lead!');
      allPassed = false;
    }

    if (isVisibleToAdmin) {
      console.log('  [PASS] Super Admin correctly retains global visibility of SuperSales lead!');
    } else {
      console.error('  [FAIL] Super Admin lost management visibility!');
      allPassed = false;
    }

    console.log('\n--- 3. PAYMENT TERMS ROLE VALIDATION & CONVERSION OWNERSHIP ---');
    async function testServiceCreate(user: any, days: number, expectPass: boolean) {
      const payload = {
        customerId: customer!.id,
        companyId: customer!.companyId,
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        remarks: `Test payment terms ${days} days`,
        paymentTerms: `${days} Days`,
        paymentTermDays: days,
        items: [{ productName: 'Test Product', quantity: 1, unitPrice: 1000, discount: 0, tax: 18, lineTotal: 1180 }],
      };

      try {
        const qtn = await quotationsService.createQuotation(payload, user.id, user.companyId, user.role?.code);
        if (expectPass) {
          console.log(`  [PASS] Role: ${user.role?.code} | ${days} Days -> Created: ${qtn.quotationNumber}`);
          return true;
        } else {
          console.error(`  [FAIL] Role: ${user.role?.code} | ${days} Days -> Unexpectedly SUCCEEDED!`);
          return false;
        }
      } catch (err: any) {
        if (!expectPass && err.message?.includes('Payment terms cannot exceed')) {
          console.log(`  [PASS] Role: ${user.role?.code} | ${days} Days -> Correctly BLOCKED ("${err.message}")`);
          return true;
        } else {
          console.error(`  [FAIL] Role: ${user.role?.code} | ${days} Days -> Error: ${err.message}`);
          return false;
        }
      }
    }

    allPassed = (await testServiceCreate(salesUser, 20, true)) && allPassed;
    allPassed = (await testServiceCreate(salesUser, 30, false)) && allPassed;
    allPassed = (await testServiceCreate(superSalesUser, 90, true)) && allPassed;
    allPassed = (await testServiceCreate(superSalesUser, 91, false)) && allPassed;

    const superSalesQtn = await quotationsService.createQuotation(
      {
        customerId: customer!.id,
        companyId: customer!.companyId,
        paymentTerms: '90 Days',
        paymentTermDays: 90,
        items: [{ productName: 'Order Conversion Product', quantity: 2, unitPrice: 500, discount: 0, tax: 18, lineTotal: 1180 }],
      },
      superSalesUser!.id,
      superSalesUser!.companyId,
      superSalesUser!.role?.code
    );

    const convertedOrder = await quotationsService.convertToSalesOrder(
      superSalesQtn.id,
      superSalesUser!.id,
      superSalesUser!.role?.code
    );

    const superSalesOrders = await salesService.listOrders({}, superSalesUser!.id, superSalesUser!.role?.code);
    const salesExecOrders = await salesService.listOrders({}, salesUser!.id, salesUser!.role?.code);

    const superSalesHasOrder = superSalesOrders.data.some((o) => o.id === convertedOrder.id);
    const salesExecHasOrder = salesExecOrders.data.some((o) => o.id === convertedOrder.id);

    if (superSalesHasOrder && (convertedOrder as any).paymentTermsDays === 90) {
      console.log(`  [PASS] Order Conversion -> SalesOrder ${(convertedOrder as any).orderNumber} inherited paymentTermsDays = 90 and SuperSales ownership!`);
    } else {
      console.error('  [FAIL] SuperSales missing converted order!');
      allPassed = false;
    }

    if (!salesExecHasOrder) {
      console.log('  [PASS] Standard Sales Executive correctly CANNOT see SuperSales converted order!');
    } else {
      console.error('  [FAIL] Standard Sales Executive leaked SuperSales converted order!');
      allPassed = false;
    }

    console.log('\n========================================');
    if (allPassed) {
      console.log(' ✅ ALL DATA ISOLATION & SECURITY MATRIX TESTS PASSED PERFECTLY!');
    } else {
      console.error(' ❌ SOME TESTS FAILED!');
    }
    console.log('========================================\n');
  } catch (err: any) {
    console.error('Test execution failed:', err.stack || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runSuperSalesMatrixTest();
