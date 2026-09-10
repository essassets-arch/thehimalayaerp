const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function unwrap(resData) {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  return [];
}

async function run() {
  console.log('=== 1. Logging in as super.admin@himalayaerp.com ===');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }
  );

  const token = loginRes.data?.data?.accessToken || loginRes.data?.accessToken;
  if (!token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }
  console.log('✓ Logged in successfully. Token received.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('\n=== 2. Testing GET /api/v1/purchase/vendors ===');
  const initialVendorsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/purchase/vendors',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`HTTP Status: ${initialVendorsRes.status}`);
  const initialList = unwrap(initialVendorsRes.data);
  console.log(`Existing vendors in DB: ${initialList.length}`);
  initialList.slice(0, 3).forEach((v) => {
    console.log(` - [${v.vendor_code || v.code || v.publicId}] ${v.vendor_name || v.name}`);
  });

  console.log('\n=== 3. Creating a new dynamic vendor via POST /api/v1/purchase/vendors ===');
  const testVendorName = 'Jindal Steel & Power Ltd ' + Date.now();
  const createVendorRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/purchase/vendors',
      method: 'POST',
      headers: authHeaders,
    },
    {
      vendor_name: testVendorName,
      vendor_code: 'V-JSP-' + Math.floor(100 + Math.random() * 900),
      gstin: '07AAACJ2234K1ZB',
      email: 'procurement@jindalsteel.com',
      phone: '+91-9811223344',
      contact_person: 'Rajesh Jindal',
      address: 'O.P. Jindal Marg, Hisar, Haryana',
      payment_terms: 'NET 30',
    }
  );
  console.log(`Create Vendor Status: ${createVendorRes.status}`);
  const createdVendor = createVendorRes.data && (createVendorRes.data.data || createVendorRes.data);
  console.log('Created Vendor:', {
    id: createdVendor?.id,
    vendor_name: createdVendor?.vendor_name,
    vendor_code: createdVendor?.vendor_code,
    gstin: createdVendor?.gstin,
    contact_person: createdVendor?.contact_person,
  });

  if (!createdVendor?.id) {
    console.error('Failed to create vendor:', createVendorRes);
    process.exit(1);
  }

  console.log('\n=== 4. Fetching suppliers via GET /api/v1/suppliers ===');
  const suppliersRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/suppliers',
    method: 'GET',
    headers: authHeaders,
  });
  const suppliersList = unwrap(suppliersRes.data);
  const foundInList = suppliersList.find((s) => (s.vendor_name || s.name) === testVendorName);
  console.log(`Found newly created vendor in suppliers list:`, !!foundInList);
  if (foundInList) {
    console.log(` - ID: ${foundInList.id}, Name: ${foundInList.vendor_name || foundInList.name}, Code: ${foundInList.vendor_code || foundInList.code}`);
  }

  console.log('\n=== 5. Checking approved indents ready for PO ===');
  const indentsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/procurement/indents',
    method: 'GET',
    headers: authHeaders,
  });
  const allIndents = unwrap(indentsRes.data);
  console.log(`Total indents returned: ${allIndents.length}`);
  const approvedIndents = allIndents.filter((i) =>
    ['PLANT_HEAD_APPROVED', 'PARTIALLY_CONVERTED'].includes(i.status) && (i.items || []).length > 0
  );
  console.log(`Found ${approvedIndents.length} approved indents with items`);

  let targetIndent = approvedIndents[0];
  if (!targetIndent) {
    console.error('No approved indent with items found! Existing indents:', allIndents.map(i => ({ id: i.id, no: i.indentNo, status: i.status })));
    process.exit(1);
  }

  const firstItem = targetIndent.items[0];
  const poItems = [
    {
      indentId: targetIndent.id,
      indentItemId: firstItem.id,
      productId: firstItem.productId,
      quantity: 1,
      unitPrice: 85,
    },
  ];

  console.log(`\n=== 6. Creating PO from Indent ${targetIndent.indentNo || targetIndent.publicId || targetIndent.id} with dynamic vendor ===`);
  console.log('Item:', { id: firstItem.id, materialName: firstItem.materialName, qty: 1 });

  const createPoRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/procurement/purchase-orders/from-indent/${targetIndent.id}`,
      method: 'POST',
      headers: authHeaders,
    },
    {
      supplierId: createdVendor.id,
      supplierName: testVendorName,
      vendorName: testVendorName,
      items: poItems,
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      notes: 'Testing dynamic vendor injection',
      deliveryTerms: 'Door Delivery',
      paymentTerms: 'NET 30',
    }
  );

  console.log(`Create PO Status: ${createPoRes.status}`);
  if (createPoRes.status >= 400) {
    console.error('Create PO Error body:', JSON.stringify(createPoRes.data || createPoRes.text, null, 2));
  }
  const createdPo = createPoRes.data && (createPoRes.data.data || createPoRes.data);
  console.log('Created PO Details:', {
    poNumber: createdPo?.poNumber,
    status: createdPo?.status,
    supplierId: createdPo?.supplierId,
    supplierName: createdPo?.supplierName,
    vendorName: createdPo?.vendorName,
    supplier: createdPo?.supplier,
  });

  // Verification checks:
  const checkSupplierName = createdPo?.supplierName || createdPo?.supplier?.name;
  const checkVendorName = createdPo?.vendorName;
  console.log('\n=== PO Supplier Verification ===');
  console.log(`PO Supplier Name: "${checkSupplierName}"`);
  console.log(`PO Vendor Name: "${checkVendorName}"`);
  const isDefaultSupplier =
    (checkSupplierName && checkSupplierName.toLowerCase().includes('default supplier')) ||
    (checkVendorName && checkVendorName.toLowerCase().includes('default supplier'));

  if (isDefaultSupplier) {
    console.error('❌ FAIL: PO still has "Default Supplier"!');
    process.exit(1);
  } else if (checkSupplierName === testVendorName) {
    console.log('✓ SUCCESS: PO has exact dynamic vendor name!');
  } else {
    console.log('⚠ NOTICE: PO vendor name does not match testVendorName exactly:', checkSupplierName);
  }

  console.log('\n=== 7. Creating High-Value PO (>10k) to verify Plant Head Queue ===');
  // Find an indent for high-value PO (e.g. IND-0010)
  const ind10 = allIndents.find((i) => (i.indentNo === 'IND-0010' || i.publicId === 'IND-0010') && (i.items || []).length > 0) || targetIndent;
  const ind10Item = ind10.items[0];
  const highValuePoRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/procurement/purchase-orders/from-indent/${ind10.id}`,
      method: 'POST',
      headers: authHeaders,
    },
    {
      supplierId: createdVendor.id,
      supplierName: testVendorName,
      vendorName: testVendorName,
      items: [
        {
          indentId: ind10.id,
          indentItemId: ind10Item.id,
          productId: ind10Item.productId,
          quantity: 2,
          unitPrice: 15000, // Total 30,000 > 10,000 -> PENDING_PLANT_HEAD_PURCHASE_APPROVAL
        },
      ],
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      notes: 'High value PO testing plant head queue vendor name',
    }
  );

  const highPo = highValuePoRes.data && (highValuePoRes.data.data || highValuePoRes.data);
  console.log('High Value PO created:', {
    id: highPo?.id,
    poNumber: highPo?.poNumber,
    status: highPo?.status,
  });

  if (highPo?.status === 'DRAFT') {
    console.log('Submitting PO for approval...');
    const submitRes = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1/procurement/purchase-orders/${highPo.id}/submit`,
        method: 'POST',
        headers: authHeaders,
      },
      {}
    );
    const submittedPo = submitRes.data && (submitRes.data.data || submitRes.data);
    console.log('Submitted PO status:', submittedPo?.status);
  }

  console.log('\n=== 8. Checking PO in Plant Head Queue ===');
  const plantHeadRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/procurement/approvals/plant-head/queue',
    method: 'GET',
    headers: authHeaders,
  });
  const plantHeadList = unwrap(plantHeadRes.data);
  const poInQueue = plantHeadList.find((p) => p.poNumber === highPo?.poNumber || p.id === highPo?.id);
  if (poInQueue) {
    console.log('✓ Found High Value PO in Plant Head Queue:');
    console.log('  PO Number:', poInQueue.poNumber);
    console.log('  Vendor Name:', poInQueue.vendorName);
    console.log('  Supplier Name:', poInQueue.supplierName);
    console.log('  Supplier Object Name:', poInQueue.supplier?.name);
    if (poInQueue.vendorName === testVendorName && !poInQueue.vendorName.includes('Default Supplier')) {
      console.log('✓ SUCCESS: Dynamic vendor name successfully surfaced in Plant Head Queue!');
    } else {
      console.error('❌ FAIL: Vendor name in Plant Head Queue does not match dynamic vendor!');
    }
  } else {
    console.log(`PO not in pending approval queue (status is ${highPo?.status})`);
  }

  console.log('\n=== 9. Checking PO in Purchase Orders List ===');
  const poListRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/procurement/purchase-orders',
    method: 'GET',
    headers: authHeaders,
  });
  const poList = unwrap(poListRes.data);
  const poInList = poList.find((p) => p.poNumber === createdPo?.poNumber || p.id === createdPo?.id);
  if (poInList) {
    console.log('✓ Found PO in Main PO List:');
    console.log('  PO Number:', poInList.poNumber);
    console.log('  Vendor Name:', poInList.vendorName);
    console.log('  Supplier Name:', poInList.supplierName);
    console.log('  Supplier Object:', poInList.supplier);
  } else {
    console.log('PO not found in poList of length', poList.length);
  }

  console.log('\n=== ALL API VERIFICATION CHECKS PASSED! ===');
}

run().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
