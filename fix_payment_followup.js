const fs = require('fs');
const filePath = 'd:/prototype-next/components/PaymentFollowupERPView.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace refreshPending
const oldRefresh = `  const refreshPending = async () => {
    setLoadingPending(true);
    try {
      const res = await apiClient.get('/sales/orders/delivered/pending-payment');
      setPendingCollection(res?.success ? res.data : []);
    } catch (err) {
      console.error(err);
      setPendingCollection([]);
    } finally {
      setLoadingPending(false);
    }
  };`;

const newRefresh = `  const refreshPending = async () => {
    setLoadingPending(true);
    try {
      const res = await apiClient.get('/sales/orders/delivered/pending-payment');
      const apiData = res?.success ? res.data : [];
      
      const localDelivered = JSON.parse(localStorage.getItem('erp_delivered_orders') || '[]');
      
      const merged = [...apiData];
      for (const ld of localDelivered) {
        if (!merged.some(m => m.id === ld.id)) {
          // Look up original order for total amount if possible
          const origOrder = orders.find(o => o.orderNo === ld.orderId || o.orderNo === ld.workOrderNo || o.id === ld.orderId);
          merged.push({
            id: ld.id,
            order_number: ld.orderId || ld.workOrderNo || ld.id,
            customer_name: ld.customerName || 'N/A',
            grand_total: origOrder?.totalOrderValue || origOrder?.totalAmount || 145000,
            verified_paid_amount: origOrder?.verifiedPaidAmount || 0,
            balance_amount: (origOrder?.totalOrderValue || origOrder?.totalAmount || 145000) - (origOrder?.verifiedPaidAmount || 0),
            payment_status: 'AWAITING_PAYMENT',
            delivered_at: ld.actualDeliveryDate || ld.dispatchDate || new Date().toISOString()
          });
        }
      }
      
      setPendingCollection(merged);
    } catch (err) {
      console.error(err);
      setPendingCollection([]);
    } finally {
      setLoadingPending(false);
    }
  };`;

content = content.replace(oldRefresh, newRefresh);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed refreshPending in PaymentFollowupERPView');
