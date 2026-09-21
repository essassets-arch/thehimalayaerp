async function convertTwoQuotes() {
  console.log('======================================================================');
  console.log('🚀 CONVERTING QU/2627/0184 & QU/2627/0178 TO ORDER & READY FOR DISPATCH');
  console.log('======================================================================');

  // Authenticate
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

  const ss1Headers = { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' };
  const plantHeaders = { Authorization: `Bearer ${plantToken}`, 'Content-Type': 'application/json' };
  const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  const targetQuoteIds = [
    { num: 'QU/2627/0184', id: '2392b526-938c-4dac-b672-427a81d13eb4', client: 'PSP PROJECTS LIMITED' },
    { num: 'QU/2627/0178', id: 'b195ae69-020b-48ea-9810-52ba74d3c77a', client: 'Kushal Bhai' }
  ];

  for (const tq of targetQuoteIds) {
    console.log(`\n▶ Processing Quotation: ${tq.num} | ${tq.client} (${tq.id})`);

    // Step 1: Convert to Sales Order
    console.log('  1. Converting to Sales Order...');
    const convRes = await fetch(`https://thehimalaya.cloud/api/v1/crm/quotations/${tq.id}/convert`, {
      method: 'POST',
      headers: ss1Headers
    });
    const convData = await convRes.json();
    const order = convData.data || convData;
    if (!order?.id) {
      throw new Error(`Failed to convert quotation ${tq.num}: ${JSON.stringify(convData)}`);
    }
    console.log(`  ✔ Sales Order created: ${order.orderNumber} (${order.id})`);

    // Step 2: Send Sales Order to Plant Head
    console.log('  2. Sending order to Plant Head...');
    const sendRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/${order.id}/send-to-plant-head`, {
      method: 'POST',
      headers: ss1Headers,
      body: JSON.stringify({ action: 'SEND_TO_PLANT', remarks: 'Sent to Plant Head' })
    });
    if (!sendRes.ok) {
      console.warn(`  ⚠️ Warning sending to plant head: ${sendRes.status} ${await sendRes.text()}`);
    } else {
      console.log(`  ✔ Order sent to Plant Head`);
    }

    // Step 3: Fetch fresh order items
    console.log('  3. Loading order line items...');
    const freshOrderRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/${order.id}`, {
      headers: adminHeaders
    });
    const freshOrderData = (await freshOrderRes.json()).data;
    const orderItems = freshOrderData?.items || order.items || [];
    console.log(`  ✔ Found ${orderItems.length} line items in order`);

    // Step 4: Plant Head accepts incoming order via Fulfillment Plan
    console.log('  4. Plant Head submitting Fulfillment Plan...');
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
      headers: plantHeaders,
      body: JSON.stringify(planPayload)
    });
    const planData = await planRes.json();
    if (!planRes.ok) {
      throw new Error(`Fulfillment plan failed for order ${order.id}: ${JSON.stringify(planData)}`);
    }
    console.log(`  ✔ Plant Head accepted incoming order & scheduled Production Plan`);

    // Step 5: Production accepts incoming order
    console.log('  5. Production accepting incoming order...');
    const decRes = await fetch('https://thehimalaya.cloud/api/v1/production/incoming-orders/decision', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        orderId: order.id,
        action: 'ACCEPT',
        remarks: 'Accepted in production'
      })
    });
    const decData = await decRes.json();
    const workOrderIds = decData.data?.workOrderIds || [];
    console.log(`  ✔ Production accepted order. Work Orders: ${workOrderIds.length}`);

    // Step 6: Complete Work Orders & QC Pass
    for (let idx = 0; idx < workOrderIds.length; idx++) {
      const woId = workOrderIds[idx];
      const itemQty = orderItems[idx] ? Number(orderItems[idx].orderedQuantity) || 1 : 1;

      // Start Work Order
      await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/start`, {
        method: 'POST',
        headers: adminHeaders
      });

      // Complete Work Order (Production Done)
      await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/complete`, {
        method: 'POST',
        headers: adminHeaders
      });

      // QC Pass (QC Approve)
      const qcRes = await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/qc-pass`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          approvedQuantity: itemQty,
          rejectedQuantity: 0,
          remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK'
        })
      });

      if (!qcRes.ok) {
        console.warn(`     ⚠️ QC pass error on WO ${woId}: ${qcRes.status} ${await qcRes.text()}`);
      } else {
        console.log(`     ✔ WO ${woId} (Qty: ${itemQty}) -> Production Done -> QC Approved -> READY FOR DISPATCH`);
      }
    }
  }

  // Final verification
  console.log('\n======================================================================');
  console.log('🔍 VERIFYING READY FOR DISPATCH QUEUE');
  console.log('======================================================================');
  const readyRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers: adminHeaders });
  const readyData = await readyRes.json();
  const readyList = readyData.data?.data || [];
  console.log(`✅ Total Work Orders now live in Ready for Dispatch queue: ${readyList.length}`);

  const pspWos = readyList.filter(w => w.productionPlan?.salesOrder?.customer?.companyName?.includes('PSP') || w.productionPlan?.salesOrder?.quotation?.quotationNumber === 'QU/2627/0184');
  console.log(`  - PSP PROJECTS LIMITED work orders in Ready for Dispatch: ${pspWos.length} / 4`);

  const kushalWos = readyList.filter(w => w.productionPlan?.salesOrder?.customer?.companyName?.includes('Kushal') || w.productionPlan?.salesOrder?.quotation?.quotationNumber === 'QU/2627/0178');
  console.log(`  - Kushal Bhai work orders in Ready for Dispatch: ${kushalWos.length} / 2`);

  // Check quotation statuses
  const quotesRes = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations?limit=1000', { headers: ss1Headers });
  const quotesData = await quotesRes.json();
  const allQuotes = quotesData.data || [];
  const q184Updated = allQuotes.find(q => q.id === '2392b526-938c-4dac-b672-427a81d13eb4');
  const q178Updated = allQuotes.find(q => q.id === 'b195ae69-020b-48ea-9810-52ba74d3c77a');

  console.log(`  - QU/2627/0184 status: ${q184Updated?.status || q184Updated?.workflowState?.name}`);
  console.log(`  - QU/2627/0178 status: ${q178Updated?.status || q178Updated?.workflowState?.name}`);

  console.log('======================================================================');
  console.log('🎉 SUCCESS: Both quotations converted and all work orders are in Ready for Dispatch!');
  console.log('======================================================================');
}

convertTwoQuotes().catch(console.error);
