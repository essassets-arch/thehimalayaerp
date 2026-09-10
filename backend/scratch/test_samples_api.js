const http = require('http');

async function testApi() {
  // Login first to get JWT
  const postData = JSON.stringify({
    email: 'sana.r@himalayaerp.com',
    password: 'Himalaya@1234',
  });

  const req = http.request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const token = json.accessToken || json.data?.accessToken;
          console.log('Got token:', Boolean(token));
          fetchSamples(token);
        } catch (e) {
          console.error('Login parse error:', e, body);
        }
      });
    }
  );
  req.write(postData);
  req.end();
}

function fetchSamples(token) {
  const req = http.request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: '/api/v1/samples',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const samples = Array.isArray(json) ? json : json.data || [];
          console.log(`Fetched ${samples.length} sample(s)`);
          const smp = samples.find((s) => s.sampleNumber === 'SMP-2026-0001');
          if (smp) {
            console.log('\n--- SAMPLE DETAILS ---');
            console.log('Sample Number:', smp.sampleNumber);
            console.log('Customer:', smp.customer);
            console.log('Delivery Address:', smp.deliveryAddress);
            console.log('Transport Cost:', smp.transportCost);
            console.log('Is Mixed:', smp.isMixed);
            console.log('D1 Items count:', smp.d1Items?.length, 'D1 Product string:', smp.d1Product, 'D1 Qty:', smp.d1Quantity);
            console.log('D2 Items count:', smp.d2Items?.length, 'D2 Product string:', smp.d2Product, 'D2 Qty:', smp.d2Quantity);
            console.log('\nItem specifications breakdown:');
            for (const it of smp.items) {
              console.log(`  - [${it.dispatchCategory}] ${it.productName}: Qty=${it.quantity}, Color=${it.color}, Size=${it.size}, Capacity=${it.capacity}, Specs=${it.specifications}`);
            }

            // Test findOne endpoint
            fetchOneSample(token, smp.id);
          } else {
            console.log('SMP-2026-0001 not found in list. Available:', samples.map((s) => s.sampleNumber));
          }
        } catch (e) {
          console.error('Samples parse error:', e, body);
        }
      });
    }
  );
  req.end();
}

function fetchOneSample(token, id) {
  const req = http.request(
    {
      hostname: '127.0.0.1',
      port: 4000,
      path: `/api/v1/samples/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        const json = JSON.parse(body);
        const smp = json.data || json;
        console.log('\n--- FIND ONE RESULT ---');
        console.log('ID:', smp.id, 'Number:', smp.sampleNumber);
        console.log('Address:', smp.deliveryAddress || smp.address);
        console.log('Transport Cost:', smp.transportCost);
        console.log('Items Count:', smp.items?.length);
        console.log('Lead Details:', smp.lead?.leadNumber, smp.lead?.companyName, smp.lead?.contactPerson, smp.lead?.phone);
      });
    }
  );
  req.end();
}

testApi();
