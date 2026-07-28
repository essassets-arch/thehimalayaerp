import { PrismaClient, SampleStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Legacy Samples Migration...');

  // 1. Fetch default company
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found. Ensure at least one Company exists in the database.');
  }
  
  // 2. Fetch required context
  const products = await prisma.product.findMany();
  const leads = await prisma.lead.findMany();
  const customers = await prisma.customer.findMany();

  // Assuming you might export samples to a file, or we can use a mock array here for testing if file doesn't exist
  const filePath = path.join(__dirname, 'legacy-samples.json');
  let legacySamples: any[] = [];

  if (fs.existsSync(filePath)) {
    console.log(`Reading legacy samples from ${filePath}`);
    const fileData = fs.readFileSync(filePath, 'utf-8');
    legacySamples = JSON.parse(fileData);
  } else {
    console.log(`No legacy-samples.json found. Creating dummy sample payload for testing.`);
    legacySamples = [
      {
        id: 1,
        sample_number: 'SMP-001',
        leadId: leads[0]?.id || undefined,
        customerId: customers[0]?.id || undefined,
        status: 'Requested',
        product_id: products[0]?.id,
        productName: products[0]?.name,
        quantity: 5,
        testing_parameters: 'Quality check',
        requestedDate: new Date().toISOString(),
      },
      {
        id: 2,
        sample_number: 'SMP-002',
        leadId: leads[1]?.id || undefined,
        customerId: customers[1]?.id || undefined,
        status: 'Approved',
        product_id: products[1]?.id,
        productName: products[1]?.name,
        quantity: 10,
        testing_parameters: 'Standard procedure',
        requestedDate: new Date().toISOString(),
      }
    ];
  }

  // Filter legacy samples that have at least a product
  const validSamples = legacySamples.filter(s => s.product_id || products.length > 0);

  let successCount = 0;
  let failCount = 0;

  for (const ls of validSamples) {
    try {
      // Map legacy status to Prisma Enum SampleStatus
      let mappedStatus: SampleStatus = SampleStatus.REQUESTED;
      const lsStatusStr = (ls.status || '').toUpperCase().replace(/ /g, '_');
      
      if (['REQUESTED'].includes(lsStatusStr)) mappedStatus = SampleStatus.REQUESTED;
      else if (['APPROVED'].includes(lsStatusStr)) mappedStatus = SampleStatus.APPROVED;
      else if (['REJECTED'].includes(lsStatusStr)) mappedStatus = SampleStatus.REJECTED;
      else if (['SAMPLE_PREPARATION', 'PREPARATION'].includes(lsStatusStr)) mappedStatus = SampleStatus.PREPARATION;
      else if (['READY_FOR_DISPATCH'].includes(lsStatusStr)) mappedStatus = SampleStatus.READY_FOR_DISPATCH;
      else if (['DISPATCHED'].includes(lsStatusStr)) mappedStatus = SampleStatus.DISPATCHED;
      else if (['IN_TRANSIT'].includes(lsStatusStr)) mappedStatus = SampleStatus.IN_TRANSIT;
      else if (['DELIVERED'].includes(lsStatusStr)) mappedStatus = SampleStatus.DELIVERED;
      else if (['TESTING', 'CLIENT_TESTING', 'EVALUATION_ACTIVE'].includes(lsStatusStr)) mappedStatus = SampleStatus.TESTING;
      else if (['TESTING_PASSED', 'PASSED'].includes(lsStatusStr)) mappedStatus = SampleStatus.TESTING_PASSED;
      else if (['TESTING_FAILED', 'FAILED'].includes(lsStatusStr)) mappedStatus = SampleStatus.TESTING_FAILED;
      else if (['RETURN_REQUESTED', 'SAMPLE_BACK_REQUESTED'].includes(lsStatusStr)) mappedStatus = SampleStatus.RETURN_REQUESTED;
      else if (['RETURNED'].includes(lsStatusStr)) mappedStatus = SampleStatus.RETURNED;

      const productId = ls.product_id && products.find(p => p.id === ls.product_id) ? ls.product_id : products[0]?.id;

      if (!productId) {
         console.log(`Skipping Sample ${ls.id} because no valid product was found.`);
         failCount++;
         continue;
      }

      await prisma.$transaction(async (tx) => {
        const createdSample = await tx.sampleRequest.create({
          data: {
            sampleNumber: ls.sample_number || ls.sampleNumber || `SMP-MIG-${Date.now()}-${randomUUID().substring(0,4)}`,
            companyId: company.id,
            leadId: ls.leadId && leads.find(l => l.id === ls.leadId) ? ls.leadId : undefined,
            customerId: ls.customerId && customers.find(c => c.id === ls.customerId) ? ls.customerId : undefined,
            status: mappedStatus,
            requestedDate: ls.requestedDate ? new Date(ls.requestedDate) : new Date(),
            expectedDeliveryDate: ls.expectedDeliveryDate ? new Date(ls.expectedDeliveryDate) : null,
            testingDeadline: ls.testingDeadline ? new Date(ls.testingDeadline) : null,
            returnDeadline: ls.returnDeadline ? new Date(ls.returnDeadline) : null,
            customerFeedback: ls.customerFeedback || null,
            createdById: 'system',
            items: {
              create: [
                {
                  productId: productId,
                  quantity: ls.quantity || 1,
                  specifications: ls.testing_parameters || ls.specifications || null
                }
              ]
            }
          }
        });

        await tx.sampleHistory.create({
          data: {
            sampleRequestId: createdSample.id,
            action: 'MIGRATION',
            details: { message: 'Migrated from legacy Zustand payload' },
            createdById: 'system'
          }
        });
      });

      console.log(`✅ Migrated Sample ${ls.sample_number || ls.id}`);
      successCount++;
    } catch (e) {
      console.error(`❌ Failed to migrate Sample ${ls.id}:`, e.message);
      failCount++;
    }
  }

  console.log(`Migration Complete. Success: ${successCount}, Failed: ${failCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
