const http = require('http');
const { PrismaClient } = require('@prisma/client');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + (url.search || ''),
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function formatContactPhone(rawSalesMobile) {
  const cleanSalesMobile = rawSalesMobile ? String(rawSalesMobile).trim() : '';
  return cleanSalesMobile
    ? (cleanSalesMobile.startsWith('+') ? cleanSalesMobile : `+91 ${cleanSalesMobile}`)
    : '+91 84888 11609';
}

const TEST_MATRIX = [
  { salesUser: 'Sales 1', email: 'sales1@himalayaerp.com', password: 'Himalaya@2026', expectedRaw: '9586040153', expectedDisplay: '+91 9586040153', quoteNum: 'QU/2627/0072' },
  { salesUser: 'Sales 2', email: 'sales2@himalayaerp.com', password: 'Himalaya@2026', expectedRaw: '9998521843', expectedDisplay: '+91 9998521843', quoteNum: 'QT/2627/0266' },
  { salesUser: 'Sales 3', email: 'sales3@himalayaerp.com', password: 'Himalaya@2026', expectedRaw: '9033516047', expectedDisplay: '+91 9033516047', quoteNum: 'QT/2627/0287' },
  { salesUser: 'Sales 4', email: 'sales4@himalayaerp.com', password: 'Himalaya@2026', expectedRaw: '8488811682', expectedDisplay: '+91 8488811682', quoteNum: 'QT/2627/0301' },
  { salesUser: 'Sales 5', email: 'sales5@himalayaerp.com', password: 'Himalaya@2026', expectedRaw: '9033731173', expectedDisplay: '+91 9033731173', quoteNum: 'QT/2627/9905' },
  { salesUser: 'Sales 11', email: 'sales11@himalayaerp.com', password: 'Himalayacc@2025', expectedRaw: '9033516048', expectedDisplay: '+91 9033516048', quoteNum: 'QT/2627/9911' },
  { salesUser: 'Sales 12', email: 'sales12@himalayaerp.com', password: 'Jyoti@2258', expectedRaw: '8488811630', expectedDisplay: '+91 8488811630', quoteNum: 'QT/2627/0312' },
  { salesUser: 'Sales 13', email: 'sales13@himalayaerp.com', password: 'Himalaya@2026', expectedRaw: '8488811619', expectedDisplay: '+91 8488811619', quoteNum: 'QT/2627/9913' },
  { salesUser: 'Sales 14', email: 'sales14@himalayaerp.com', password: 'ARHIMALAYA12', expectedRaw: '9033516046', expectedDisplay: '+91 9033516046', quoteNum: 'QT/2627/9914' },
];

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
    }
  });

  let passCount = 0;
  let failCount = 0;

  try {
    // 1. First test: Super Admin viewing all quotations
    console.log('Logging in as Super Admin to verify universal quotation viewing...');
    const adminLogin = await postJson('http://localhost:4001/api/v1/auth/login', {
      email: 'superadmin@himalayaerp.com',
      password: 'SuperAdmin@hcppl',
    });

    if (!adminLogin.data?.data?.accessToken) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin)}`);
    }
    const adminToken = adminLogin.data.data.accessToken;
    console.log('✓ Super Admin logged in successfully.\n');

    console.log('================================================================================');
    console.log('TEST 1: SUPER ADMIN VIEWING ALL 9 SALES USERS QUOTATIONS (DYNAMIC OWNER PHONE)');
    console.log('================================================================================\n');

    for (const test of TEST_MATRIX) {
      const qRecord = await prisma.quotation.findFirst({
        where: { quotationNumber: test.quoteNum },
        include: {
          salesExecutive: { include: { employee: true } },
          lead: { include: { salesExecutive: { include: { employee: true } } } }
        }
      });

      if (!qRecord) {
        console.error(`❌ [FAIL] Quotation ${test.quoteNum} not found in database!`);
        failCount++;
        continue;
      }

      const apiRes = await getJson(`http://localhost:4001/api/v1/crm/quotations/${qRecord.id}`, adminToken);
      if (apiRes.status !== 200 || !apiRes.data?.data) {
        console.error(`❌ [FAIL] API GET /crm/quotations/${qRecord.id} failed with status ${apiRes.status}:`, apiRes.data || apiRes.raw);
        failCount++;
        continue;
      }

      const returnedQuote = apiRes.data.data;
      const returnedMobile = returnedQuote.salesExecutiveMobile;
      const displayPhone = formatContactPhone(returnedMobile);

      console.log(`[SUPER ADMIN VIEWING] ${test.salesUser} (${test.email})`);
      console.log(`  Quotation: ${test.quoteNum} (ID: ${qRecord.id})`);
      console.log(`  API salesExecutiveMobile: '${returnedMobile}' (Expected: '${test.expectedRaw}')`);
      console.log(`  Resolved Display Phone:   '${displayPhone}' (Expected: '${test.expectedDisplay}')`);

      if (returnedMobile === test.expectedRaw && displayPhone === test.expectedDisplay) {
        console.log(`  ✓ PASS: Super Admin sees owner's isolated mobile ${test.expectedDisplay} (NOT admin/company number)\n`);
        passCount++;
      } else {
        console.error(`  ❌ FAIL: Expected raw '${test.expectedRaw}' / display '${test.expectedDisplay}', got '${returnedMobile}' / '${displayPhone}'\n`);
        failCount++;
      }
    }

    console.log('================================================================================');
    console.log('TEST 2: EACH SALES USER LOGGING IN AND VIEWING THEIR OWN QUOTATION');
    console.log('================================================================================\n');

    for (const test of TEST_MATRIX) {
      const userLogin = await postJson('http://localhost:4001/api/v1/auth/login', {
        email: test.email,
        password: test.password,
      });

      if (!userLogin.data?.data?.accessToken) {
        console.error(`❌ [FAIL] Login failed for ${test.salesUser} (${test.email}):`, userLogin.data);
        failCount++;
        continue;
      }

      const userToken = userLogin.data.data.accessToken;

      const qRecord = await prisma.quotation.findFirst({
        where: { quotationNumber: test.quoteNum },
      });

      const apiRes = await getJson(`http://localhost:4001/api/v1/crm/quotations/${qRecord.id}`, userToken);
      if (apiRes.status !== 200 || !apiRes.data?.data) {
        console.error(`❌ [FAIL] ${test.salesUser} failed to get quotation ${test.quoteNum}:`, apiRes.data || apiRes.raw);
        failCount++;
        continue;
      }

      const returnedQuote = apiRes.data.data;
      const returnedMobile = returnedQuote.salesExecutiveMobile;
      const displayPhone = formatContactPhone(returnedMobile);

      console.log(`[USER SELF VIEW] ${test.salesUser} logged in:`);
      console.log(`  Quotation: ${test.quoteNum}`);
      console.log(`  salesExecutiveMobile: '${returnedMobile}' (Expected: '${test.expectedRaw}')`);
      console.log(`  Resolved Display Phone: '${displayPhone}' (Expected: '${test.expectedDisplay}')`);

      if (returnedMobile === test.expectedRaw && displayPhone === test.expectedDisplay) {
        console.log(`  ✓ PASS: ${test.salesUser} correctly views isolated phone ${test.expectedDisplay}\n`);
        passCount++;
      } else {
        console.error(`  ❌ FAIL: ${test.salesUser} saw unexpected phone: '${returnedMobile}' / '${displayPhone}'\n`);
        failCount++;
      }
    }

    console.log('================================================================================');
    console.log(`CROSS-USER ISOLATION & RBAC VERIFICATION`);
    console.log('================================================================================');

    // Sales 2 logs in
    const loginSales2 = await postJson('http://localhost:4001/api/v1/auth/login', {
      email: 'sales2@himalayaerp.com',
      password: 'Himalaya@2026',
    });

    if (loginSales2.data?.data?.accessToken) {
      const tokenSales2 = loginSales2.data.data.accessToken;
      console.log('✓ Sales 2 logged in.');

      // 1. RBAC Check: Sales 2 attempts to fetch Sales 1's quotation QU/2627/0072
      const q0072 = await prisma.quotation.findFirst({ where: { quotationNumber: 'QU/2627/0072' } });
      const res0072 = await getJson(`http://localhost:4001/api/v1/crm/quotations/${q0072.id}`, tokenSales2);

      console.log(`  Sales 2 attempts to fetch Sales 1 quotation QU/2627/0072: HTTP Status ${res0072.status}`);
      if (res0072.status === 404 || res0072.status === 403) {
        console.log('  ✓ PASS: RBAC isolation correctly prevents Sales 2 from accessing Sales 1 quotation!\n');
        passCount++;
      } else {
        console.error('  ❌ FAIL: Sales 2 was able to view Sales 1 quotation without permission!\n');
        failCount++;
      }

      // 2. Cross-user viewing check by Super Admin (Viewer is NOT Owner):
      // Super Admin views Sales 1 quotation: must get Sales 1 phone
      const adminRes0072 = await getJson(`http://localhost:4001/api/v1/crm/quotations/${q0072.id}`, adminToken);
      const phone0072 = adminRes0072.data?.data?.salesExecutiveMobile;
      const display0072 = formatContactPhone(phone0072);
      console.log(`  Super Admin views Sales 1 quotation QU/2627/0072:`);
      console.log(`  Returned Mobile: ${phone0072} -> ${display0072}`);
      if (phone0072 === '9586040153' && display0072 === '+91 9586040153') {
        console.log('  ✓ PASS: Preserves Sales 1 owner phone (9586040153) when viewed by another user!\n');
        passCount++;
      } else {
        console.error('  ❌ FAIL: Did not preserve Sales 1 owner phone!\n');
        failCount++;
      }

      // Super Admin views Sales 2 quotation: must get Sales 2 phone
      const qSales2 = await prisma.quotation.findFirst({ where: { quotationNumber: 'QT/2627/0266' } });
      const adminResSales2 = await getJson(`http://localhost:4001/api/v1/crm/quotations/${qSales2.id}`, adminToken);
      const phoneSales2 = adminResSales2.data?.data?.salesExecutiveMobile;
      const displaySales2 = formatContactPhone(phoneSales2);
      console.log(`  Super Admin views Sales 2 quotation QT/2627/0266:`);
      console.log(`  Returned Mobile: ${phoneSales2} -> ${displaySales2}`);
      if (phoneSales2 === '9998521843' && displaySales2 === '+91 9998521843') {
        console.log('  ✓ PASS: Preserves Sales 2 owner phone (9998521843) when viewed by another user!\n');
        passCount++;
      } else {
        console.error('  ❌ FAIL: Did not preserve Sales 2 owner phone!\n');
        failCount++;
      }
    }

    console.log('================================================================================');
    console.log('FALLBACK VERIFICATION (Missing Mobile -> Fallback +91 84888 11609)');
    console.log('================================================================================');
    const fallbackTestNull = formatContactPhone(null);
    const fallbackTestEmpty = formatContactPhone('');
    console.log(`  formatContactPhone(null): '${fallbackTestNull}'`);
    console.log(`  formatContactPhone(''):   '${fallbackTestEmpty}'`);
    if (fallbackTestNull === '+91 84888 11609' && fallbackTestEmpty === '+91 84888 11609') {
      console.log('  ✓ PASS: Correct fallback to +91 84888 11609 when mobile is missing.\n');
      passCount++;
    } else {
      console.error('  ❌ FAIL: Fallback did not return +91 84888 11609!\n');
      failCount++;
    }

    console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED.`);
    if (failCount > 0) {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
