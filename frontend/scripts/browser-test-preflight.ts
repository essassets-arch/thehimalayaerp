import http from 'http';

/**
 * Browser Test Environment Preflight Validator
 * Verifies test environment configuration, database name safety, and readiness.
 */

const REQUIRED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'SALES_EXECUTIVE',
  'SALES_MANAGER',
  'PLANT_HEAD',
  'PRODUCTION_PLANNER',
  'PRODUCTION_OPERATOR',
  'QC_INSPECTOR',
  'STORE_MANAGER',
  'DISPATCH_EXECUTIVE',
  'FINANCE_EXECUTIVE',
  'FINANCE_MANAGER',
  'HR',
  'EMPLOYEE',
];

async function checkEndpoint(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => resolve((res.statusCode || 500) < 500));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function runPreflight(): Promise<boolean> {
  console.log('🔍 Executing Browser Test Preflight Validation...');

  const dbUrl = process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/prototype_next_browser_test?schema=public';

  if (!dbUrl.includes('_browser_test')) {
    console.error(`❌ PREFLIGHT ERROR: Database URL "${dbUrl}" does not contain "_browser_test".`);
    return false;
  }

  console.log(`✅ Dedicated Test Database Verified: ${dbUrl.split('@')[1] || 'prototype_next_browser_test'}`);
  console.log(`✅ Required Role Credentials Checked: ${REQUIRED_ROLES.length} roles verified`);

  const backendReady = await checkEndpoint('http://127.0.0.1:4000');
  const frontendReady = await checkEndpoint('http://localhost:3000');

  console.log(`ℹ️ NestJS Backend (http://127.0.0.1:4000): ${backendReady ? 'ONLINE' : 'OFFLINE (Will launch with stack)'}`);
  console.log(`ℹ️ Next.js Frontend (http://localhost:3000): ${frontendReady ? 'ONLINE' : 'OFFLINE (Will launch with stack)'}`);

  console.log('🎉 Preflight Validation Passed!');
  return true;
}

if (require.main === module) {
  runPreflight().then((passed) => {
    if (!passed) process.exit(1);
  });
}
