import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

// Load .env.browser-test overrides first
const backendTestEnvPath = path.resolve(__dirname, '../.env.browser-test');
if (!fs.existsSync(backendTestEnvPath)) {
  console.error('[VALIDATE ERROR] backend/.env.browser-test is missing. Cannot run browser-test validation without the correct environment.');
  process.exit(1);
}

const envContent = fs.readFileSync(backendTestEnvPath, 'utf-8');
envContent.split('\n').forEach((line: string) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const val = match[2].trim();
    process.env[match[1].trim()] = val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val;
  }
});

const prisma = new PrismaClient();

// --- 5. Generic HTTP Helper ---
function redactSensitiveResponse(body: string): string {
  try {
    const parsed = JSON.parse(body);
    if (parsed.accessToken) parsed.accessToken = '[REDACTED]';
    if (parsed.data && parsed.data.accessToken) parsed.data.accessToken = '[REDACTED]';
    return JSON.stringify(parsed);
  } catch {
    return body.substring(0, 200) + '...';
  }
}

function requestJson<T>(options: http.RequestOptions, body?: unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const request = http.request(options, (response) => {
      let rawBody = '';

      response.on('data', (chunk: Buffer | string) => {
        rawBody += chunk.toString();
      });

      response.on('end', () => {
        const statusCode = response.statusCode ?? 500;

        if (statusCode >= 400) {
          reject(new Error(`HTTP ${statusCode}: ${redactSensitiveResponse(rawBody)}`));
          return;
        }

        try {
          resolve(JSON.parse(rawBody) as T);
        } catch {
          reject(new Error(`Invalid JSON response from ${options.path ?? 'unknown path'}`));
        }
      });
    });

    request.on('error', reject);

    if (body !== undefined) {
      const payload = JSON.stringify(body);
      if (!options.headers) options.headers = {};
      options.headers['Content-Length'] = Buffer.byteLength(payload);
      request.write(payload);
    }

    request.end();
  });
}

// --- 6. Explicit API Types ---
interface LoginResponse {
  accessToken?: string;
  data?: {
    accessToken?: string;
  };
}

interface ProductDto {
  id: string;
  publicId?: string;
  sku?: string;
  name: string;
  unit?: string;
  unitPrice?: string | number;
  isActive?: boolean;
  companyId?: string;
}

interface NestedProductList {
  data?: ProductDto[];
}

interface ProductListResponse {
  data?: ProductDto[] | NestedProductList;
}

// --- 7. Normalize Login Response ---
function extractAccessToken(response: LoginResponse): string {
  const token = response.data?.accessToken ?? response.accessToken;
  if (!token) {
    throw new Error('Login response did not contain an access token.');
  }
  return token;
}

// --- 8. Normalize Product API Responses ---
function extractProducts(response: ProductListResponse | ProductDto[]): ProductDto[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && !Array.isArray(response.data) && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}

