import { Prisma } from '@prisma/client';

async function main() {
  const followUpModel = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === 'followup');
  console.log('FollowUp fields:', followUpModel?.fields.map(f => `${f.name}: ${f.type}`));
}

main();
