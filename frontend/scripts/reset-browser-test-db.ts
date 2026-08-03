import { execSync } from 'child_process';
import path from 'path';

/**
 * Reset and seed dedicated browser test database.
 * Safety Guard: Enforces that DATABASE_URL contains '_browser_test'.
 */

const TEST_DB_URL = process.env.BROWSER_TEST_DATABASE_URL ||
  'postgresql://himalaya_erp_user:12345678@localhost:5432/prototype_next_browser_test?schema=public';

export async function resetBrowserTestDb() {
  if (!TEST_DB_URL.includes('_browser_test')) {
    throw new Error(`CRITICAL SAFETY ERROR: Target DATABASE_URL "${TEST_DB_URL}" does not contain "_browser_test". Aborting database reset.`);
  }

  console.log(`🧹 Resetting browser test database: ${TEST_DB_URL}`);
  const backendDir = path.resolve(__dirname, '../../backend');

  const env = {
    ...process.env,
    DATABASE_URL: TEST_DB_URL,
  };

  try {
    console.log('🔄 Executing Prisma db push on test database...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: backendDir,
      env,
      stdio: 'inherit',
    });

    console.log('🌱 Seeding role users and initial data on test database...');
    execSync('npx ts-node prisma/seed.ts', {
      cwd: backendDir,
      env,
      stdio: 'inherit',
    });

    console.log('✅ Browser test database successfully reset and seeded.');
  } catch (err: any) {
    console.error('❌ Failed to reset browser test database:', err.message);
    throw err;
  }
}

if (require.main === module) {
  resetBrowserTestDb().catch(() => process.exit(1));
}
