import { calculatePerformance } from './analyticsService';

const SIMULATION_TODAY = new Date('2026-06-15');

export function generateAlerts(state) {
  const alerts = [];
  const config = state.settings?.alertsConfig || {
    productionDelayDays: 3,
    dispatchDelayDays: 5,
    paymentOverdueDays: 7,
    noFollowUpDays: 2
  };

  const orders = state.sales?.orders || [];
  const payments = state.payments || [];
  const leads = state.sales?.leads || [];

  // 1. Scan Production Delays
  orders.forEach(order => {
    if (order.productionStatus === 'Running') {
      const prodEvent = (order.timeline || []).find(e => e.stage.includes('Production'));
      const startMs = prodEvent ? prodEvent.timestamp : (order.createdAt || new Date(order.date).getTime());
      const elapsedDays = Math.max(0, (SIMULATION_TODAY.getTime() - startMs) / (1000 * 60 * 60 * 24));
      
      if (elapsedDays > config.productionDelayDays) {
        alerts.push({
          id: `prod-${order.orderNo}`,
          type: 'production_delay',
          severity: elapsedDays > 6 ? 'high' : 'medium',
          title: `Production Delay: ${order.orderNo}`,
          message: `Order has been running in production for ${Math.round(elapsedDays)} days (Threshold: ${config.productionDelayDays} days).`,
          referenceId: order.orderNo,
          date: order.date
        });
      }
    }
  });

  // 2. Scan Dispatch Delays
  orders.forEach(order => {
    // Issued by store, but pending dispatch
    if (order.storeStatus === 'Issued' && order.dispatchStatus === 'Pending') {
      const issueEvent = (order.timeline || []).find(e => e.stage.includes('Issued') || e.stage.includes('Released'));
      const startMs = issueEvent ? issueEvent.timestamp : (order.createdAt || new Date(order.date).getTime());
      const elapsedDays = Math.max(0, (SIMULATION_TODAY.getTime() - startMs) / (1000 * 60 * 60 * 24));

      if (elapsedDays > config.dispatchDelayDays) {
        alerts.push({
          id: `disp-${order.orderNo}`,
          type: 'dispatch_delay',
          severity: 'high',
          title: `Logistics Delay: ${order.orderNo}`,
          message: `Materials issued but dispatch pending for ${Math.round(elapsedDays)} days (Threshold: ${config.dispatchDelayDays} days).`,
          referenceId: order.orderNo,
          date: order.date
        });
      }
    }
  });

  // 3. Scan Overdue Payments
  payments.forEach(payment => {
    if (payment.status !== 'Paid') {
      const due = new Date(payment.dueDate);
      const elapsedDays = Math.max(0, (SIMULATION_TODAY.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

      if (elapsedDays > 0) {
        alerts.push({
          id: `pay-${payment.invoiceNo}`,
          type: 'payment_overdue',
          severity: elapsedDays > config.paymentOverdueDays ? 'high' : 'medium',
          title: `Overdue Collection: Invoice #${payment.invoiceNo}`,
          message: `Payment of ₹${(payment.totalAmount - payment.paidAmount).toLocaleString('en-IN')} is overdue by ${Math.round(elapsedDays)} days for ${payment.customerName}.`,
          referenceId: payment.orderNo,
          date: payment.dueDate
        });
      }
    }
  });

  // 4. Scan No Follow-up
  leads.forEach(lead => {
    if (lead.status !== 'Converted' && lead.status !== 'Lost') {
      // Check last event in timeline or followUpDate
      const lastEvent = lead.timeline && lead.timeline.length > 0
        ? lead.timeline[lead.timeline.length - 1].timestamp
        : (lead.createdAt || new Date(lead.date || '2026-06-10').getTime());
      const elapsedDays = Math.max(0, (SIMULATION_TODAY.getTime() - lastEvent) / (1000 * 60 * 60 * 24));

      if (elapsedDays > config.noFollowUpDays) {
        alerts.push({
          id: `lead-${lead.id}`,
          type: 'no_followup',
          severity: 'medium',
          title: `Follow-up Required: ${lead.companyName}`,
          message: `No active followup logged for lead in the last ${Math.round(elapsedDays)} days (Threshold: ${config.noFollowUpDays} days).`,
          referenceId: lead.id.toString(),
          date: lead.followUpDate || lead.date || '2026-06-10'
        });
      }
    }
  });

  // 5. Scan High Target Gaps
  const performers = calculatePerformance(state, { time: 'all', user: 'all', performance: 'all' });
  performers.forEach(perf => {
    if (perf.target > 0) {
      const gapPercent = (perf.gap / perf.target) * 100;
      if (gapPercent > 50) {
        alerts.push({
          id: `gap-${perf.id}`,
          type: 'target_gap',
          severity: gapPercent > 70 ? 'high' : 'medium',
          title: `Performance Gap Alert: ${perf.name}`,
          message: `${perf.name} has a remaining target gap of ${Math.round(gapPercent)}% (₹${(perf.gap / 100000).toFixed(2)} Lakhs) with 15 days remaining in month.`,
          referenceId: perf.id,
          date: '2026-06-15'
        });
      }
    }
  });

  return alerts;
}
