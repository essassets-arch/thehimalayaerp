const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');
const envFile = path.join(backendDir, '.env.browser-test');
const frontendEnvFile = path.resolve(backendDir, '../frontend/.env.browser-test');

function loadBrowserTestEnvironment() {
  if (!fs.existsSync(envFile)) {
    throw new Error('backend/.env.browser-test is required to reset the browser-test database.');
  }

  for (const file of [envFile, frontendEnvFile]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      process.env[key] = rawValue.replace(/^(?:"|')|(?:"|')$/g, '');
    }
  }
}

function assertBrowserTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing from backend/.env.browser-test.');

  const databaseName = new URL(databaseUrl).pathname.replace(/^\//, '');
  if (!databaseName.endsWith('_browser_test')) {
    throw new Error(`Refusing to reset unsafe database "${databaseName}". Expected a name ending in "_browser_test".`);
  }

  return databaseName;
}

function run(command, args) {
  execFileSync(command, args, {
    cwd: backendDir,
    env: process.env,
    stdio: 'inherit',
  });
}

try {
  loadBrowserTestEnvironment();
  const databaseName = assertBrowserTestDatabase();
  if (!process.env.E2E_COMMON_PASSWORD) {
    throw new Error('E2E_COMMON_PASSWORD is missing from backend/.env.browser-test.');
  }
  console.log(`[BROWSER TEST] Resetting ${databaseName}`);
  run(process.execPath, ['scripts/clean-db.js']);
  run(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy']);
  run(process.execPath, [require.resolve('ts-node/dist/bin.js'), 'prisma/seed-browser-test.ts']);
  console.log('[BROWSER TEST] Database reset and seed completed.');
} catch (error) {
  console.error(`[BROWSER TEST] Reset failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
