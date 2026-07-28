import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function generatePublicId(
  tx: Prisma.TransactionClient,
  entityType: string,
  prefix: string,
): Promise<string> {
  const sequence = await tx.idSequence.upsert({
    where: { key: entityType },
    create: { key: entityType, nextValue: 2 },
    update: { nextValue: { increment: 1 } },
  });

  const paddedValue = (sequence.nextValue - 1).toString().padStart(6, '0');
  return `${prefix}-${paddedValue}`;
}

async function main() {
  const filePath = path.join(__dirname, '..', '..', 'frontend', 'exported_customers.json');
  if (!fs.existsSync(filePath)) {
    console.error(`Exported customers file not found at ${filePath}`);
    console.error('Please export legacy customers from the browser first.');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const legacyCustomers = JSON.parse(fileContent);

  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found in database. Please run the seed script first.');
    process.exit(1);
  }
  const companyId = company.id;

  const userId = 'sys-migration';

  console.log(`Starting migration of ${legacyCustomers.length} legacy customers...`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const legacy of legacyCustomers) {
    try {
      const gstin = legacy.gstin || legacy.gstNumber;
      const email = legacy.email || legacy.emailAddress;
      const phone = legacy.phone || legacy.mobile || legacy.contactNumber;
      const companyName = legacy.companyName || legacy.name || legacy.customerName;

      if (!companyName) {
        console.warn(`Skipping customer with no company name: ${legacy.id}`);
        skipCount++;
        continue;
      }

      // Check duplicates
      const checks = [];
      if (gstin) checks.push({ gstin });
      if (email) checks.push({ email });
      if (phone) checks.push({ phone });
      if (companyName) checks.push({ companyName });

      let duplicate = false;
      if (checks.length > 0) {
        const existing = await prisma.customer.findFirst({
          where: { companyId, OR: checks, deletedAt: null }
        });
        if (existing) {
          console.log(`Skipping duplicate customer: ${companyName}`);
          skipCount++;
          duplicate = true;
        }
      }

      if (duplicate) continue;

      await prisma.$transaction(async (tx) => {
        const customerCode = await generatePublicId(tx, 'CUSTOMER', 'CUST');
        
        await tx.customer.create({
          data: {
            customerCode,
            companyId,
            companyName,
            email,
            phone,
            gstin,
            pan: legacy.pan || legacy.panNumber,
            contactPerson: legacy.contactPerson,
            billingAddress: legacy.billingAddress || legacy.address ? { address: legacy.address } : undefined,
            shippingAddress: legacy.shippingAddress,
            creditDays: Number(legacy.creditDays) || 0,
            creditLimit: Number(legacy.creditLimit) || 0,
            paymentTerms: Number(legacy.paymentTerms) || 0,
            notes: legacy.notes,
            status: legacy.isActive === false ? 'INACTIVE' : 'ACTIVE',
            createdById: userId,
          }
        });
      });

      successCount++;
    } catch (error) {
      console.error(`Error migrating customer ${legacy.id || 'unknown'}:`, error);
      errorCount++;
    }
  }

  console.log('--- Migration Summary ---');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Skipped (duplicates/invalid): ${skipCount}`);
  console.log(`Failed (errors): ${errorCount}`);
  console.log('-------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
