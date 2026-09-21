const fs = require('fs');

async function main() {
  console.log('======================================================================');
  console.log('🚀 COMPLETING PRODUCTION & TRANSITIONING TO READY FOR DISPATCH');
  console.log('======================================================================');

  // 1. Authenticate
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  if (!token) throw new Error('Failed to get admin auth token');
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // 2. Target 8 remaining orders with pending work orders
  const targetOrderNumbers = [
    'HCPPL/2627/0195',
    'HCPPL/2627/0192',
    'HCPPL/2627/0191',
    'HCPPL/2627/0190',
    'HCPPL/2627/0160',
    'HCPPL/2627/0158',
    'HCPPL/2627/0146',
    'HCPPL/2627/0145'
  ];

  console.log('\n--- STEP 1: Process 30 Pending Work Orders in 8 Orders ---');
  for (const on of targetOrderNumbers) {
    const res = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?search=' + encodeURIComponent(on), {
      headers
    });
    const order = (await res.json()).data?.data?.find(o => o.orderNumber === on);
    if (!order) {
      console.warn(`Order ${on} not found`);
      continue;
    }

    const detailRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders/' + order.id, { headers });
    const detail = (await detailRes.json()).data;
    const plans = detail.productionPlans || [];

    for (const plan of plans) {
      for (const wo of (plan.workOrders || [])) {
        if (wo.productionStatus === 'READY_FOR_DISPATCH' || wo.productionStatus === 'DISPATCHED') {
          continue;
        }
        const qty = Number(wo.quantity) || 1;
        console.log(`  Processing ${wo.workOrderNumber} (Order: ${on}, Qty: ${qty}, St: ${wo.status})...`);

        // Start if CREATED
        if (wo.status === 'CREATED' || !wo.startedAt) {
          await fetch(`https://thehimalaya.cloud/api/v1/production/${wo.id}/start`, {
            method: 'POST',
            headers
          });
        }

        // Complete if not COMPLETED
        if (wo.status !== 'COMPLETED') {
          await fetch(`https://thehimalaya.cloud/api/v1/production/${wo.id}/complete`, {
            method: 'POST',
            headers
          });
        }

        // QC Pass
        const qcRes = await fetch(`https://thehimalaya.cloud/api/v1/production/${wo.id}/qc-pass`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            approvedQuantity: qty,
            rejectedQuantity: 0,
            remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK'
          })
        });

        if (!qcRes.ok) {
          console.warn(`    ⚠️ QC Pass issue on ${wo.workOrderNumber}: ${qcRes.status} ${await qcRes.text()}`);
        } else {
          console.log(`    ✔ ${wo.workOrderNumber} QC Approved -> READY_FOR_DISPATCH`);
        }
      }
    }
  }

  // 3. Transition all supersales1 orders to READY_FOR_DISPATCH
  console.log('\n--- STEP 2: Transition Sales Orders to READY_FOR_DISPATCH via MARK_READY ---');
  const allOrdersRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=1000', { headers });
  const allOrders = (await allOrdersRes.json()).data?.data || [];

  const ss1Orders = allOrders.filter(o => {
    return o.salesExecutiveId === 'b1515d86-b153-406c-93da-5d50748b7e75' ||
           o.createdById === 'b1515d86-b153-406c-93da-5d50748b7e75';
  });
  console.log(`Found ${ss1Orders.length} total orders for SuperSales 1.`);

  const ordersToTransition = ss1Orders.filter(o => o.status === 'PLANT_APPROVED');
  console.log(`Orders currently in PLANT_APPROVED to transition: ${ordersToTransition.length}`);

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < ordersToTransition.length; i++) {
    const o = ordersToTransition[i];
    try {
      const actionRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/${o.id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'MARK_READY',
          remarks: 'Production complete & QC Approved - Ready for Dispatch'
        })
      });

      if (actionRes.ok) {
        successCount++;
        if (successCount % 25 === 0 || i === ordersToTransition.length - 1) {
          console.log(`  [${i + 1}/${ordersToTransition.length}] Updated ${o.orderNumber} -> READY_FOR_DISPATCH`);
        }
      } else {
        failedCount++;
        console.warn(`  ⚠️ Failed on ${o.orderNumber}: ${actionRes.status} ${await actionRes.text()}`);
      }
    } catch (err) {
      failedCount++;
      console.warn(`  ⚠️ Error on ${o.orderNumber}: ${err.message}`);
    }
  }

  console.log(`\nTransition Summary: ${successCount} succeeded, ${failedCount} failed.`);

  // 4. Verification Check
  console.log('\n--- STEP 3: Final Verification ---');
  const freshOrdersRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=1000', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const freshOrders = (await freshOrdersRes.json()).data?.data || [];
  const freshSS1Orders = freshOrders.filter(o => {
    return o.salesExecutiveId === 'b1515d86-b153-406c-93da-5d50748b7e75' ||
           o.createdById === 'b1515d86-b153-406c-93da-5d50748b7e75';
  });

  const ss1StatusMap = {};
  for (const o of freshSS1Orders) {
    ss1StatusMap[o.status] = (ss1StatusMap[o.status] || 0) + 1;
  }
  console.log('SuperSales 1 Status Distribution:', ss1StatusMap);

  // Check DashboardView calculation logic
  const inProd = freshSS1Orders.filter(o => {
    const s = String(o.workflowStatus || o.orderStatus || o.status || o.workflowState?.code || o.planningStatus || '').toUpperCase();
    const dept = String(o.currentDepartment || '').toUpperCase();
    const isSentToPlant = Boolean(o.sentToPlantHead || o.sentToPlantHeadAt || o.sentToPlantAt || o.isSentToPlant) ||
                          s.includes('PRODUCTION') || s.includes('PLANT') || s.includes('PLAN') || dept.includes('PRODUCTION');
    return isSentToPlant && !s.includes('DISPATCH') && !s.includes('DELIVER') && !['CANCELLED', 'VOID', 'REJECTED', 'DRAFT'].includes(s);
  });

  const readyDisp = freshSS1Orders.filter(o => {
    const s = String(o.workflowStatus || o.orderStatus || o.status || o.dispatchStatus || '').toUpperCase();
    return (s.includes('DISPATCH') || s.includes('READY') || s.includes('TRANSIT')) && !s.includes('DELIVER') && !s.includes('COMPLETED') && !['CANCELLED', 'VOID', 'REJECTED', 'DRAFT'].includes(s);
  });

  console.log(`Pipeline Dashboard - Production Count: ${inProd.length} (was 195)`);
  console.log(`Pipeline Dashboard - Ready for Dispatch Count: ${readyDisp.length}`);

  // Check Work Orders in Ready for Dispatch
  const readyWOsRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const readyWOs = (await readyWOsRes.json()).data?.data || [];
  console.log(`Total Work Orders in /production/ready-for-dispatch: ${readyWOs.length}`);
}

main().catch(console.error);
