const http = require('http');

const BACKEND_URL = 'http://127.0.0.1:4000/api/v1';

async function request(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  const method = options.method || 'GET';
  const headers = Object.assign({}, options.headers);
  let bodyData = null;
  if (options.body) {
    bodyData = JSON.stringify(options.body);
    headers['content-type'] = 'application/json';
    headers['content-length'] = Buffer.byteLength(bodyData);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function login(email, password = 'password123') {
  const res = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data?.data?.accessToken || res.data?.accessToken || res.data?.token;
}

async function main() {
  console.log('\n===============================================================');
  console.log(' MOCK DOCKER API TESTING SUITE (http://127.0.0.1:4000/api/v1)');
  console.log('===============================================================\n');

  let allPassed = true;

  try {
    // 1. Login as SuperSales 1
    console.log('--- 1. AUTHENTICATING AS SUPERSALES 1 ---');
    const ss1Token = await login('supersales1@himalayaerp.com');
    console.log(`  [PASS] SuperSales 1 authenticated successfully. Token: ${ss1Token?.slice(0, 20)}...\n`);

    // 2. Query Leads as SuperSales 1
    console.log('--- 2. LIST LEADS AS SUPERSALES 1 ---');
    const ss1LeadsRes = await request('/crm/leads', {
      headers: { authorization: `Bearer ${ss1Token}`, 'x-company-id': '920df2d1-76ab-4acb-adee-8081544a1c92' },
    });

    const ss1Leads = Array.isArray(ss1LeadsRes.data) ? ss1LeadsRes.data : (ss1LeadsRes.data?.data || []);
    console.log(`  SuperSales 1 lead count returned: ${ss1Leads.length}`);
    if (ss1Leads.length === 0) {
      console.log('  [PASS] SuperSales 1 lead list is completely fresh (0 leads).\n');
    } else {
      console.error(`  [FAIL] SuperSales 1 leaked data! Found ${ss1Leads.length} leads.`);
      allPassed = false;
    }

    // 3. Create Mock Lead under SuperSales 1
    console.log('--- 3. CREATING MOCK LEAD AS SUPERSALES 1 ---');
    const createRes = await request('/crm/leads', {
      method: 'POST',
      headers: { authorization: `Bearer ${ss1Token}`, 'x-company-id': '920df2d1-76ab-4acb-adee-8081544a1c92' },
      body: {
        companyName: 'Docker Mock Client SS1',
        contactPerson: 'SS1 Mock Manager',
        email: 'ss1mock@test.com',
        phone: '9888777666',
        source: 'WEBSITE',
        productInterest: 'Polymer',
      },
    });

    console.log('  createRes:', JSON.stringify(createRes.data));
    const createdLeadObj = createRes.data?.data?.lead || createRes.data?.data || createRes.data?.lead || createRes.data;
    const createdLeadId = createdLeadObj?.id;
    console.log(`  Created lead ID: ${createdLeadId} for SuperSales 1\n`);

    // 4. Login as SuperSales 2
    console.log('--- 4. AUTHENTICATING AS SUPERSALES 2 ---');
    const ss2Token = await login('supersales2@himalayaerp.com');
    console.log('  [PASS] SuperSales 2 authenticated successfully.\n');

    // 5. Query Leads as SuperSales 2
    console.log('--- 5. LIST LEADS AS SUPERSALES 2 ---');
    const ss2LeadsRes = await request('/crm/leads', {
      headers: { authorization: `Bearer ${ss2Token}`, 'x-company-id': '920df2d1-76ab-4acb-adee-8081544a1c92' },
    });

    const ss2Leads = Array.isArray(ss2LeadsRes.data) ? ss2LeadsRes.data : (ss2LeadsRes.data?.data || []);
    const seesSS1Lead = ss2Leads.some((l) => l.id === createdLeadId);
    console.log(`  SuperSales 2 lead count returned: ${ss2Leads.length}`);

    if (!seesSS1Lead) {
      console.log('  [PASS] SuperSales 2 sees ONLY its own data; SuperSales 1 lead is 100% INVISIBLE.\n');
    } else {
      console.error('  [FAIL] Data leak! SuperSales 2 sees SuperSales 1 lead!');
      allPassed = false;
    }

    // 6. Cross-User Direct-ID Security Test (SS2 -> SS1 Lead)
    console.log('--- 6. CROSS-USER DIRECT-ID SECURITY TEST (SS2 -> SS1 LEAD) ---');
    const directGetRes = await request(`/crm/leads/${createdLeadId}`, {
      headers: { authorization: `Bearer ${ss2Token}`, 'x-company-id': '920df2d1-76ab-4acb-adee-8081544a1c92' },
    });

    console.log(`  Cross-user GET response status: ${directGetRes.status}`);
    if (directGetRes.status === 404) {
      console.log('  [PASS] Cross-user GET request returned 404 Not Found.\n');
    } else {
      console.error(`  [FAIL] Cross-user GET returned status: ${directGetRes.status}`);
      allPassed = false;
    }

    // 7. Login as Sales Executive 1
    console.log('--- 7. AUTHENTICATING AS SALES EXECUTIVE 1 ---');
    const s1Token = await login('sales1@himalayaerp.com');
    console.log('  [PASS] Sales Executive 1 authenticated successfully.\n');

    // 8. Query Leads as Sales Executive 1
    console.log('--- 8. LIST LEADS AS SALES EXECUTIVE 1 ---');
    const s1LeadsRes = await request('/crm/leads', {
      headers: { authorization: `Bearer ${s1Token}`, 'x-company-id': '920df2d1-76ab-4acb-adee-8081544a1c92' },
    });

    const s1Leads = Array.isArray(s1LeadsRes.data) ? s1LeadsRes.data : (s1LeadsRes.data?.data || []);
    console.log(`  Sales Executive 1 lead count returned: ${s1Leads.length}`);
    const s1SeesSS1Lead = s1Leads.some((l) => l.id === createdLeadId);

    if (!s1SeesSS1Lead) {
      console.log('  [PASS] Sales Executive 1 sees ONLY its own data; SuperSales 1 lead is 100% INVISIBLE.\n');
    } else {
      console.error('  [FAIL] Data leak! Sales Executive 1 sees SuperSales 1 lead!');
      allPassed = false;
    }

    // 9. Clean up created lead
    console.log('--- 9. CLEANING UP DOCKER MOCK LEAD ---');
    const deleteRes = await request(`/crm/leads/${createdLeadId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${ss1Token}`, 'x-company-id': '920df2d1-76ab-4acb-adee-8081544a1c92' },
    });
    console.log(`  Cleaned up mock lead ID: ${createdLeadId}\n`);

    console.log('===============================================================');
    if (allPassed) {
      console.log(' ALL DOCKER MOCK API TESTS PASSED SUCCESSFULLY! ');
    } else {
      console.error(' SOME DOCKER MOCK API TESTS FAILED! ');
    }
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Error during Docker API testing:', err.message);
  }
}

main();
