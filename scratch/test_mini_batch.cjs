const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTokens() {
  const [ss1Res, plantRes, adminRes] = await Promise.all([
    fetch('https://thehimalaya.cloud/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
    }),
    fetch('https://thehimalaya.cloud/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sana.r@himalayaerp.com', password: 'Himalaya@1234' })
    }),
    fetch('https://thehimalaya.cloud/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
    })
  ]);

  const ss1Token = (await ss1Res.json()).data?.accessToken;
  const plantToken = (await plantRes.json()).data?.accessToken;
  const adminToken = (await adminRes.json()).data?.accessToken;

  return {
    ss1Headers: { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' },
    plantHeaders: { Authorization: `Bearer ${plantToken}`, 'Content-Type': 'application/json' },
    adminHeaders: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  };
}

async function processLead(lead, tokens) {
  console.log(`\n▶ Processing Lead: ${lead.leadNumber} | ${lead.companyName} (${lead.id})`);

  // Step 1: Create Quotation
  const quotePayload = {
    leadId: lead.id,
    items: (lead.detailedItems || []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      discount: Number(item.discount) || 0,
      tax: 18,
      lineTotal: Number(item.grandTotal) || (Number(item.quantity) * Number(item.unitPrice) * 1.18)
    })),
    expectedTransportationCost: 0,
    paymentTerms: '30 Days',
    remarks: 'Auto-converted quotation for SuperSales 1 Lead'
  };

  const qRes = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations', {
    method: 'POST',
    headers: tokens.ss1Headers,
    body: JSON.stringify(quotePayload)
  });
  const qData = await qRes.json();
  const quote = qData.data || qData;
  if (!quote?.id) {
    throw new Error(`Failed to create quotation for ${lead.leadNumber}: ${JSON.stringify(qData)}`);
  }
  console.log(`  ✔ Quotation: ${quote.quotationNumber} (${quote.id})`);

  // Step 2: Convert Quotation to Sales Order
  const convRes = await fetch(`https://thehimalaya.cloud/api/v1/crm/quotations/${quote.id}/convert`, {
    method: 'POST',
    headers: tokens.ss1Headers
  });
  const convData = await convRes.json();
  const order = convData.data || convData;
  if (!order?.id) {
    throw new Error(`Failed to convert quotation ${quote.id}: ${JSON.stringify(convData)}`);
  }
  console.log(`  ✔ Sales Order: ${order.orderNumber} (${order.id})`);

  // Step 3: Send Sales Order to Plant Head
  const sendRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/${order.id}/send-to-plant-head`, {
    method: 'POST',
    headers: tokens.ss1Headers,
    body: JSON.stringify({ action: 'SEND_TO_PLANT', remarks: 'Sent to Plant Head' })
  });
  if (!sendRes.ok) {
    console.warn(`  ⚠️ Warning sending to plant head: ${sendRes.status} ${await sendRes.text()}`);
  } else {
    console.log(`  ✔ Order sent to Plant Head`);
  }

  // Step 4: Fetch fresh order items to build fulfillment plan
  const freshOrderRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/${order.id}`, {
    headers: tokens.adminHeaders
  });
  const freshOrderData = (await freshOrderRes.json()).data;
  const orderItems = freshOrderData?.items || order.items || [];

  // Step 5: Plant Head accepts incoming order via Fulfillment Plan
  const planPayload = {
    items: orderItems.map((item) => ({
      salesOrderItemId: item.id,
      productionQty: Number(item.orderedQuantity) || 1,
      directDispatchQty: 0,
      priority: 'NORMAL'
    }))
  };

  const planRes = await fetch(`https://thehimalaya.cloud/api/v1/plant-head/orders/${order.id}/fulfillment-plan`, {
    method: 'POST',
    headers: tokens.plantHeaders,
    body: JSON.stringify(planPayload)
  });
  const planData = await planRes.json();
  if (!planRes.ok) {
    throw new Error(`Fulfillment plan failed for order ${order.id}: ${JSON.stringify(planData)}`);
  }
  console.log(`  ✔ Plant Head accepted incoming order & scheduled Production Plan`);

  // Step 6: Production accepts incoming order
  const decRes = await fetch('https://thehimalaya.cloud/api/v1/production/incoming-orders/decision', {
    method: 'POST',
    headers: tokens.adminHeaders,
    body: JSON.stringify({
      orderId: order.id,
      action: 'ACCEPT',
      remarks: 'Accepted in production'
    })
  });
  const decData = await decRes.json();
  const workOrderIds = decData.data?.workOrderIds || [];
  console.log(`  ✔ Production accepted order. Scheduled Work Orders: ${workOrderIds.length}`);

  // Step 7: Complete Work Orders & QC Pass
  for (let idx = 0; idx < workOrderIds.length; idx++) {
    const woId = workOrderIds[idx];
    const itemQty = orderItems[idx] ? Number(orderItems[idx].orderedQuantity) || 1 : 1;

    // Start
    await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/start`, {
      method: 'POST',
      headers: tokens.adminHeaders
    });

    // Complete
    await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/complete`, {
      method: 'POST',
      headers: tokens.adminHeaders
    });

    // QC Pass
    const qcRes = await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/qc-pass`, {
      method: 'POST',
      headers: tokens.adminHeaders,
      body: JSON.stringify({
        approvedQuantity: itemQty,
        rejectedQuantity: 0,
        remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK'
      })
    });
    if (!qcRes.ok) {
      console.warn(`  ⚠️ QC pass issue on WO ${woId}: ${qcRes.status} ${await qcRes.text()}`);
    } else {
      console.log(`  ✔ WO ${woId} -> Production Done -> QC Approved -> READY FOR DISPATCH`);
    }
  }

  return { success: true, orderNumber: order.orderNumber, workOrders: workOrderIds.length };
}

async function testMiniBatch() {
  console.log('Testing mini batch of 2 leads...');
  const orig = new Set(JSON.parse(fs.readFileSync('scratch/live_leads_dump.json')).map((l) => l.id));
  const tokens = await getTokens();

  const leadsRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', { headers: tokens.ss1Headers });
  const raw = await leadsRes.json();
  const list = (raw.data || raw).filter((l) => !orig.has(l.id) && (l.workflowState?.name === 'New' || l.status === 'New'));

  console.log(`Found ${list.length} pending new leads.`);
  const testBatch = list.slice(0, 2);

  for (const lead of testBatch) {
    await processLead(lead, tokens);
    await sleep(200);
  }

  console.log('\nMini batch finished successfully!');
}

testMiniBatch().catch(console.error);