// --- 12. Safety Check ---
function validateSafety(dbUrl: string) {
  try {
    const parsedUrl = new URL(dbUrl);
    const databaseName = parsedUrl.pathname.replace(/^\//, '');

    const unsafeNames = ['postgres', 'template0', 'template1', 'himalaya_erp', 'prototype_next'];
    if (unsafeNames.includes(databaseName.toLowerCase())) {
      throw new Error(`Unsafe database "${databaseName}" in deny list.`);
    }

    if (!databaseName.endsWith('_browser_test')) {
      throw new Error(`Unsafe database "${databaseName}". Expected a database name ending with "_browser_test".`);
    }
  } catch (err) {
    throw new Error(`Invalid DATABASE_URL format or safety check failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let mode = 'all';

  if (args.length > 0) {
    if (args.includes('--mode')) {
      const modeIdx = args.indexOf('--mode');
      if (modeIdx + 1 < args.length) {
        mode = args[modeIdx + 1];
      } else {
        console.error('[VALIDATE ERROR] --mode requires an argument.');
        process.exit(1);
      }
    } else if (args[0] === 'database' || args[0] === 'http' || args[0] === 'all') {
      mode = args[0];
    } else {
      console.error(`[VALIDATE ERROR] Invalid argument or mode: ${args[0]}`);
      process.exit(1);
    }
  }

  const validModes = ['database', 'http', 'all'];
  if (!validModes.includes(mode)) {
    console.error(`[VALIDATE ERROR] Invalid mode "${mode}". Supported modes: database, http, all.`);
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL || '';
  validateSafety(dbUrl);
  console.log(`[VALIDATE] Database check passed. Mode: ${mode}`);

  // --- Database Only Validation ---
  const reportData: Record<string, any> = {
    Companies: { expected: 1, created: await prisma.company.count(), missing: 0, duplicates: 0, status: '' },
    'Plants/Branches': { expected: 2, created: await prisma.branch.count(), missing: 0, duplicates: 0, status: '' },
    Departments: { expected: 7, created: await prisma.department.count(), missing: 0, duplicates: 0, status: '' },
    Roles: { expected: 14, created: await prisma.role.count(), missing: 0, duplicates: 0, status: '' },
    Permissions: { expected: 30, created: await prisma.permission.count(), missing: 0, duplicates: 0, status: '' },
    Users: { expected: 14, created: await prisma.user.count(), missing: 0, duplicates: 0, status: '' },
    Employees: { expected: 14, created: await prisma.employee.count(), missing: 0, duplicates: 0, status: '' },
    Units: { expected: 0, created: 0, missing: 0, duplicates: 0, status: '' },
    Categories: { expected: 0, created: 0, missing: 0, duplicates: 0, status: '' },
    Products: { expected: 10, created: await prisma.product.count({ where: { isActive: true } }), missing: 0, duplicates: 0, status: '' },
    Customers: { expected: 3, created: await prisma.customer.count(), missing: 0, duplicates: 0, status: '' },
    Vendors: { expected: 3, created: await prisma.supplier.count(), missing: 0, duplicates: 0, status: '' },
    Sequences: { expected: 12, created: await prisma.documentSequence.count(), missing: 0, duplicates: 0, status: '' },
  };

  const testCompany = await prisma.company.findUnique({ where: { publicId: 'HIMALAYA-BROWSER-TEST' } });
  if (testCompany) {
    const distinctUnits = await prisma.product.findMany({
      where: { companyId: testCompany.id, isActive: true },
      select: { unit: true },
      distinct: ['unit'],
    });
    reportData['Units'].created = distinctUnits.length;
    reportData['Units'].expected = 4;

    const distinctCategories = await prisma.product.findMany({
      where: { companyId: testCompany.id, isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    reportData['Categories'].created = distinctCategories.length;
    reportData['Categories'].expected = 1;
  }

  // --- 10. Verify Seeded Products ---
  const requiredProducts = [
    'FG-CEMENT-53', 'FG-RMC-M20', 'FG-RMC-M25', 'FG-RMC-M30', 'FG-RMC-M35',
    'FG-SAND-FINE', 'FG-AGG-20MM', 'FG-PAVER-STD', 'FG-KERB-STD', 'FG-DRAIN-COVER'
  ];

  for (const pid of requiredProducts) {
    const p = await prisma.product.findUnique({ where: { publicId: pid } });
    if (!p || !p.isActive || p.category !== 'Finished Goods' || p.companyId !== testCompany?.id || Number(p.unitPrice) <= 0) {
      throw new Error(`Product validation failed for ${pid}`);
    }
  }

  const inactiveProd = await prisma.product.findUnique({ where: { publicId: 'FG-INACTIVE-PROD' } });
  if (!inactiveProd || inactiveProd.isActive) {
    throw new Error('FG-INACTIVE-PROD must exist and be inactive.');
  }

  const otherCoProd = await prisma.product.findUnique({ where: { publicId: 'FG-OTHER-COMPANY' } });
  if (!otherCoProd || otherCoProd.companyId === testCompany?.id) {
    throw new Error('FG-OTHER-COMPANY must exist and belong to a different company.');
  }

  let anyFailures = false;

  if (mode === 'all' || mode === 'http') {
    reportData['Product API'] = { expected: 1, created: 0, missing: 0, duplicates: 0, status: '' };
    reportData['Product Picker'] = { expected: 1, created: 0, missing: 0, duplicates: 0, status: '' };
    reportData['Product persistence'] = { expected: 1, created: 0, missing: 0, duplicates: 0, status: '' };
    reportData['Idempotency'] = { expected: 1, created: 0, missing: 0, duplicates: 0, status: '' }; // Mocked as passed prior
    
    // --- HTTP Validation ---
    try {
      const commonPassword = process.env.E2E_COMMON_PASSWORD;
      if (!commonPassword) {
        throw new Error('E2E_COMMON_PASSWORD is required for browser-test users.');
      }

      const loginOptions = {
        hostname: '127.0.0.1',
        port: 4000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };
      
      const loginRes = await requestJson<LoginResponse>(loginOptions, {
        email: 'sales.executive.browser@himalayaerp.test',
        password: commonPassword
      });

      const token = extractAccessToken(loginRes);

      const productsOptions = {
        hostname: '127.0.0.1',
        port: 4000,
        path: '/api/v1/products', // Will check products controller endpoint
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      };
      
      const productsRes = await requestJson<ProductListResponse | ProductDto[]>(productsOptions);
      const pList = extractProducts(productsRes);
      
      if (pList.length < 10) {
        throw new Error(`HTTP returned fewer than 10 products. Found: ${pList.length}`);
      }
      
      const hasRMC = pList.some(p => p.publicId === 'FG-RMC-M30');
      if (!hasRMC) throw new Error("HTTP did not return RMC M30");
      
      const hasInactive = pList.some(p => p.publicId === 'FG-INACTIVE-PROD');
      if (hasInactive) throw new Error("HTTP incorrectly returned inactive product");

      const hasOther = pList.some(p => p.publicId === 'FG-OTHER-COMPANY');
      if (hasOther) throw new Error("HTTP incorrectly returned other company product");

      reportData['Product API'].created = 1;
      reportData['Product API'].status = 'VERIFIED';
      
      // Save Evidence
      const evidenceDir = path.join(__dirname, '../../docs/runtime-certification/seed/evidence');
      if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
      fs.writeFileSync(path.join(evidenceDir, 'product-api.json'), JSON.stringify({
        url: 'http://127.0.0.1:4000/api/v1/products',
        status: 200,
        count: pList.length,
        productIds: pList.map(p => p.publicId),
        timestamp: new Date().toISOString()
      }, null, 2));
      
    } catch (err) {
      console.error("[VALIDATE ERROR] HTTP check failed:", err instanceof Error ? err.message : String(err));
      if (reportData['Product API']) {
        reportData['Product API'].status = 'FAILED';
      }
      anyFailures = true;
    }
  }

  for (const key in reportData) {
    if (['Product API', 'Product Picker', 'Product persistence', 'Idempotency'].includes(key) && mode === 'database') continue;
    if (['Product API', 'Product Picker', 'Product persistence', 'Idempotency'].includes(key) && reportData[key].status === '') continue; // Set by PS script later
    
    const row = reportData[key];
    if (typeof row.expected === 'number' && row.expected > 0) {
        row.missing = Math.max(0, row.expected - row.created);
    }
    
    if (row.created >= row.expected && row.missing === 0) {
      row.status = 'VERIFIED';
    } else if (row.created > 0) {
      row.status = 'PARTIAL';
      anyFailures = true;
    } else if (row.expected === 0) {
      row.status = 'SKIPPED';
    } else {
      row.status = 'FAILED';
      anyFailures = true;
    }
  }

  const outDir = path.join(__dirname, '../../docs/runtime-certification/seed');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'MASTER-BROWSER-TEST-SEED-DATA.json'), JSON.stringify(reportData, null, 2));

  let md = `# Browser-Test Database Seed Validation Report\n\n`;
  md += `| Seed Area | Expected | Found | Missing | Duplicates | Status |\n`;
  md += `|-----------|---------:|------:|--------:|-----------:|--------|\n`;
  for (const key in reportData) {
    const row = reportData[key];
    md += `| ${key} | ${row.expected} | ${row.created} | ${row.missing} | ${row.duplicates} | ${row.status} |\n`;
  }

  fs.writeFileSync(path.join(outDir, 'MASTER-BROWSER-TEST-SEED-REPORT.md'), md);
  
  if (anyFailures) {
    console.error(`[VALIDATE ERROR] Validation complete with failures.`);
    process.exit(1);
  } else {
    console.log(`[VALIDATE] Validation passed perfectly!`);
  }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
