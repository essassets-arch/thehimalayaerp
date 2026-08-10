import { PrismaClient } from '@prisma/client';

const dbUrls = [
  "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public",
  process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public",
];

async function repairDbOwnership(url: string) {
  console.log(`\n===================================================================`);
  console.log(` REPAIRING EXISTING RECORD OWNERSHIP ON DB: ${url}`);
  console.log(`===================================================================\n`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    // 1. Repair Leads
    const nullLeads = await prisma.lead.findMany({
      where: { salesExecutiveId: null },
      select: { id: true, createdById: true, leadNumber: true, companyName: true },
    });

    console.log(`Found ${nullLeads.length} leads with salesExecutiveId = null.`);
    for (const l of nullLeads) {
      if (l.createdById) {
        await prisma.lead.update({
          where: { id: l.id },
          data: { salesExecutiveId: l.createdById },
        });
        console.log(`  [REPAIRED] Lead ${l.leadNumber} (${l.companyName}): assigned salesExecutiveId = createdById (${l.createdById})`);
      }
    }

    // 2. Repair Quotations
    const nullQuotations = await prisma.quotation.findMany({
      where: { salesExecutiveId: null },
      select: { id: true, createdById: true, quotationNumber: true },
    });

    console.log(`\nFound ${nullQuotations.length} quotations with salesExecutiveId = null.`);
    for (const q of nullQuotations) {
      if (q.createdById) {
        await prisma.quotation.update({
          where: { id: q.id },
          data: { salesExecutiveId: q.createdById },
        });
        console.log(`  [REPAIRED] Quotation ${q.quotationNumber}: assigned salesExecutiveId = createdById (${q.createdById})`);
      }
    }

    // 3. Repair Sales Orders
    const nullOrders = await prisma.salesOrder.findMany({
      where: { salesExecutiveId: null },
      select: { id: true, createdById: true, orderNumber: true },
    });

    console.log(`\nFound ${nullOrders.length} sales orders with salesExecutiveId = null.`);
    for (const o of nullOrders) {
      if (o.createdById) {
        const userExists = await prisma.user.findUnique({ where: { id: o.createdById } });
        if (userExists) {
          await prisma.salesOrder.update({
            where: { id: o.id },
            data: { salesExecutiveId: o.createdById },
          });
          console.log(`  [REPAIRED] SalesOrder ${o.orderNumber}: assigned salesExecutiveId = createdById (${o.createdById})`);
        }
      }
    }

    // 4. Repair Sample Requests
    const nullSamples = await prisma.sampleRequest.findMany({
      where: { salesExecutiveId: null },
      select: { id: true, createdById: true, sampleNumber: true },
    });

    console.log(`\nFound ${nullSamples.length} sample requests with salesExecutiveId = null.`);
    for (const s of nullSamples) {
      if (s.createdById) {
        const userExists = await prisma.user.findUnique({ where: { id: s.createdById } });
        if (userExists) {
          await prisma.sampleRequest.update({
            where: { id: s.id },
            data: { salesExecutiveId: s.createdById },
          });
          console.log(`  [REPAIRED] Sample ${s.sampleNumber}: assigned salesExecutiveId = createdById (${s.createdById})`);
        }
      }
    }

    // 5. Repair Complaints
    const nullComplaints = await prisma.customerComplaint.findMany({
      where: { salesExecutiveId: null },
      select: { id: true, createdBy: true, complaintNo: true },
    });

    console.log(`\nFound ${nullComplaints.length} complaints with salesExecutiveId = null.`);
    for (const c of nullComplaints) {
      if (c.createdBy) {
        const userExists = await prisma.user.findUnique({ where: { id: c.createdBy } });
        if (userExists) {
          await prisma.customerComplaint.update({
            where: { id: c.id },
            data: { salesExecutiveId: c.createdBy },
          });
          console.log(`  [REPAIRED] Complaint ${c.complaintNo}: assigned salesExecutiveId = createdBy (${c.createdBy})`);
        }
      }
    }

    console.log(`\n[SUCCESS] Ownership repair completed for ${url}!`);

  } catch (e: any) {
    console.error(`Error repairing DB ${url}:`, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const url of dbUrls) {
    await repairDbOwnership(url);
  }
}

main();
