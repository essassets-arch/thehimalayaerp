
// --- Procurement Analytics Selector ---
export const getProcurementAnalytics = (state: any) => {
  const purchaseIndents = state.purchaseIndents || [];
  const purchaseOrders = state.purchaseOrders || [];
  const goodsReceipts = state.goodsReceipts || [];
  const vendorPayments = state.vendorPayments || [];

  const openIndentsCount = purchaseIndents.filter((ind: any) => ind.status === 'PENDING_PLANT_HEAD_APPROVAL').length;
  const pendingSuperAdminPOsCount = purchaseOrders.filter((po: any) => po.status === 'PENDING_SUPER_ADMIN_APPROVAL').length;
  const pendingGRNsCount = goodsReceipts.filter((grn: any) => grn.status === 'GRN_SUBMITTED').length;

  let totalReceived = 0;
  let totalRejected = 0;
  goodsReceipts.forEach((grn: any) => {
    if (grn.status !== 'GRN_DRAFT' && grn.status !== 'QUALITY_REJECTED') {
      totalReceived += Number(grn.receivedQty || 0);
      totalRejected += Number(grn.rejectedQty || 0);
    }
    if (grn.status === 'QUALITY_REJECTED') {
      totalReceived += Number(grn.receivedQty || 0);
      totalRejected += Number(grn.receivedQty || 0);
    }
  });
  const qcRejectionRate = totalReceived > 0 ? ((totalRejected / totalReceived) * 100).toFixed(1) : "0.0";

  let onTimeCount = 0;
  let totalDeliveredPOs = 0;
  let leadTimeSum = 0;
  
  purchaseOrders.forEach((po: any) => {
    const poGRNs = goodsReceipts.filter((g: any) => g.purchaseOrderId === po.id || g.purchaseOrderId === po.poNumber);
    if (poGRNs.length > 0 && po.issuedAt) {
      totalDeliveredPOs++;
      const firstGRN = poGRNs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      const deliveryDate = po.vendorResponse?.expectedDeliveryDate || po.deliveryDate;
      if (deliveryDate && new Date(firstGRN.createdAt) <= new Date(deliveryDate)) {
        onTimeCount++;
      }
      const days = (new Date(firstGRN.createdAt).getTime() - new Date(po.issuedAt).getTime()) / (1000 * 3600 * 24);
      if (days >= 0) leadTimeSum += days;
    }
  });
  
  const vendorOnTimeDeliveryRate = totalDeliveredPOs > 0 ? ((onTimeCount / totalDeliveredPOs) * 100).toFixed(1) : "100.0";
  const averageLeadTimeDays = totalDeliveredPOs > 0 ? (leadTimeSum / totalDeliveredPOs).toFixed(1) : "0.0";

  const outstandingPaymentsTotal = vendorPayments.filter((vp: any) => vp.status === 'PAYMENT_PENDING').reduce((acc: any, vp: any) => acc + (Number(vp.amount) || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const monthlyProcurementSpend = purchaseOrders
    .filter((po: any) => (po.status === 'PO_ISSUED' || po.status === 'VENDOR_ACCEPTED' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'STOCK_POSTED' || po.status === 'PAYMENT_PENDING' || po.status === 'PAYMENT_COMPLETED' || po.status === 'PO_CLOSED') && new Date(po.issuedAt || po.createdAt).getMonth() === currentMonth)
    .reduce((acc: any, po: any) => acc + (Number(po.grandTotal) || 0), 0);

  return {
    openIndentsCount,
    pendingSuperAdminPOsCount,
    pendingGRNsCount,
    qcRejectionRate,
    vendorOnTimeDeliveryRate,
    averageLeadTimeDays,
    outstandingPaymentsTotal,
    monthlyProcurementSpend
  };
};
