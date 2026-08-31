import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function testSql() {
  const sql = fs.readFileSync(path.join(__dirname, 'reset_supersales1.sql'), 'utf-8');
  console.log('Executing SQL...');
  await prisma.$executeRawUnsafe(sql);
  console.log('SQL executed successfully!');
  await prisma.$disconnect();
}

testSql().catch(e => { console.error(e); process.exit(1); });
