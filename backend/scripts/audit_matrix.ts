import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SS1_ID = '744de995-a272-457c-a809-de5c2e2fc7cd';
const SS2_ID = 'a0b5c364-0c8f-4933-98e2-a14d6c1be39a';

async function main() {
  console.log('=== AUDITING ALL RELEVANT ENTITIES & OWNERSHIP COLUMNS ===\n');

  // List of candidate models and possible ownership columns
  const entitiesToAudit: { name: string; model: keyof PrismaClient; fields: string[] }[] = [
    { name: 'Lead', model: 'lead' as any, fields: ['createdById', 'salesExecutiveId', 'assignedToId'] },
    { name: 'Quotation', model: 'quotation' as any, fields: ['createdById', 'salesExecutiveId'] },
    { name: 'SalesOrder', model: 'salesOrder' as any, fields: ['createdById', 'salesExecutiveId', 'salesPersonId'] },
    { name: 'Sample', model: 'sample' as any, fields: ['createdById', 'salesPersonId', 'requestedById', 'salesExecutiveId'] },
    { name: 'Reminder', model: 'reminder' as any, fields: ['userId', 'createdById'] },
    { name: 'PaymentFollowup', model: 'paymentFollowup' as any, fields: ['createdById', 'userId', 'salesExecutiveId'] },
    { name: 'Replacement', model: 'replacement' as any, fields: ['createdById', 'userId', 'salesExecutiveId'] },
    { name: 'Return', model: 'salesReturn' as any, fields: ['createdById', 'userId', 'salesExecutiveId'] },
    { name: 'Complaint', model: 'customerComplaint' as any, fields: ['createdById', 'userId', 'salesExecutiveId', 'assignedToId'] },
    { name: 'Customer', model: 'customer' as any, fields: ['createdById', 'salesExecutiveId', 'assignedToId'] },
    { name: 'SalesActivity', model: 'salesActivity' as any, fields: ['userId', 'createdById', 'salesExecutiveId'] },
    { name: 'SalesTarget', model: 'salesTarget' as any, fields: ['salespersonId', 'createdById'] },
    { name: 'Comment', model: 'comment' as any, fields: ['authorId', 'createdById', 'userId'] },
    { name: 'Attachment', model: 'attachment' as any, fields: ['uploadedById', 'createdById'] },
  ];

  for (const entity of entitiesToAudit) {
    try {
      const client = prisma[entity.model] as any;
      if (!client) {
        console.log(`[SKIP] Model ${entity.name} not found on Prisma client`);
        continue;
      }

      const totalCount = await client.count();
      
      // Let's check available fields on a sample item or query
      const sample = await client.findFirst();
      const actualFields = sample ? Object.keys(sample) : [];
      const presentOwnershipFields = entity.fields.filter(f => actualFields.includes(f));

      // Build counts for SS1, SS2, Unowned
      let ss1Count = 0;
      let ss2Count = 0;

      if (presentOwnershipFields.length > 0) {
        const ss1Or = presentOwnershipFields.map(f => ({ [f]: SS1_ID }));
        const ss2Or = presentOwnershipFields.map(f => ({ [f]: SS2_ID }));

        ss1Count = await client.count({ where: { OR: ss1Or } });
        ss2Count = await client.count({ where: { OR: ss2Or } });
      }

      console.log(`Entity: ${entity.name}`);
      console.log(`  Fields found in model: [${presentOwnershipFields.join(', ')}]`);
      console.log(`  Total rows in DB: ${totalCount}`);
      console.log(`  SuperSales 1 (${SS1_ID}) count: ${ss1Count}`);
      console.log(`  SuperSales 2 (${SS2_ID}) count: ${ss2Count}\n`);

    } catch (e: any) {
      console.log(`Error auditing ${entity.name}: ${e.message}`);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
