/**
 * 360-Degree Comprehensive Database & Model Scoping Audit Script
 * Tests all Prisma models and RBAC scoping functions to catch invalid relation arguments.
 */

const { PrismaClient } = require('@prisma/client');
const { getSalesScope } = require('../dist/src/common/utils/rbac.util');

const prisma = new PrismaClient();

async function audit360() {
  console.log('================================================================');
  console.log(' HIMALAYA ERP - 360-DEGREE COMPREHENSIVE DATABASE & SCOPING AUDIT');
  console.log('================================================================\n');

  const testUserId = '744de995-a272-457c-a809-de5c2e2fc7cd';
  const testRoles = ['SUPER_SALES', 'SALES_EXECUTIVE', 'SUPER_ADMIN', 'ADMIN', 'DISPATCH_EXECUTIVE', 'FINANCE_MANAGER'];

  const modelsToTest = [
    { name: 'Lead', modelKey: 'lead', scopeModel: 'Lead' },
    { name: 'Quotation', modelKey: 'quotation', scopeModel: 'Quotation' },
    { name: 'SalesOrder', modelKey: 'salesOrder', scopeModel: 'SalesOrder' },
    { name: 'SampleRequest', modelKey: 'sampleRequest', scopeModel: 'SampleRequest' },
    { name: 'CustomerComplaint', modelKey: 'customerComplaint', scopeModel: 'CustomerComplaint' },
    { name: 'CustomerPayment', modelKey: 'customerPayment', scopeModel: 'CustomerPayment' },
    { name: 'SalesReturn', modelKey: 'salesReturn', scopeModel: 'SalesReturn' },
    { name: 'ReplacementRequest', modelKey: 'replacementRequest', scopeModel: 'ReplacementRequest' },
    { name: 'FollowUp', modelKey: 'followUp', scopeModel: 'FollowUp' },
    { name: 'Dispatch', modelKey: 'dispatch', scopeModel: 'Dispatch' },
    { name: 'ProductionPlan', modelKey: 'productionPlan', scopeModel: 'ProductionPlan' },
    { name: 'WorkOrder', modelKey: 'workOrder', scopeModel: 'WorkOrder' },
    { name: 'Customer', modelKey: 'customer', scopeModel: 'Customer' },
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const item of modelsToTest) {
    console.log(`🔍 Auditing Scoping & Prisma Query for Model: [${item.name}]`);

    for (const role of testRoles) {
      totalTests++;
      try {
        const scope = getSalesScope(testUserId, role, item.scopeModel);
        
        // Execute actual test query against database using the computed scope
        await prisma[item.modelKey].findFirst({
          where: {
            ...scope
          }
        });
        
        passedTests++;
        console.log(`   ✓ Role '${role}' -> Scope valid:`, JSON.stringify(scope));
      } catch (err) {
        failedTests++;
        console.error(`   ❌ FAILED for Model '${item.name}' with Role '${role}':`, err.message);
      }
    }
    console.log('');
  }

  // Auditing Sequences
  console.log('🔢 Auditing Document Sequences in IdSequence Table...');
  const sequences = await prisma.idSequence.findMany();
  console.log('   Current IdSequence Records:');
  sequences.forEach(s => console.log(`     - [${s.key}]: nextValue = ${s.nextValue}`));

  // Auditing Master Products
  console.log('\n📦 Auditing Master Catalog Products...');
  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  console.log(`   Total Active Products in Database: ${totalProducts}`);

  console.log('\n================================================================');
  console.log(' 360-DEGREE AUDIT SUMMARY:');
  console.log(`   - Total Scoping Queries Tested: ${totalTests}`);
  console.log(`   - Passed (Zero Prisma Errors) : ${passedTests}`);
  console.log(`   - Failed                      : ${failedTests}`);
  console.log(`   - Audit Status                : ${failedTests === 0 ? '100% HEALTHY' : 'ISSUES DETECTED'}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

audit360()
  .catch(err => {
    console.error('Fatal error during 360 audit:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
