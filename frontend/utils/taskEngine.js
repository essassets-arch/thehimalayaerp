/**
 * Daily Task Engine - Utility to derive daily actionable items from application collections
 */

// Timezone-safe local ISO date getter
export const getTodayDateString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Searches the state for a client's phone number across leads and customers
 */
export const getClientPhone = (state, clientName) => {
  if (!clientName) return '';
  const cleanName = String(clientName).trim().toLowerCase();
  
  const lead = (state.leads || []).find(l => 
    String(l.companyName || '').trim().toLowerCase() === cleanName
  );
  if (lead && (lead.phone || lead.siteInchargeMobile)) {
    return lead.phone || lead.siteInchargeMobile;
  }
  
  const customer = (state.customers || []).find(c => 
    String(c.name || '').trim().toLowerCase() === cleanName
  );
  if (customer && customer.phone) {
    return customer.phone;
  }
  
  return '';
};

/**
 * Generates a unified list of tasks based on application state and a target date
 */
export const generateTasks = (state, targetDate) => {
  const today = targetDate || getTodayDateString();
  const tasks = [];

  const leads = state.leads || [];
  const samples = state.samples || [];
  const quotations = state.quotations || [];
  const orders = state.orders || [];
  const payments = state.payments || [];
  const financeFollowUps = state.finance?.paymentFollowUps || [];

  // 1. Leads follow-up tasks
  leads.forEach(l => {
    if (l.followUpDate && l.status !== 'Converted' && l.status !== 'Lost') {
      const isOverdue = l.followUpDate < today;
      tasks.push({
        id: `LD-${l.id}`,
        sourceId: l.id,
        clientName: l.companyName,
        type: 'Lead',
        status: isOverdue ? 'Overdue' : 'Pending',
        followUpDate: l.followUpDate,
        notes: l.notes || l.requirements || 'Follow up on client requirements',
        amount: l.budget || 0,
        phone: l.phone || l.siteInchargeMobile || '',
        rawEntity: l
      });
    }
  });

  // 2. Samples pending and follow-up tasks
  samples.forEach(s => {
    // Show if there is a follow-up date or if status is Pending
    if (s.followUpDate || s.status === 'Pending') {
      const date = s.followUpDate || s.dispatchDate || today;
      const isOverdue = date < today;
      tasks.push({
        id: `SMP-${s.id}`,
        sourceId: s.id,
        clientName: s.leadName,
        type: 'Sample',
        status: isOverdue ? 'Overdue' : (s.status === 'Pending' ? 'Pending' : 'Completed'),
        followUpDate: date,
        notes: `Test Sample: ${s.product} (Qty: ${s.quantity})`,
        amount: 0,
        phone: getClientPhone(state, s.leadName),
        rawEntity: s
      });
    }
  });

  // 3. Quotations follow-up (draft or sent quotations check)
  quotations.forEach(q => {
    if (q.followUpDate || q.status === 'Draft' || q.status === 'Sent') {
      const date = q.followUpDate || q.validTill || today;
      const isOverdue = date < today;
      tasks.push({
        id: `QT-${q.id}`,
        sourceId: q.id,
        clientName: q.customerName,
        type: 'Quotation',
        status: isOverdue ? 'Overdue' : 'Pending',
        followUpDate: date,
        notes: `Quotation #${q.id}: ${q.items} (Valid Till: ${q.validTill || 'N/A'})`,
        amount: q.totalAmount || 0,
        phone: getClientPhone(state, q.customerName),
        rawEntity: q
      });
    }
  });

  // 4. Orders (Pending confirmation or due today)
  orders.forEach(o => {
    const clientName = o.customer?.name || o.customerName || 'Unknown Customer';
    
    // Order pending confirmation
    if (o.status === 'Pending' || o.salesStatus === 'Pending' || o.status === 'PENDING_PLANT_HEAD' || o.status === 'Pending Confirmation') {
      tasks.push({
        id: `ORD-${o.orderNo}`,
        sourceId: o.orderNo,
        clientName,
        type: 'Order',
        status: 'Pending',
        followUpDate: o.date || today,
        notes: `Verify Order confirmation for ${o.products}`,
        amount: o.payment?.totalAmount || o.totalValue || 0,
        phone: getClientPhone(state, clientName),
        rawEntity: o
      });
    }

    // Production Status (Delayed / due today)
    if (o.deliveryDate) {
      const isOverdue = o.deliveryDate < today;
      const isDelayed = o.productionStatus === 'Pending' && isOverdue;
      tasks.push({
        id: `PROD-${o.orderNo}`,
        sourceId: o.orderNo,
        clientName,
        type: 'Production',
        status: isOverdue ? 'Overdue' : 'Pending',
        followUpDate: o.deliveryDate,
        notes: `Production stage: ${o.overallStage || o.productionStatus || 'Running'} (${isDelayed ? 'DELAYED' : 'ON TRACK'})`,
        amount: o.payment?.totalAmount || o.totalValue || 0,
        phone: getClientPhone(state, clientName),
        rawEntity: o
      });
    }
  });

  // 5. Payment Follow-ups (due today / outstanding)
  payments.forEach(p => {
    if (p.status === 'Outstanding' && p.dueDate) {
      const isOverdue = p.dueDate < today;
      tasks.push({
        id: `PM-${p.id}`,
        sourceId: p.id,
        clientName: p.customerName,
        type: 'Payment',
        status: isOverdue ? 'Overdue' : 'Pending',
        followUpDate: p.dueDate,
        notes: `Outstanding Invoice #${p.invoiceNo} (Remaining: ₹${((p.totalAmount || 0) - (p.paidAmount || 0)).toLocaleString('en-IN')})`,
        amount: (p.totalAmount || 0) - (p.paidAmount || 0),
        phone: getClientPhone(state, p.customerName),
        rawEntity: p
      });
    }
  });

  // 6. Finance self-reminders scheduled from Outstanding Collections
  financeFollowUps.forEach(followUp => {
    if (!followUp.nextFollowUpDate) return;
    const isOverdue = followUp.nextFollowUpDate < today;
    const order = orders.find(item =>
      String(item.id || item.orderNo || '') === String(followUp.orderId || '')
    );
    tasks.push({
      id: `FUP-${followUp.id}`,
      sourceId: followUp.id,
      clientName: followUp.customerName || order?.customerName || order?.customer?.name || 'Customer payment follow-up',
      type: 'Payment',
      status: isOverdue ? 'Overdue' : 'Pending',
      followUpDate: followUp.nextFollowUpDate,
      notes: followUp.remarks || followUp.discussionSummary || `Follow up for invoice ${followUp.invoiceNumber || '—'}`,
      amount: Number(followUp.outstandingAmount || followUp.promisedAmount || 0),
      phone: followUp.phoneNumber || '',
      rawEntity: followUp,
    });
  });

  return tasks;
};
