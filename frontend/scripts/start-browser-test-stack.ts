import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { resetBrowserTestDb } from './reset-browser-test-db';
import { stopBrowserTestStack } from './stop-browser-test-stack';

const PID_FILE = path.resolve(__dirname, '../.browser-test-stack.json');

async function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve((res.statusCode || 500) < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForReadiness(url: string, name: string, timeoutMs = 60000): Promise<boolean> {
  const start = Date.now();
  console.log(`⏳ Waiting for ${name} readiness at ${url}...`);
  while (Date.now() - start < timeoutMs) {
    if (await checkUrl(url)) {
      console.log(`✅ ${name} is READY!`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.error(`❌ Timeout waiting for ${name} at ${url}`);
  return false;
}

export async function startBrowserTestStack() {
  console.log('🚀 Starting Browser Test Stack Setup...');

  // Clean any stale processes
  await stopBrowserTestStack();

  // 1. Reset Test DB safely
  await resetBrowserTestDb();

  const backendDir = path.resolve(__dirname, '../../backend');
  const frontendDir = path.resolve(__dirname, '..');

  const TEST_DB_URL = process.env.BROWSER_TEST_DATABASE_URL ||
    'postgresql://himalaya_erp_user:12345678@localhost:5432/prototype_next_browser_test?schema=public';

  const env = {
    ...process.env,
    DATABASE_URL: TEST_DB_URL,
    NODE_ENV: 'test',
    PORT: '4000',
    BACKEND_API_URL: 'http://127.0.0.1:4000/api/v1',
  };

  // 2. Spawn Backend
  console.log('📦 Spawning NestJS test backend process...');
  const backendProc = spawn('npm', ['run', 'start'], {
    cwd: backendDir,
    env,
    shell: true,
    stdio: 'pipe',
  });

  // 3. Spawn Frontend
  const frontendCmd = fs.existsSync(path.resolve(frontendDir, '.next')) ? 'start' : 'dev';
  console.log(`📦 Spawning Next.js test frontend process (npm run ${frontendCmd})...`);
  const frontendProc = spawn('npm', ['run', frontendCmd], {
    cwd: frontendDir,
    env: { ...env, PORT: '3000' },
    shell: true,
    stdio: 'pipe',
  });

  // Save PIDs
  fs.writeFileSync(
    PID_FILE,
    JSON.stringify({
      backendPid: backendProc.pid,
      frontendPid: frontendProc.pid,
      startedAt: new Date().toISOString(),
    }, null, 2),
  );

  // Wait for endpoints
  const backendReady = await waitForReadiness('http://127.0.0.1:4000', 'NestJS Test Backend');
  const frontendReady = await waitForReadiness('http://localhost:3000', 'Next.js Test Frontend');

  if (!backendReady || !frontendReady) {
    throw new Error('Test stack processes failed to become ready in time.');
  }

  console.log('🎉 Browser Test Stack is FULLY OPERATIONAL!');
}

if (require.main === module) {
  startBrowserTestStack().catch(() => process.exit(1));
}
