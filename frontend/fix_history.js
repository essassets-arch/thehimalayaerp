const fs = require('fs');
const filePath = 'd:/prototype-next/modules/dispatch/pages/DispatchPortal.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Inject hook for local history
const hookOld = `  const orders = state.orders || [];
  const dispatches = state.dispatches || [];`;

const hookNew = `  const orders = state.orders || [];
  const dispatches = state.dispatches || [];
  const [localHistory, setLocalHistory] = React.useState([]);

  React.useEffect(() => {
    setLocalHistory(JSON.parse(localStorage.getItem('erp_delivered_orders') || '[]'));
  }, []);`;

content = content.replace(hookOld, hookNew);

// Replace mapping logic in renderDispatchHistory
const oldHistoryMapping = `    const orderDispatchesMapped = dispatches.map(d => ({
      id: d.id,
      dbId: d.dbId || d.id,
      orderNo: d.orderNo || \`ORD-\${d.sales_order_id}\`,
      customerName: d.customerName || 'N/A',
      vehicleNo: d.vehicleNo || '-',
      driverName: d.driverName || '-',
      quantity: d.quantity || 0,
      unit: 'Tons',
      status: d.status,
      date: d.date || '-',
      isSample: false,
      _raw: d
    }));`;

const newHistoryMapping = `    // Combine legacy backend dummy records with new local storage records
    const allDispatches = [...localHistory, ...dispatches.filter(d => !localHistory.some(lh => lh.id === d.id))];
    const orderDispatchesMapped = allDispatches.map(d => ({
      id: String(d.dispatchId || d.id).startsWith('DSP-') ? (d.dispatchId || d.id) : \`DSP-\${d.dispatchId || d.id}\`,
      dbId: d.dbId || d.id,
      orderNo: d.workOrderNo || d.orderNo || \`ORD-\${d.sales_order_id}\`,
      customerName: d.customerName || 'N/A',
      vehicleNo: d.vehicleNumber || d.vehicleNo || '-',
      driverName: d.driverName || '-',
      quantity: d.dispatchQuantity || d.qcApprovedQuantity || d.quantity || 0,
      unit: 'Units',
      status: d.status || d.dispatchStatus || 'Delivered',
      date: d.actualDeliveryDate || d.dispatchDate || d.date || '-',
      isSample: false,
      _raw: d
    }));`;

content = content.replace(oldHistoryMapping, newHistoryMapping);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed history mapping in DispatchPortal');
