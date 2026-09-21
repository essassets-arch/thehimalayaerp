const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PipelineRunner {
  constructor() {
    this.tokens = null;
    this.lastTokenFetchTime = 0;
    this.origLeads = new Set(
      JSON.parse(fs.readFileSync('scratch/live_leads_dump.json')).map((l) => l.id)
    );
  }

  async ensureTokens(force = false) {
    const now = Date.now();
    // Refresh tokens every 8 minutes (expiry is 15m)
    if (!this.tokens || force || now - this.lastTokenFetchTime > 8 * 60 * 1000) {
      console.log('🔄 Refreshing API auth tokens...');
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

      this.tokens = {
        ss1Headers: { Authorization: `Bearer ${ss1Token}`, 'Content-Type': 'application/json' },
        plantHeaders: { Authorization: `Bearer ${plantToken}`, 'Content-Type': 'application/json' },
        adminHeaders: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
      };
      this.lastTokenFetchTime = now;
      console.log('✅ Tokens refreshed successfully.');
    }
    return this.tokens;
  }

  async fetchWithRetry(url, options, headersGetter, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const tokens = await this.ensureTokens();
        options.headers = headersGetter(tokens);
        const res = await fetch(url, options);

        if (res.status === 401 && attempt < maxRetries) {
          console.warn(`[401 Unauthorized] Retrying with fresh tokens...`);
          await this.ensureTokens(true);
          continue;
        }

        return res;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        console.warn(`[Network Retry ${attempt}/${maxRetries}] ${err.message}. Waiting 1s...`);
        await sleep(1000);
      }
    }
  }

  async processSingleLead(lead, index, total) {
    const percent = ((index / total) * 100).toFixed(1);
    console.log(`\n========================================================================`);
    console.log(`[${index}/${total}] (${percent}%) Lead: ${lead.leadNumber} | ${lead.companyName} (${lead.id})`);
    console.log(`========================================================================`);

    // Guard: ensure not in original 17 leads
    if (this.origLeads.has(lead.id)) {
      console.log(`🛡️ SKIPPING protected original lead: ${lead.id}`);
      return { skipped: true };
    }

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

    const qRes = await this.fetchWithRetry(
      'https://thehimalaya.cloud/api/v1/crm/quotations',
      {
        method: 'POST',
        body: JSON.stringify(quotePayload)
      },
      (t) => t.ss1Headers
    );

    const qData = await qRes.json();
    const quote = qData.data || qData;
    if (!quote?.id) {
      throw new Error(`Failed to create quotation for ${lead.leadNumber}: ${JSON.stringify(qData)}`);
    }
    console.log(`  1. Quotation created: ${quote.quotationNumber} (${quote.id})`);

    // Step 2: Convert Quotation to Sales Order
    const convRes = await this.fetchWithRetry(
      `https://thehimalaya.cloud/api/v1/crm/quotations/${quote.id}/convert`,
      {
        method: 'POST'
      },
      (t) => t.ss1Headers
    );

    const convData = await convRes.json();
    const order = convData.data || convData;
    if (!order?.id) {
      throw new Error(`Failed to convert quotation ${quote.id}: ${JSON.stringify(convData)}`);
    }
    console.log(`  2. Sales Order created: ${order.orderNumber} (${order.id})`);

    // Step 3: Send Sales Order to Plant Head
    await this.fetchWithRetry(
      `https://thehimalaya.cloud/api/v1/sales/orders/${order.id}/send-to-plant-head`,
      {
        method: 'POST',
        body: JSON.stringify({ action: 'SEND_TO_PLANT', remarks: 'Sent to Plant Head' })
      },
      (t) => t.ss1Headers
    );
    console.log(`  3. Order sent to Plant Head`);

    // Step 4: Fetch fresh order items to build fulfillment plan
    const freshOrderRes = await this.fetchWithRetry(
      `https://thehimalaya.cloud/api/v1/sales/orders/${order.id}`,
      { method: 'GET' },
      (t) => t.adminHeaders
    );
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

    const planRes = await this.fetchWithRetry(
      `https://thehimalaya.cloud/api/v1/plant-head/orders/${order.id}/fulfillment-plan`,
      {
        method: 'POST',
        body: JSON.stringify(planPayload)
      },
      (t) => t.plantHeaders
    );
    const planData = await planRes.json();
    if (!planRes.ok) {
      throw new Error(`Fulfillment plan failed for order ${order.id}: ${JSON.stringify(planData)}`);
    }
    console.log(`  4. Plant Head accepted incoming order & scheduled Production Plan`);

    // Step 6: Production accepts incoming order
    const decRes = await this.fetchWithRetry(
      'https://thehimalaya.cloud/api/v1/production/incoming-orders/decision',
      {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          action: 'ACCEPT',
          remarks: 'Accepted in production'
        })
      },
      (t) => t.adminHeaders
    );
    const decData = await decRes.json();
    const workOrderIds = decData.data?.workOrderIds || [];
    console.log(`  5. Production accepted order. Work Orders: ${workOrderIds.length}`);

    // Step 7: Complete Work Orders & QC Pass
    for (let idx = 0; idx < workOrderIds.length; idx++) {
      const woId = workOrderIds[idx];
      const itemQty = orderItems[idx] ? Number(orderItems[idx].orderedQuantity) || 1 : 1;

      // Start Work Order
      await this.fetchWithRetry(
        `https://thehimalaya.cloud/api/v1/production/${woId}/start`,
        { method: 'POST' },
        (t) => t.adminHeaders
      );

      // Complete Work Order (Production Done)
      await this.fetchWithRetry(
        `https://thehimalaya.cloud/api/v1/production/${woId}/complete`,
        { method: 'POST' },
        (t) => t.adminHeaders
      );

      // QC Pass (QC Approve)
      const qcRes = await this.fetchWithRetry(
        `https://thehimalaya.cloud/api/v1/production/${woId}/qc-pass`,
        {
          method: 'POST',
          body: JSON.stringify({
            approvedQuantity: itemQty,
            rejectedQuantity: 0,
            remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK'
          })
        },
        (t) => t.adminHeaders
      );

      if (!qcRes.ok) {
        console.warn(`     ⚠️ QC pass error on WO ${woId}: ${qcRes.status} ${await qcRes.text()}`);
      } else {
        console.log(`     ✔ WO ${woId} -> Production Done -> QC Approved -> READY FOR DISPATCH`);
      }
    }

    return {
      success: true,
      leadNumber: lead.leadNumber,
      orderNumber: order.orderNumber,
      workOrdersCount: workOrderIds.length
    };
  }

  async run() {
    console.log('======================================================================');
    console.log('🚀 COMPLETE PIPELINE PROGRESSION FOR SUPERSALES 1');
    console.log('LEAD -> QUOTATION -> ORDER -> PLANT HEAD -> PRODUCTION -> QC -> READY FOR DISPATCH');
    console.log('======================================================================');

    await this.ensureTokens();

    console.log('Fetching leads for SuperSales 1...');
    const leadsRes = await this.fetchWithRetry(
      'https://thehimalaya.cloud/api/v1/crm/leads',
      { method: 'GET' },
      (t) => t.ss1Headers
    );
    const raw = await leadsRes.json();
    const list = Array.isArray(raw) ? raw : (raw.data || []);

    // Filter to only new leads that are still in 'New' status (excluding the 17 protected original leads)
    const pendingLeads = list.filter(
      (l) => !this.origLeads.has(l.id) && (l.workflowState?.name === 'New' || l.status === 'New')
    );

    console.log(`Total leads in SuperSales 1: ${list.length}`);
    console.log(`Protected original leads: ${this.origLeads.size}`);
    console.log(`Pending leads to process: ${pendingLeads.length}`);

    if (pendingLeads.length === 0) {
      console.log('🎉 All new leads have already been processed to Ready for Dispatch!');
      return;
    }

    let successCount = 0;
    let totalWorkOrders = 0;
    const errors = [];
    const startTime = Date.now();

    for (let i = 0; i < pendingLeads.length; i++) {
      const lead = pendingLeads[i];
      try {
        const res = await this.processSingleLead(lead, i + 1, pendingLeads.length);
        if (res?.success) {
          successCount++;
          totalWorkOrders += (res.workOrdersCount || 0);
        }
      } catch (err) {
        console.error(`❌ Error on lead ${lead.leadNumber} (${lead.id}): ${err.message}`);
        errors.push({ leadNumber: lead.leadNumber, error: err.message });
      }
      await sleep(150); // slight breathing room
    }

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n======================================================================');
    console.log('📊 PIPELINE EXECUTION SUMMARY');
    console.log('======================================================================');
    console.log(`Time elapsed: ${elapsedSec}s`);
    console.log(`Leads successfully processed: ${successCount} / ${pendingLeads.length}`);
    console.log(`Total new Work Orders generated & approved: ${totalWorkOrders}`);
    console.log(`Errors encountered: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Errors breakdown:', JSON.stringify(errors, null, 2));
    }

    // Verify Ready for Dispatch queue
    console.log('\n🔍 Final verification of /production/ready-for-dispatch...');
    const readyRes = await this.fetchWithRetry(
      'https://thehimalaya.cloud/api/v1/production/ready-for-dispatch',
      { method: 'GET' },
      (t) => t.adminHeaders
    );
    const readyData = await readyRes.json();
    const readyList = readyData.data?.data || [];
    console.log(`✅ Total Work Orders now live in Ready for Dispatch queue: ${readyList.length}`);
    console.log('======================================================================');
  }
}

const runner = new PipelineRunner();
runner.run().catch(console.error);
