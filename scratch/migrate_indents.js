const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  const indents = await prisma.purchaseIndent.findMany({
    where: { companyId },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${indents.length} indents to migrate.`);
  let count = 1;
  for (const ind of indents) {
    const newId = `ind-${String(count).padStart(4, '0')}`;
    await prisma.purchaseIndent.update({
      where: { id: ind.id },
      data: {
        publicId: newId,
        indentNo: newId
      }
    });
    console.log(`Updated indent ${ind.id}: ${ind.publicId} -> ${newId}`);
    count++;
  }

  // Update or insert into idSequence so the next generated indent is ind-0009
  const seqKey = `${companyId}_PURCHASE_INDENT`;
  await prisma.idSequence.upsert({
    where: { key: seqKey },
    update: { nextValue: count },
    create: { key: seqKey, nextValue: count }
  });
  console.log(`Sequence key "${seqKey}" updated with nextValue: ${count}`);

  const check = await prisma.purchaseIndent.findMany({
    select: { id: true, publicId: true, indentNo: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
  console.log('Migrated indents:', JSON.stringify(check, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
