const fs = require('fs');
const filePath = 'd:/prototype-next/components/PaymentFollowupERPView.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldPending = `  const pendingRows = useMemo(() => {
    const apiRows = pendingCollection || [];
    console.log("== pendingCollection ==", pendingCollection);
    console.log("== orders ==", orders);
    const localDelivered = (orders || []).filter(o => {
      const st = String(o.orderStatus || o.status || o.overallStage || '').trim().toLowerCase();
      const paySt = String(o.paymentStatus || '').trim().toLowerCase();
      return (st === 'delivered' || st === 'payment completed' || st === 'partially paid') && paySt !== 'paid';
    }).map(o => ({
      id: o.id || o.orderNo,
      order_number: o.orderNo || o.id,
      customer_name: o.customerName || o.customer?.name || 'ABC Infrastructure Pvt Ltd',
      grand_total: o.totalAmount || o.totalValue || 207000,
      verified_paid_amount: o.verifiedPaidAmount || o.payment?.paid || 0,
      balance_amount: o.balanceAmount !== undefined ? o.balanceAmount : Math.max(0, (o.totalAmount || 207000) - (o.verifiedPaidAmount || 0)),
      payment_status: o.paymentStatus || 'AWAITING_PAYMENT',
      delivered_at: o.deliveredAt || o.actualDeliveryDate || new Date().toISOString()
    }));

    const map = new Map();
    localDelivered.forEach(r => map.set(String(r.order_number).toLowerCase(), r));
    apiRows.forEach(r => map.set(String(r.order_number || r.id).toLowerCase(), r));
    const rows = Array.from(map.values());`;

const newPending = `  const pendingRows = useMemo(() => {
    const apiRows = pendingCollection || [];
    
    // 1. Process standard orders from state
    const localDelivered = (orders || []).filter(o => {
      const st = String(o.orderStatus || o.status || o.overallStage || '').trim().toLowerCase();
      const paySt = String(o.paymentStatus || '').trim().toLowerCase();
      return (st === 'delivered' || st === 'payment completed' || st === 'partially paid') && paySt !== 'paid';
    }).map(o => ({
      id: o.id || o.orderNo,
      order_number: o.orderNo || o.id,
      customer_name: o.customerName || o.customer?.name || 'ABC Infrastructure Pvt Ltd',
      grand_total: o.totalAmount || o.totalValue || 207000,
      verified_paid_amount: o.verifiedPaidAmount || o.payment?.paid || 0,
      balance_amount: o.balanceAmount !== undefined ? o.balanceAmount : Math.max(0, (o.totalAmount || 207000) - (o.verifiedPaidAmount || 0)),
      payment_status: o.paymentStatus || 'AWAITING_PAYMENT',
      delivered_at: o.deliveredAt || o.actualDeliveryDate || new Date().toISOString()
    }));

    // 2. Process our new local storage delivered records
    let erpDelivered = [];
    if (typeof window !== 'undefined') {
      try {
        erpDelivered = JSON.parse(localStorage.getItem('erp_delivered_orders') || '[]');
      } catch (e) {}
    }
    
    const erpMapped = erpDelivered.map(ld => {
      const origOrder = (orders || []).find(o => String(o.orderNo) === String(ld.orderId) || String(o.orderNo) === String(ld.workOrderNo) || String(o.id) === String(ld.orderId));
      
      const totalAmount = origOrder?.totalOrderValue || origOrder?.totalAmount || origOrder?.totalValue || 145000;
      const paid = origOrder?.verifiedPaidAmount || origOrder?.payment?.paid || 0;
      
      return {
        id: ld.id,
        order_number: ld.orderId || ld.workOrderNo || ld.id,
        customer_name: ld.customerName || origOrder?.customerName || origOrder?.customer?.name || 'Unknown Customer',
        grand_total: totalAmount,
        verified_paid_amount: paid,
        balance_amount: totalAmount - paid,
        payment_status: 'AWAITING_PAYMENT',
        delivered_at: ld.actualDeliveryDate || ld.dispatchDate || new Date().toISOString()
      };
    });

    const map = new Map();
    localDelivered.forEach(r => map.set(String(r.order_number).toLowerCase(), r));
    erpMapped.forEach(r => map.set(String(r.order_number).toLowerCase(), r));
    
    // Filter out our poorly formatted injected apiRows from previous step if they exist
    apiRows.forEach(r => {
      if (r.order_number && String(r.order_number).startsWith('DSP-')) return;
      if (r.grand_total === 0) return; 
      map.set(String(r.order_number || r.id).toLowerCase(), r);
    });
    
    const rows = Array.from(map.values());`;

content = content.replace(oldPending, newPending);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed pendingRows in PaymentFollowupERPView');
