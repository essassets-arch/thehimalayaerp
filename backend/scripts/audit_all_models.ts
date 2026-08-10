import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SS1_ID = '744de995-a272-457c-a809-de5c2e2fc7cd';
const SS2_ID = 'a0b5c364-0c8f-4933-98e2-a14d6c1be39a';

async function main() {
  const modelKeys = Object.keys(prisma).filter(
    (k) => !k.startsWith('_') && !k.startsWith('$')
  );

  console.log(`Available Prisma models (${modelKeys.length}):`);
  console.log(modelKeys.join(', '));
  console.log('\n--- DETAILED MODEL FIELD & COUNT AUDIT ---\n');

  for (const modelKey of modelKeys) {
    try {
      const client = (prisma as any)[modelKey];
      if (typeof client?.count !== 'function') continue;

      const count = await client.count();
      const sample = await client.findFirst();
      const fields = sample ? Object.keys(sample) : [];

      // Find fields ending with 'Id' or containing 'by' or 'user' or 'sales' or 'owner' or 'assigned'
      const potentialOwnerFields = fields.filter((f) =>
        /id|user|owner|sales|created|assigned|requested/i.test(f)
      );

      let ss1Count = 0;
      let ss2Count = 0;

      if (potentialOwnerFields.length > 0 && sample) {
        const ss1Or = potentialOwnerFields.map((f) => ({ [f]: SS1_ID }));
        const ss2Or = potentialOwnerFields.map((f) => ({ [f]: SS2_ID }));

        try {
          ss1Count = await client.count({ where: { OR: ss1Or } });
          ss2Count = await client.count({ where: { OR: ss2Or } });
        } catch {
          // Some fields might not be string IDs, test field by field
          for (const f of potentialOwnerFields) {
            try {
              const c1 = await client.count({ where: { [f]: SS1_ID } });
              const c2 = await client.count({ where: { [f]: SS2_ID } });
              ss1Count += c1;
              ss2Count += c2;
            } catch {}
          }
        }
      }

      if (count > 0 || ss1Count > 0 || ss2Count > 0 || fields.some(f => /lead|quotation|order|sample|reminder|payment|return|replacement|complaint|sales/i.test(modelKey))) {
        console.log(`Model: ${modelKey}`);
        console.log(`  Total count: ${count}`);
        console.log(`  Potential owner fields: [${potentialOwnerFields.join(', ')}]`);
        console.log(`  SS1 count: ${ss1Count}`);
        console.log(`  SS2 count: ${ss2Count}`);
        console.log(`  All fields: [${fields.join(', ')}]`);
        console.log('');
      }
    } catch (e: any) {
      // ignore
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
