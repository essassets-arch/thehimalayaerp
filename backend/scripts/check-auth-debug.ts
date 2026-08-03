import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

async function main() {
  const output: any = {};
  
  // 1. Environments
  const frontEnvPath = path.resolve(__dirname, '../../frontend/.env.browser-test');
  const backEnvPath = path.resolve(__dirname, '../../backend/.env.browser-test');
  
  const frontEnv = fs.readFileSync(frontEnvPath, 'utf8');
  const backEnv = fs.existsSync(backEnvPath) ? fs.readFileSync(backEnvPath, 'utf8') : 'MISSING';
  
  output.environments = {
    frontend: {
      hasEmail: frontEnv.includes('sales.executive.browser@himalayaerp.test'),
      password: frontEnv.split('\n').find(l => l.startsWith('E2E_COMMON_PASSWORD'))?.trim(),
      hasCr: frontEnv.includes('\r')
    },
    backend: {
      hasUrl: backEnv.includes('himalaya_erp_browser_test'),
      hasCr: backEnv.includes('\r')
    }
  };

  // 2. Database User
  const pTest = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
  });
  
  const user = await pTest.user.findFirst({
    where: { email: 'sales.executive.browser@himalayaerp.test' },
    include: { role: true }
  });
  
  if (user) {
    output.user = {
      email: user.email,
      role: user.role?.code,
      isActive: user.isActive,
      deletedAt: user.deletedAt,
      passwordHashLength: user.password.length,
    };
    
    // 3. Password Verification
    const commonPassword = output.environments.frontend.password?.split('=')[1].replace(/["']/g, '');
    const cleanPassword = commonPassword?.replace(/\r/g, '');
    
    output.passwordVerification = {
      rawCommonPasswordMatch: commonPassword ? await bcrypt.compare(commonPassword, user.password) : false,
      cleanCommonPasswordMatch: cleanPassword ? await bcrypt.compare(cleanPassword, user.password) : false,
      admin123Match: await bcrypt.compare('admin123', user.password),
      admin123CrMatch: await bcrypt.compare('admin123\r', user.password),
    };
  } else {
    output.user = 'NOT FOUND';
  }

  // 4. Test Dev DB
  const pDev = new PrismaClient({
    datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' } }
  });
  const devUser = await pDev.user.findFirst({
    where: { email: 'sales.executive.browser@himalayaerp.test' }
  });
  output.devUserExists = !!devUser;

  // 5. Test HTTP Login
  output.httpLogin = await new Promise((resolve) => {
    const commonPassword = output.environments.frontend.password?.split('=')[1].replace(/["']/g, '');
    const cleanPassword = commonPassword?.replace(/\r/g, '');

    const req = http.request({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(JSON.stringify({ email: 'sales.executive.browser@himalayaerp.test', password: cleanPassword }));
    req.end();
  });
  
  fs.writeFileSync(path.resolve(__dirname, '../../auth-debug-output.json'), JSON.stringify(output, null, 2));
  console.log('Done! Wrote auth-debug-output.json');
}

main().catch(console.error);
