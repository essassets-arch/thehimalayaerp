import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PID_FILE = path.resolve(__dirname, '../.browser-test-stack.json');

export async function stopBrowserTestStack() {
  console.log('🛑 Stopping Browser Test Stack...');

  if (fs.existsSync(PID_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
      if (data.backendPid) {
        console.log(`Killing backend PID ${data.backendPid}...`);
        try { execSync(`taskkill /F /PID ${data.backendPid} /T`); } catch {}
      }
      if (data.frontendPid) {
        console.log(`Killing frontend PID ${data.frontendPid}...`);
        try { execSync(`taskkill /F /PID ${data.frontendPid} /T`); } catch {}
      }
      fs.unlinkSync(PID_FILE);
      console.log('✅ Process ID file removed.');
    } catch (e) {
      console.warn('Warning during PID cleanup:', e);
    }
  }

  // Kill any process occupying ports 3000 or 4000
  try {
    const cmd = `powershell -Command "Get-NetTCPConnection -LocalPort 3000,4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`;
    execSync(cmd);
  } catch {}

  console.log('🏁 Browser Test Stack shut down cleanly.');
}

if (require.main === module) {
  stopBrowserTestStack().catch(() => process.exit(1));
}
