const fs = require('fs');

async function exportAll() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;

  let allOrders = [];
  let page = 1;
  while (true) {
    const res = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?page=' + page + '&pageSize=100', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const json = await res.json();
    const list = json.data?.data || [];
    allOrders.push(...list);
    const pagination = json.data?.pagination;
    if (!pagination || page >= pagination.totalPages || list.length === 0) break;
    page++;
  }

  // Users map
  const usersRes = await fetch('https://thehimalaya.cloud/api/v1/users', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const usersData = await usersRes.json();
  const userMap = {};
  if (Array.isArray(usersData.data)) {
    usersData.data.forEach(u => { userMap[u.id] = { name: u.name, email: u.email, role: u.role }; });
  }

  const rows = allOrders.map((o, idx) => {
    const custName = o.customer?.companyName || o.customer?.name || o.lead?.companyName || o.quotation?.lead?.companyName || 'N/A';
    const contact = o.customer?.contactPerson || o.lead?.contactPerson || o.quotation?.lead?.contactPerson || 'N/A';
    const phone = o.customer?.phone || o.lead?.phone || o.quotation?.lead?.phone || 'N/A';
    const city = o.customer?.city || o.lead?.address?.city || o.quotation?.lead?.address?.city || 'N/A';
    
    const execId = o.salesExecutiveId || o.createdById || o.quotation?.salesExecutiveId || o.lead?.assignedToId;
    const execInfo = userMap[execId] || { name: 'Unknown', email: 'N/A', role: 'N/A' };

    const itemsSummary = (o.items || []).map(it => {
      const pName = it.productName || it.productNameSnapshot || it.productCode || 'Item';
      return pName + ' (Qty: ' + (it.orderedQuantity || 0) + ' ' + (it.unit || 'NOS') + ' @ ₹' + (it.unitPrice || 0) + ')';
    }).join('; ');

    const totalQty = (o.items || []).reduce((sum, it) => sum + (Number(it.orderedQuantity) || 0), 0);
    const deliveredQty = (o.items || []).reduce((sum, it) => sum + (Number(it.deliveredQuantity) || 0), 0);

    const prodPlan = (o.productionPlans && o.productionPlans.length > 0) ? o.productionPlans[0] : null;
    const dispatch = (o.dispatches && o.dispatches.length > 0) ? o.dispatches[0] : null;

    return {
      srNo: idx + 1,
      orderId: o.id,
      orderNumber: o.orderNumber,
      orderDate: o.createdAt ? o.createdAt.substring(0, 10) : 'N/A',
      customerName: custName,
      contactPerson: contact,
      contactPhone: phone,
      city: city,
      salesExecutive: execInfo.name,
      salesExecutiveEmail: execInfo.email,
      totalQuantity: totalQty,
      itemsDescription: itemsSummary,
      subtotal: Number(o.subtotal || 0),
      taxAmount: Number(o.taxAmount || 0),
      totalAmount: Number(o.totalAmount || 0),
      verifiedPaidAmount: Number(o.verifiedPaidAmount || 0),
      balanceAmount: Number(o.balanceAmount || 0),
      paymentStatus: o.paymentStatus || 'NOT_DUE',
      // Plant Head
      sentToPlantHead: o.sentToPlantHead ? 'YES' : 'NO',
      plantHeadStatus: o.planningStatus || (o.sentToPlantHead ? 'PENDING_ACCEPTANCE' : 'NOT_SENT'),
      targetDate: o.targetDate ? o.targetDate.substring(0, 10) : 'N/A',
      priority: o.priority || 'NORMAL',
      // Production
      productionPlanNumber: prodPlan ? prodPlan.planNumber : 'N/A',
      productionStatus: o.productionStatus || (prodPlan ? prodPlan.status : 'N/A'),
      qcStatus: o.qcStatus || 'N/A',
      // Dispatch
      dispatchStatus: o.status === 'COMPLETED' ? 'DELIVERED' : (o.status === 'READY_FOR_DISPATCH' ? 'READY_FOR_DISPATCH' : (dispatch ? dispatch.status : 'NOT_DISPATCHED')),
      dispatchNumber: dispatch ? dispatch.dispatchNo : 'N/A',
      transporterName: dispatch ? dispatch.transporterName : 'N/A',
      vehicleNumber: dispatch ? dispatch.vehicleNumber : 'N/A',
      driverName: dispatch ? dispatch.driverName : 'N/A',
      driverPhone: dispatch ? dispatch.driverPhone : 'N/A',
      lrNumber: dispatch ? dispatch.lrNumber : 'N/A',
      deliveredQuantity: deliveredQty,
      deliveredAt: dispatch && dispatch.deliveredAt ? dispatch.deliveredAt.substring(0, 19).replace('T', ' ') : 'N/A',
      overallStatus: o.status
    };
  });

  fs.writeFileSync('d:/prototype-next-main/scratch/sales_orders_live_all_271.json', JSON.stringify(rows, null, 2));

  // CSV generation
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];
  rows.forEach(r => {
    const line = headers.map(h => {
      let val = String(r[h] ?? '').replace(/"/g, '""');
      if (val.includes(',') || val.includes('\n') || val.includes('"') || val.includes(';')) {
        val = '"' + val + '"';
      }
      return val;
    }).join(',');
    csvLines.push(line);
  });
  fs.writeFileSync('d:/prototype-next-main/scratch/sales_orders_live_all_271.csv', csvLines.join('\n'));

  console.log('Successfully saved ' + rows.length + ' orders to JSON and CSV!');
}

exportAll().catch(console.error);
