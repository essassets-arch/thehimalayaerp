import { PrismaClient } from '@prisma/client';
import { CustomerComplaintsService } from '../src/modules/customer-complaints/customer-complaints.service';
import { SequenceService } from '../src/common/sequence/sequence.service';
import { PrismaService } from '../src/database/prisma.service';

const prisma = new PrismaClient();

async function check() {
  const p = new PrismaService();
  const s = new SequenceService(p as any);
  const c = new CustomerComplaintsService(p as any, s as any);

  const u = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  const comp = await c.listSales(u!.id, 'SUPER_SALES');
  console.log('Complaints for SS1:', comp.length);
  await prisma.$disconnect();
}
check();
