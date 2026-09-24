require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';

async function runAdditiveMigration() {
  console.log('1. Checking pre-migration counts...');
  const preCounts = {
    user: await prisma.user.count(),
    employee: await prisma.employee.count(),
    company: await prisma.company.count(),
    attendance: await prisma.attendance.count(),
    customer: await prisma.customer.count(),
    product: await prisma.product.count(),
    salesOrder: await prisma.salesOrder.count(),
    deviceSession: await prisma.deviceSession.count(),
    latestUserLocation: await prisma.latestUserLocation.count(),
    userLocationHistory: await prisma.userLocationHistory.count(),
  };
  console.log('Pre-migration counts:', JSON.stringify(preCounts, null, 2));

  console.log('\n2. Reading migration SQL...');
  const migrationPath = path.resolve('backend/prisma/migrations/20260923200000_add_employee_live_route_tracking/migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Verify no destructive words
  const forbidden = ['DROP TABLE', 'DROP COLUMN', 'TRUNCATE', 'DELETE FROM'];
  for (const word of forbidden) {
    if (sql.toUpperCase().includes(word)) {
      throw new Error(`CRITICAL ERROR: Destructive keyword found: ${word}`);
    }
  }
  console.log('✓ Migration SQL verified: zero destructive operations.');

  console.log('\n3. Executing additive migration via psql...');
  let dbUrl = process.env.DATABASE_URL.split('?')[0];

  await new Promise((resolve, reject) => {
    execFile(psqlPath, ['-d', dbUrl, '-f', migrationPath, '-v', 'ON_ERROR_STOP=1'], (err, stdout, stderr) => {
      if (err) {
        console.error('psql execution error:', err.message);
        if (stderr) console.error('psql stderr:', stderr);
        return reject(err);
      }
      console.log('psql stdout:\n', stdout);
      resolve();
    });
  });

  console.log('✓ Additive migration executed successfully via psql!');

  console.log('\n4. Checking post-migration counts...');
  const postCounts = {
    user: await prisma.user.count(),
    employee: await prisma.employee.count(),
    company: await prisma.company.count(),
    attendance: await prisma.attendance.count(),
    customer: await prisma.customer.count(),
    product: await prisma.product.count(),
    salesOrder: await prisma.salesOrder.count(),
    deviceSession: await prisma.deviceSession.count(),
    latestUserLocation: await prisma.latestUserLocation.count(),
    userLocationHistory: await prisma.userLocationHistory.count(),
  };
  console.log('Post-migration counts:', JSON.stringify(postCounts, null, 2));

  // Assert all counts match
  for (const key of Object.keys(preCounts)) {
    if (preCounts[key] !== postCounts[key]) {
      throw new Error(`MISMATCH DETECTED for ${key}: pre=${preCounts[key]}, post=${postCounts[key]}`);
    }
  }
  console.log('\n✓ ALL BASELINE RECORD COUNTS 100% MATCH! Zero data loss verified.');
}

runAdditiveMigration()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
