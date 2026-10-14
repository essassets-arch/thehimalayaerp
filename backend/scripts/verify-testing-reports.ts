import { PrismaClient } from '@prisma/client';
import { ProductionTestingService } from '../src/modules/production/production-testing.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { ProductionWorkflowService } from '../src/modules/production/production-workflow.service';
import { PrismaService } from '../src/database/prisma.service';

async function run() {
  console.log('=== Starting Production Testing Reports Verification ===');
  const prisma = new PrismaService();
  await prisma.$connect();

  const inventory = new InventoryService(prisma);
  const workflow = new ProductionWorkflowService(prisma, inventory);
  const service = new ProductionTestingService(prisma, inventory, workflow);

  // Find an existing user and their company in the database
  const user = await prisma.user.findFirst({
    include: { company: true },
  });
  if (!user || !user.company) {
    throw new Error('No user or company found in database');
  }
  const company = user.company;
  const otherCompany = await prisma.company.findFirst({ where: { id: { not: company.id } } });

  console.log(`Using Company: ${company.name} (${company.id})`);
  console.log(`Using User: ${user.name} (${user.id})`);

  // 1. Template verification
  const template = service.getDefaultTemplate();
  console.log('Template loaded. Specifications count:', template.specifications.length);
  if (template.specifications.length !== 10) {
    throw new Error(`Expected 10 specifications, got ${template.specifications.length}`);
  }
  if (template.loadTestingRows.length !== 6) {
    throw new Error(`Expected 6 test rows, got ${template.loadTestingRows.length}`);
  }
  console.log('✓ Default template has exact 10 specifications and 6 test rows matching reference image');

  // 2. Report Creation (Draft)
  const created = await service.createReport(
    {
      clientName: 'Tata Projects Ltd',
      poNumber: 'PO-TEST-999',
      productName: 'SFRC Manhole Cover 600mm Extra Heavy Duty',
      clearOpening: '600 mm Dia',
      quantitySupply: '50 Nos',
      projectName: 'Smart City Infrastructure Project',
      specifications: template.specifications.map((s, idx) => ({
        ...s,
        description: idx === 0 ? 'M45 Grade SFRC' : idx === 1 ? 'Class D400 (40 Ton)' : idx === 2 ? 'Grey' : s.description,
      })),
      loadTestingRows: template.loadTestingRows.map((r) => ({
        no: r.no,
        loadApplied: r.loadApplied,
        load: '', // intentionally blank to test verification rule
        sequence: r.sequence,
        remark: '',
      })),
      cycleLoadsTon: '40',
      finalLoadTon: '40',
      testedByName: 'Sana Konda Reddy',
      testedByTitle: 'Plant Head',
    },
    user.id,
    company.id,
  );

  console.log(`✓ Report created: ${created.reportNumber} (ID: ${created.id}, Status: ${created.status}, Rev: ${created.revision})`);

  // 3. Test verification rule: Cannot approve without load measurements
  let failedToBlockApproval = false;
  try {
    await service.updateReportStatus(
      created.id,
      { status: 'Approved', remarks: 'Premature approval attempt' },
      user.id,
      company.id,
    );
    failedToBlockApproval = true;
  } catch (err: any) {
    console.log(`✓ Expected error when approving unverified report: ${err.message}`);
  }
  if (failedToBlockApproval) {
    throw new Error('Security failure: Report was approved without recorded load measurements!');
  }

  // 4. Record actual measurements
  const updatedWithLoads = await service.updateReport(
    created.id,
    {
      loadTestingRows: template.loadTestingRows.map((r, i) => ({
        no: r.no,
        loadApplied: r.loadApplied,
        load: `${(i + 1) * 6.5}`,
        sequence: r.sequence,
        remark: 'Satisfactory',
      })),
      cycleLoadsTon: '40',
      finalLoadTon: '40',
      resultStatement:
        'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.',
    },
    user.id,
    company.id,
  );
  console.log(`✓ Updated report with actual recorded measurements`);

  // 5. Now approve with valid measurements
  const approved = await service.updateReportStatus(
    created.id,
    { status: 'Approved', remarks: 'Verified and approved by QA' },
    user.id,
    company.id,
  );
  console.log(`✓ Report successfully approved: Status = ${approved.status}, ApprovedBy = ${approved.approvedByName}`);

  // 6. Immutability check: approved report cannot be directly edited
  let allowedDirectEditOnApproved = false;
  try {
    await service.updateReport(
      created.id,
      { clientName: 'Illegal Tampering' },
      user.id,
      company.id,
    );
    allowedDirectEditOnApproved = true;
  } catch (err: any) {
    console.log(`✓ Expected error editing approved report: ${err.message}`);
  }
  if (allowedDirectEditOnApproved) {
    throw new Error('Security failure: Approved report was edited without revision control!');
  }

  // 7. Revision Control: Create revision for approved report
  const revision = await service.createRevision(
    created.id,
    user.id,
    company.id,
  );
  console.log(`✓ Created Revision: ${revision.reportNumber} (Rev: ${revision.revision}, Status: ${revision.status}, Parent Report ID: ${revision.parentReportId})`);
  if (revision.revision !== 1 || revision.status !== 'Draft') {
    throw new Error(`Revision properties invalid: Rev=${revision.revision}, Status=${revision.status}`);
  }

  // 8. Tenant Isolation check
  if (otherCompany) {
    console.log(`Testing tenant isolation against Company ${otherCompany.name} (${otherCompany.id})`);
    let crossTenantReadSucceeded = false;
    try {
      await service.getReport(created.id, otherCompany.id);
      crossTenantReadSucceeded = true;
    } catch (err: any) {
      console.log(`✓ Cross-tenant read correctly rejected: ${err.message}`);
    }
    if (crossTenantReadSucceeded) {
      throw new Error('Security failure: Cross-tenant data leak detected!');
    }
  } else {
    console.log('Testing tenant isolation with simulated bogus companyId');
    let crossTenantReadSucceeded = false;
    try {
      await service.getReport(created.id, '00000000-0000-0000-0000-000000000000');
      crossTenantReadSucceeded = true;
    } catch (err: any) {
      console.log(`✓ Cross-tenant read correctly rejected: ${err.message}`);
    }
    if (crossTenantReadSucceeded) {
      throw new Error('Security failure: Cross-tenant data leak detected!');
    }
  }

  // 9. Clean up our test records only
  await prisma.productionTestReport.deleteMany({
    where: {
      id: { in: [created.id, revision.id] },
    },
  });
  console.log('✓ Cleaned up test fixture records without touching any live company data');

  await prisma.$disconnect();
  console.log('=== ALL PRODUCTION TESTING SERVICE CHECKS PASSED ===');
}

run().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
