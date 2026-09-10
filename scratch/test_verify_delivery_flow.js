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

function unwrapPos(poRes) {
  let pos = poRes.data;
  if (pos && typeof pos === 'object') {
    if (Array.isArray(pos)) return pos;
    if (Array.isArray(pos.data)) return pos.data;
    if (Array.isArray(pos.data?.data)) return pos.data.data;
    if (Array.isArray(pos.items)) return pos.items;
  }
  return [];
}

async function login(port, email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  if (!res.data?.data?.accessToken && !res.data?.accessToken) {
    throw new Error(`Login failed on port ${port}: ` + JSON.stringify(res.data));
  }
  return res.data?.data?.accessToken || res.data?.accessToken;
}

async function runTestOnPort(port, name) {
  console.log(`\n======================================================`);
  console.log(`  RUNNING VERIFY DELIVERY & INVENTORY TEST ON ${name} (Port ${port})`);
  console.log(`======================================================\n`);

  const token = await login(port, 'sana.r@himalayaerp.com', 'Himalaya@1234');
  console.log(`✓ 1. Logged in as Store user on port ${port}`);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch PO-REJ-581697
  const poRes = await request({
    hostname: 'localhost',
    port,
    path: '/api/v1/procurement/purchase-orders',
    method: 'GET',
    headers: authHeaders,
  });

  const pos = unwrapPos(poRes);
  if (!Array.isArray(pos) || pos.length === 0) {
    console.log('poRes:', JSON.stringify(poRes.data));
    throw new Error('pos is empty or not an array');
  }
  const po = pos.find((p) => (p.poNumber || p.poNo) === 'PO-REJ-581697');
  if (!po) {
    throw new Error(`PO-REJ-581697 not found on port ${port}`);
  }

  const item = (po.items || [])[0];
  const ordered = Number(item.quantity);
  const alreadyReceived = Number(item.receivedQuantity || 0);
  const remaining = ordered - alreadyReceived;

  console.log(`✓ 2. Found PO: ${po.poNumber}`);
  console.log(`     - Item: ${item.materialName || 'handle'}`);
  console.log(`     - Ordered: ${ordered} PCS`);
  console.log(`     - Received: ${alreadyReceived} PCS`);
  console.log(`     - Remaining: ${remaining} PCS`);

  if (ordered !== 10 || remaining !== 10) {
    console.warn(`[Warning] Initial PO ordered=${ordered}, remaining=${remaining} (Expected: 10/10)`);
  }

  // 2. Fetch Initial Material Log & Baseline Stock
  const initialLogRes = await request({
    hostname: 'localhost',
    port,
    path: `/api/v1/inventory/material-log/handle`,
    method: 'GET',
    headers: authHeaders,
  });

  const initialLog = initialLogRes.data?.data || initialLogRes.data || {};
  const baselineStock = Number(initialLog.currentStock || 0);
  console.log(`✓ 3. Initial Baseline Stock for 'handle': ${baselineStock} PCS`);
  console.log(`     - Initial Log Movements: ${(initialLog.history || []).length}`);

  // 3. Test Over-Delivery Prevention (Attempting 11 PCS when remaining is 10)
  console.log(`\n--- Test A: Over-Delivery Prevention (Attempting 12 PCS when remaining is 10) ---`);
  const overDeliveryPayload = {
    purchaseOrderId: po.id,
    warehouseId: po.warehouseId,
    challanNumber: 'CH-OVER-01',
    vehicleNumber: 'MH-12-XX-9999',
    remarks: 'Attempting over-delivery',
    items: [
      {
        purchaseOrderItemId: item.id,
        productId: item.productId,
        deliveredQuantity: 12,
        receivedQuantity: 12,
        acceptedQuantity: 12,
        rejectedQuantity: 0,
      },
    ],
  };

  const overRes = await request(
    {
      hostname: 'localhost',
      port,
      path: `/api/v1/procurement/store/deliveries/verify`,
      method: 'POST',
      headers: authHeaders,
    },
    overDeliveryPayload
  );

  console.log(`     - Response Status: ${overRes.status}`);
  console.log(`     - Response Body:`, JSON.stringify(overRes.data));
  const errA = overRes.data?.error?.message || overRes.data?.message || '';
  if (overRes.status === 400 && errA.includes('exceeds remaining unfulfilled quantity')) {
    console.log(`✓ Test A PASSED: Over-delivery rejected with 400 Bad Request: "${errA}".`);
  } else {
    throw new Error(`Test A FAILED: Expected 400 Bad Request rejecting over-delivery, got ${overRes.status}`);
  }

  // Verify stock did not change
  const logAfterOver = await request({
    hostname: 'localhost',
    port,
    path: `/api/v1/inventory/material-log/handle`,
    method: 'GET',
    headers: authHeaders,
  });
  const stockAfterOver = Number((logAfterOver.data?.data || logAfterOver.data || {}).currentStock || 0);
  if (stockAfterOver !== baselineStock) {
    throw new Error(`Stock corrupted by rejected over-delivery! Expected ${baselineStock}, got ${stockAfterOver}`);
  }
  console.log(`✓ Stock safely unchanged at ${stockAfterOver} PCS.`);

  // 4. First Partial Delivery: Delivered Qty = 5 PCS
  console.log(`\n--- Test B: First Partial Delivery (Delivered Qty = 5 PCS) ---`);
  const firstDeliveryPayload = {
    purchaseOrderId: po.id,
    warehouseId: po.warehouseId,
    challanNumber: 'DC-98421',
    vehicleNumber: 'MH-12-AB-1234',
    remarks: 'Gate dock inspection passed - partial delivery 1 of 2',
    items: [
      {
        purchaseOrderItemId: item.id,
        productId: item.productId,
        deliveredQuantity: 5,
        receivedQuantity: 5,
        acceptedQuantity: 5,
        rejectedQuantity: 0,
        inspectionRemarks: 'Quality approved 5 PCS',
      },
    ],
  };

  const firstDeliveryRes = await request(
    {
      hostname: 'localhost',
      port,
      path: `/api/v1/procurement/store/deliveries/verify`,
      method: 'POST',
      headers: authHeaders,
    },
    firstDeliveryPayload
  );

  console.log(`     - First Delivery Response Status: ${firstDeliveryRes.status}`);
  if (firstDeliveryRes.status !== 200 && firstDeliveryRes.status !== 201) {
    throw new Error(`First delivery failed: ` + JSON.stringify(firstDeliveryRes.data));
  }

  const grn1 = firstDeliveryRes.data?.delivery || firstDeliveryRes.data?.data?.delivery || firstDeliveryRes.data;
  const grn1No = grn1?.grnNumber || grn1?.publicId;
  console.log(`✓ GRN #1 Created: ${grn1No}`);

  // Check PO status & remaining
  const poAfterFirst = await request({
    hostname: 'localhost',
    port,
    path: '/api/v1/procurement/purchase-orders',
    method: 'GET',
    headers: authHeaders,
  });
  const pos1 = unwrapPos(poAfterFirst);
  const po1 = pos1.find((p) => (p.poNumber || p.poNo) === 'PO-REJ-581697');
  const item1 = (po1.items || [])[0];
  const rem1 = Number(item1.quantity) - Number(item1.receivedQuantity);
  console.log(`     - PO Remaining: ${rem1} PCS (Received: ${item1.receivedQuantity}/${item1.quantity})`);
  if (rem1 !== 5) {
    throw new Error(`Expected PO remaining = 5 PCS, got ${rem1}`);
  }

  // Check Raw Inventory Stock & Log after first delivery
  const logAfterFirst = await request({
    hostname: 'localhost',
    port,
    path: `/api/v1/inventory/material-log/handle`,
    method: 'GET',
    headers: authHeaders,
  });
  const logData1 = logAfterFirst.data?.data || logAfterFirst.data || {};
  const stock1 = Number(logData1.currentStock || 0);
  console.log(`     - Raw Inventory Stock: ${stock1} PCS (Baseline ${baselineStock} + 5 = ${baselineStock + 5})`);
  if (stock1 !== baselineStock + 5) {
    throw new Error(`Expected stock = ${baselineStock + 5} PCS, got ${stock1}`);
  }

  const history1 = logData1.history || [];
  console.log(`     - Total Movements in Log: ${history1.length}`);
  const top1 = history1[0];
  console.log(`     - Top Log Entry: Type=${top1.type}, Qty=${top1.quantityFormatted}, Balance=${top1.balanceFormatted}, Source=${top1.source}, PO=${top1.poNumber}, GRN=${top1.grnNumber}, Challan=${top1.details?.deliveryChallanNumber}`);

  if (top1.type !== 'IN' || top1.quantity !== 5 || top1.source !== 'Verify Delivery' || top1.poNumber !== 'PO-REJ-581697') {
    throw new Error(`Log entry mismatch: ` + JSON.stringify(top1));
  }
  console.log(`✓ Test B PASSED: Raw Inventory exactly +5 PCS, PO remaining = 5 PCS, Log = IN +5 PCS.`);

  // 5. Test Over-Delivery on remaining 5 (Attempting 6 PCS)
  console.log(`\n--- Test C: Over-Delivery on remaining 5 PCS (Attempting 6 PCS) ---`);
  const overRemainingPayload = {
    purchaseOrderId: po.id,
    warehouseId: po.warehouseId,
    challanNumber: 'CH-OVER-02',
    vehicleNumber: 'MH-12-XX-9999',
    remarks: 'Attempting 6 when remaining is 5',
    items: [
      {
        purchaseOrderItemId: item.id,
        productId: item.productId,
        deliveredQuantity: 6,
        receivedQuantity: 6,
        acceptedQuantity: 6,
        rejectedQuantity: 0,
      },
    ],
  };

  const overRemRes = await request(
    {
      hostname: 'localhost',
      port,
      path: `/api/v1/procurement/store/deliveries/verify`,
      method: 'POST',
      headers: authHeaders,
    },
    overRemainingPayload
  );

  console.log(`     - Over-remaining Response Status: ${overRemRes.status}`);
  const errC = overRemRes.data?.error?.message || overRemRes.data?.message || '';
  if (overRemRes.status === 400 && errC.includes('exceeds remaining unfulfilled quantity')) {
    console.log(`✓ Test C PASSED: 6 PCS delivery rejected because remaining is 5 PCS: "${errC}".`);
  } else {
    throw new Error(`Test C FAILED: Expected 400 Bad Request, got ${overRemRes.status}`);
  }

  // 6. Second Partial Delivery: Remaining 5 PCS
  console.log(`\n--- Test D: Second Partial Delivery (Delivering final 5 PCS) ---`);
  const secondDeliveryPayload = {
    purchaseOrderId: po.id,
    warehouseId: po.warehouseId,
    challanNumber: 'DC-98422',
    vehicleNumber: 'MH-12-CD-5678',
    remarks: 'Final delivery received at gate - order complete',
    items: [
      {
        purchaseOrderItemId: item.id,
        productId: item.productId,
        deliveredQuantity: 5,
        receivedQuantity: 5,
        acceptedQuantity: 5,
        rejectedQuantity: 0,
        inspectionRemarks: 'All 5 PCS verified in good condition',
      },
    ],
  };

  const secondDeliveryRes = await request(
    {
      hostname: 'localhost',
      port,
      path: `/api/v1/procurement/store/deliveries/verify`,
      method: 'POST',
      headers: authHeaders,
    },
    secondDeliveryPayload
  );

  console.log(`     - Second Delivery Response Status: ${secondDeliveryRes.status}`);
  if (secondDeliveryRes.status !== 200 && secondDeliveryRes.status !== 201) {
    throw new Error(`Second delivery failed: ` + JSON.stringify(secondDeliveryRes.data));
  }

  const grn2 = secondDeliveryRes.data?.delivery || secondDeliveryRes.data?.data?.delivery || secondDeliveryRes.data;
  const grn2No = grn2?.grnNumber || grn2?.publicId;
  console.log(`✓ GRN #2 Created: ${grn2No}`);

  // Check PO status & remaining
  const poAfterSecond = await request({
    hostname: 'localhost',
    port,
    path: '/api/v1/procurement/purchase-orders',
    method: 'GET',
    headers: authHeaders,
  });
  const pos2 = unwrapPos(poAfterSecond);
  const po2 = pos2.find((p) => (p.poNumber || p.poNo) === 'PO-REJ-581697');
  const item2 = (po2.items || [])[0];
  const rem2 = Number(item2.quantity) - Number(item2.receivedQuantity);
  console.log(`     - PO Remaining: ${rem2} PCS (Received: ${item2.receivedQuantity}/${item2.quantity})`);
  if (rem2 !== 0) {
    throw new Error(`Expected PO remaining = 0 PCS, got ${rem2}`);
  }

  // Check Raw Inventory Stock & Log after second delivery
  const logAfterSecond = await request({
    hostname: 'localhost',
    port,
    path: `/api/v1/inventory/material-log/handle`,
    method: 'GET',
    headers: authHeaders,
  });
  const logData2 = logAfterSecond.data?.data || logAfterSecond.data || {};
  const stock2 = Number(logData2.currentStock || 0);
  console.log(`     - Final Raw Inventory Stock: ${stock2} PCS (Baseline ${baselineStock} + 10 = ${baselineStock + 10})`);
  if (stock2 !== baselineStock + 10) {
    throw new Error(`Expected stock = ${baselineStock + 10} PCS, got ${stock2}`);
  }

  const history2 = logData2.history || [];
  console.log(`     - Total Movements in Log: ${history2.length}`);
  console.log(`     - Movement 1 (Latest): Type=${history2[0].type}, Qty=${history2[0].quantityFormatted}, Balance=${history2[0].balanceFormatted}, GRN=${history2[0].grnNumber}`);
  console.log(`     - Movement 2:         Type=${history2[1].type}, Qty=${history2[1].quantityFormatted}, Balance=${history2[1].balanceFormatted}, GRN=${history2[1].grnNumber}`);

  if (history2[0].quantity !== 5 || history2[1].quantity !== 5) {
    throw new Error(`History does not contain two separate 5 PCS movements!`);
  }
  if (history2[0].balance !== baselineStock + 10 || history2[1].balance !== baselineStock + 5) {
    throw new Error(`Balance sequence incorrect! Expected ${baselineStock + 10} then ${baselineStock + 5}`);
  }

  console.log(`\n🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY ON PORT ${port}!`);
}

async function main() {
  try {
    // Run on Docker Backend (Port 4001) which powers http://localhost:3000
    await runTestOnPort(4001, 'Docker Backend');
  } catch (err) {
    console.error('Test failed on Docker Backend:', err);
    process.exit(1);
  }
}

main();
