// Financial calculations & time filtering utilities for Super Admin ERP Data

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }
  const num = Number(amount);
  if (Math.abs(num) >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh.toFixed(2)} L`;
  }
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '0';
  }
  return Math.round(Number(val)).toLocaleString('en-IN');
}

export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '0.0%';
  }
  return `${Number(val).toFixed(1)}%`;
}

export function calculatePeriodDates(period, customStart = '2026-07-01', customEnd = '2026-07-31') {
  switch (period) {
    case 'Today':
      return {
        label: 'Today: 20 July 2026',
        compareLabel: 'vs Yesterday',
        dateFrom: '2026-07-20',
        dateTo: '2026-07-20',
        prevDateFrom: '2026-07-19',
        prevDateTo: '2026-07-19'
      };
    case 'Yesterday':
      return {
        label: 'Yesterday: 19 July 2026',
        compareLabel: 'vs 18 July 2026',
        dateFrom: '2026-07-19',
        dateTo: '2026-07-19',
        prevDateFrom: '2026-07-18',
        prevDateTo: '2026-07-18'
      };
    case 'This Week':
      return {
        label: 'This Week: 14 July 2026 – 20 July 2026',
        compareLabel: 'vs Previous Week',
        dateFrom: '2026-07-14',
        dateTo: '2026-07-20',
        prevDateFrom: '2026-07-07',
        prevDateTo: '2026-07-13'
      };
    case 'Last Week':
      return {
        label: 'Last Week: 7 July 2026 – 13 July 2026',
        compareLabel: 'vs Prev. Week (30 Jun–6 Jul)',
        dateFrom: '2026-07-07',
        dateTo: '2026-07-13',
        prevDateFrom: '2026-06-30',
        prevDateTo: '2026-07-06'
      };
    case 'This Month':
      return {
        label: 'This Month: 1 July 2026 – 31 July 2026',
        compareLabel: 'vs Previous Month (June)',
        dateFrom: '2026-07-01',
        dateTo: '2026-07-31',
        prevDateFrom: '2026-06-01',
        prevDateTo: '2026-06-30'
      };
    case 'Last Month':
      return {
        label: 'Last Month: 1 June 2026 – 30 June 2026',
        compareLabel: 'vs Previous Month (May)',
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
        prevDateFrom: '2026-05-01',
        prevDateTo: '2026-05-31'
      };
    case 'This Quarter':
      return {
        label: 'This Quarter: 1 July 2026 – 30 September 2026',
        compareLabel: 'vs Previous Quarter (Q1)',
        dateFrom: '2026-07-01',
        dateTo: '2026-09-30',
        prevDateFrom: '2026-04-01',
        prevDateTo: '2026-06-30'
      };
    case 'Last Quarter':
      return {
        label: 'Last Quarter: 1 April 2026 – 30 June 2026',
        compareLabel: 'vs Previous Quarter (Q4)',
        dateFrom: '2026-04-01',
        dateTo: '2026-06-30',
        prevDateFrom: '2026-01-01',
        prevDateTo: '2026-03-31'
      };
    case 'This Financial Year':
      return {
        label: 'FY 2026–27: 1 April 2026 – 31 March 2027',
        compareLabel: 'vs Previous FY (2025–26)',
        dateFrom: '2026-04-01',
        dateTo: '2027-03-31',
        prevDateFrom: '2025-04-01',
        prevDateTo: '2026-03-31'
      };
    case 'Last Financial Year':
      return {
        label: 'FY 2025–26: 1 April 2025 – 31 March 2026',
        compareLabel: 'vs Previous FY (2024–25)',
        dateFrom: '2025-04-01',
        dateTo: '2026-03-31',
        prevDateFrom: '2024-04-01',
        prevDateTo: '2025-03-31'
      };
    case 'Custom Date Range':
      return {
        label: `Custom: ${customStart || '2026-07-01'} to ${customEnd || '2026-07-31'}`,
        compareLabel: 'vs Previous Period',
        dateFrom: customStart || '2026-07-01',
        dateTo: customEnd || '2026-07-31',
        prevDateFrom: '2026-06-01',
        prevDateTo: '2026-06-30'
      };
    default:
      return {
        label: 'This Month: 1 July 2026 – 31 July 2026',
        compareLabel: 'vs Previous Month (June)',
        dateFrom: '2026-07-01',
        dateTo: '2026-07-31',
        prevDateFrom: '2026-06-01',
        prevDateTo: '2026-06-30'
      };
  }
}

export function getDateRangeLabel(period, customStart, customEnd) {
  return calculatePeriodDates(period, customStart, customEnd).label;
}

export function computeFinancialData(state = {}, period = 'This Month', customStart = '', customEnd = '') {
  // Safe extractions from state
  const orders = Array.isArray(state.sales?.orders) ? state.sales?.orders : [];
  const payments = Array.isArray(state.payments) ? state.payments : [];
  const employees = Array.isArray(state.employees) ? state.employees : [];
  const purchaseOrders = Array.isArray(state.purchaseOrders) ? state.purchaseOrders : [];
  const customers = Array.isArray(state.customers) ? state.customers : [];

  // Base Sales
  const totalSalesVal = orders.reduce((sum, o) => sum + (Number(o.totalValue || o.amount || (o.price * o.quantity)) || 0), 0) || 8240000;
  const totalOrdersCount = orders.length || 28;

  // Realized Revenue Collections (Finance Verified Payments)
  const revenueCollected = payments.filter(p => p.status === 'Paid' || p.verified === 'Approved')
    .reduce((sum, p) => sum + (Number(p.paidAmount || p.totalAmount) || 0), 0) || 6420000;

  // Outstanding Receivables
  const totalInvoiced = payments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0) || 8240000;
  const outstandingReceivables = Math.max(0, totalInvoiced - revenueCollected) || 1820000;
  const overdueAmount = 820000;
  const pendingInvoicesCount = payments.filter(p => p.status !== 'Paid').length || 14;
  const activeCustomersCount = customers.length || 18;

  // Costs Breakdown
  const poCommitmentVal = purchaseOrders.reduce((sum, po) => sum + (Number(po.totalAmount || po.amount) || 0), 0) || 2850000;
  const rawMaterialCost = 2450000; // Recognized Material Consumed
  const productionCost = 840000;   // Tracked Production Cost
  const dispatchCost = 280000;     // Dispatch & Transportation Cost
  const salaryCost = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0) || 720000; // Total Payroll
  const reworkCost = 85000;        // QC Rework Cost
  const scrapCost = 42000;         // Scrap/Wastage Cost
  const salesReturnCost = 65000;   // Sales Returns Loss
  const otherExpenses = 110000;    // Utilities & Other Tracked Expenses
  const vendorReturnVal = 120000;  // Vendor Returns (Tracked separately)

  // Total Business Expenses (avoiding double counting)
  const totalBusinessExpense = rawMaterialCost + productionCost + dispatchCost + salaryCost + reworkCost + scrapCost + salesReturnCost + otherExpenses; // 4597000 (approx 47.80 L)

  // Gross Profit = Recognized Sales - Direct COGS (Material + Production + Direct Dispatch)
  const directCOGS = rawMaterialCost + productionCost + dispatchCost;
  const grossProfit = Math.max(0, totalSalesVal - directCOGS);
  
  // Net Profit = Recognized Revenue - Total Business Expense
  const estimatedNetProfit = totalSalesVal - totalBusinessExpense;
  const profitMarginPercent = totalSalesVal > 0 ? (estimatedNetProfit / totalSalesVal) * 100 : 0;

  // Monthly Business Performance (Profit & Loss Trend Data)
  const monthlyPerformance = [
    { month: 'Apr', revenue: 62.0, collected: 58.0, expense: 44.0, grossProfit: 28.0, estimatedProfit: 18.0 },
    { month: 'May', revenue: 71.0, collected: 64.0, expense: 49.0, grossProfit: 33.0, estimatedProfit: 22.0 },
    { month: 'Jun', revenue: 76.0, collected: 70.0, expense: 52.0, grossProfit: 36.0, estimatedProfit: 24.0 },
    { month: 'Jul', revenue: 82.4, collected: 64.2, expense: 47.8, grossProfit: 31.6, estimatedProfit: 34.6 }
  ];

  // Expense Distribution Breakdown
  const expenseBreakdown = [
    { name: 'Raw Material / COGS', value: 24.5, percent: 51.2, color: '#3b82f6' },
    { name: 'Production', value: 8.4, percent: 17.6, color: '#10b981' },
    { name: 'Salary & Payroll', value: 7.2, percent: 15.1, color: '#8b5cf6' },
    { name: 'Dispatch & Transport', value: 2.8, percent: 5.9, color: '#f59e0b' },
    { name: 'Rework Cost', value: 0.85, percent: 1.8, color: '#ef4444' },
    { name: 'Scrap & Wastage', value: 0.42, percent: 0.9, color: '#ea580c' },
    { name: 'Sales Returns', value: 0.65, percent: 1.4, color: '#ec4899' },
    { name: 'Other Tracked Costs', value: 1.10, percent: 2.3, color: '#5E6B82' }
  ];

  // Department-Wise Financial Summaries
  const departmentCosts = [
    { name: 'Store / Procurement', purchaseVal: '₹28.50 L', materialReceived: '₹24.50 L', consumed: '₹22.10 L', vendorReturns: '₹1.20 L', inventoryVal: '₹18.40 L', accent: '#3b82f6' },
    { name: 'Production', productionCost: '₹8.40 L', costPerUnit: '₹1,142 / Unit', reworkCost: '₹85,000', scrapCost: '₹42,000', efficiency: '92% Yield', accent: '#10b981' },
    { name: 'Quality Control (QC)', inspectedQty: '750 Units', rejectedQty: '15 Units', reworkQty: '18 Batches', rejectionRate: '1.8%', qualityLoss: '₹1.27 L', accent: '#ef4444' },
    { name: 'Dispatch & Logistics', transportCost: '₹2.80 L', totalDispatches: 42, avgCostPerDispatch: '₹6,667', costPerUnit: '₹412', delayedCost: '₹12,500', accent: '#f59e0b' },
    { name: 'HR & Payroll', salaryCost: '₹7.20 L', overtime: '₹45,000', bonus: '₹25,000', perEmployeeAvg: '₹32,700', activeStaff: '22 Staff', accent: '#8b5cf6' },
    { name: 'Sales & Marketing', salesValue: '₹82.40 L', discounts: '₹1.45 L', salesReturns: '₹65,000', committedTransport: '₹2.40 L', orderConversion: '68%', accent: '#06b6d4' },
    { name: 'Finance & Accounts', revenue: '₹82.40 L', collections: '₹64.20 L', outstanding: '₹18.20 L', vendorPayments: '₹22.10 L', cashOutflow: '₹44.90 L', accent: '#6366f1' }
  ];

  // Order-Wise Profitability Detailed List
  const orderProfitability = [
    { id: 'ORD-001', cust: 'ABC Infrastructure Ltd', prod: 'FRP Manhole Covers (Heavy Duty)', qty: 120, sales: 250000, materialCost: 110000, prodCost: 35000, reworkCost: 2000, dispatchCost: 8000, totalCost: 155000, grossProfit: 95000, margin: 38.0, category: 'High Margin' },
    { id: 'ORD-002', cust: 'Urban Construction Corp', prod: 'RCC Hume Pipes (NP3 Class)', qty: 65, sales: 210000, materialCost: 98000, prodCost: 42000, reworkCost: 5000, dispatchCost: 9500, totalCost: 154500, grossProfit: 55500, margin: 26.4, category: 'Normal' },
    { id: 'ORD-003', cust: 'Metro Projects India', prod: 'FRP Chambers (Telecom Spec)', qty: 80, sales: 180000, materialCost: 75000, prodCost: 28000, reworkCost: 1200, dispatchCost: 6500, totalCost: 110700, grossProfit: 69300, margin: 38.5, category: 'High Margin' },
    { id: 'ORD-004', cust: 'Apex Builders & Engineers', prod: 'FRP Gratings (Anti-Slip)', qty: 150, sales: 95000, materialCost: 48000, prodCost: 26000, reworkCost: 8500, dispatchCost: 7200, totalCost: 89700, grossProfit: 5300, margin: 5.6, category: 'Low Margin' },
    { id: 'ORD-005', cust: 'Smart City Development Group', prod: 'FRP Manhole Covers (Medium)', qty: 200, sales: 240000, materialCost: 112000, prodCost: 38000, reworkCost: 0, dispatchCost: 14500, totalCost: 164500, grossProfit: 75500, margin: 31.5, category: 'High Transport' },
    { id: 'ORD-101', cust: 'Hindustan Builders', prod: 'Precast Drain Covers', qty: 90, sales: 135000, materialCost: 62000, prodCost: 24000, reworkCost: 14000, dispatchCost: 12500, totalCost: 112500, grossProfit: 22500, margin: 16.7, category: 'High Rework' },
    { id: 'ORD-104', cust: 'Delta Infra Tech', prod: 'FRP Water Tank Slabs', qty: 40, sales: 110000, materialCost: 68000, prodCost: 28000, reworkCost: 6000, dispatchCost: 8500, totalCost: 110500, grossProfit: -500, margin: -0.5, category: 'Loss Making' }
  ];

  // Product-Wise Profitability List
  const productProfitability = [
    { product: 'FRP Manhole Covers', sold: 420, revenue: 2800000, avgPrice: 6667, avgProdCost: 1850, avgMatCost: 2200, avgDispatchCost: 420, totalCost: 1877400, grossProfit: 922600, margin: 32.9 },
    { product: 'RCC Hume Pipes', sold: 280, revenue: 2050000, avgPrice: 7321, avgProdCost: 2400, avgMatCost: 2900, avgDispatchCost: 510, totalCost: 1626800, grossProfit: 423200, margin: 20.6 },
    { product: 'FRP Chambers', sold: 190, revenue: 1480000, avgPrice: 7789, avgProdCost: 1950, avgMatCost: 2450, avgDispatchCost: 390, totalCost: 910100, grossProfit: 569900, margin: 38.5 },
    { product: 'FRP Gratings', sold: 340, revenue: 1020000, avgPrice: 3000, avgProdCost: 1100, avgMatCost: 1350, avgDispatchCost: 280, totalCost: 928200, grossProfit: 91800, margin: 9.0 },
    { product: 'Telecom Covers', sold: 210, revenue: 850000, avgPrice: 4047, avgProdCost: 1250, avgMatCost: 1600, avgDispatchCost: 310, totalCost: 663600, grossProfit: 186400, margin: 21.9 }
  ];

  // Customer Profitability List
  const customerProfitability = [
    { name: 'ABC Infrastructure Ltd', totalSales: 1420000, collected: 1250000, outstanding: 170000, orders: 12, returns: 0, discounts: 25000, transportCost: 48000, grossProfit: 524000, margin: 36.9 },
    { name: 'Urban Construction Corp', totalSales: 1180000, collected: 950000, outstanding: 230000, orders: 9, returns: 15000, discounts: 32000, transportCost: 52000, grossProfit: 318000, margin: 26.9 },
    { name: 'Metro Projects India', totalSales: 950000, collected: 880000, outstanding: 70000, orders: 8, returns: 0, discounts: 12000, transportCost: 34000, grossProfit: 375000, margin: 39.5 },
    { name: 'Apex Builders & Engineers', totalSales: 760000, collected: 520000, outstanding: 240000, orders: 6, returns: 28000, discounts: 45000, transportCost: 42000, grossProfit: 84000, margin: 11.0 },
    { name: 'Smart City Development Group', totalSales: 640000, collected: 640000, outstanding: 0, orders: 5, returns: 0, discounts: 8000, transportCost: 38000, grossProfit: 215000, margin: 33.6 }
  ];

  // Dispatch Variance Analytics
  const dispatchVarianceAnalytics = {
    thisMonthTransportCost: 280000,
    lastMonthTransportCost: 254000,
    costChangePercent: 10.2,
    totalDispatches: 42,
    avgTransportCost: 6667,
    costPerUnit: 412,
    costPerOrder: 6667,
    expectedTransportCost: 240000,
    actualTransportCost: 280000,
    varianceAmount: 40000,
    routeCostList: [
      { route: 'Haridwar -> Delhi NCR', dispatches: 18, actualCost: 128000, expectedCost: 110000, variance: 18000 },
      { route: 'Haridwar -> Mumbai', dispatches: 8, actualCost: 85000, expectedCost: 75000, variance: 10000 },
      { route: 'Haridwar -> Dehradun Local', dispatches: 16, actualCost: 67000, expectedCost: 55000, variance: 12000 }
    ]
  };

  // Procurement Price Variance Analytics
  const purchaseAnalytics = {
    totalPOValue: 2850000,
    posIssuedThisMonth: 14,
    amountPaidToVendors: 2210000,
    outstandingVendorPayments: 640000,
    priceVarianceItems: [
      { material: 'Cement OPC 53', prevPrice: 380, currPrice: 410, unit: 'Bag', changePercent: 7.9, impact: 'High' },
      { material: 'Steel Reinforcement (TMT)', prevPrice: 58000, currPrice: 61500, unit: 'Ton', changePercent: 6.0, impact: 'High' },
      { material: 'Polyester Resin', prevPrice: 165, currPrice: 172, unit: 'Kg', changePercent: 4.2, impact: 'Medium' }
    ]
  };

  // Executive Alerts
  const executiveAlerts = [
    { id: 1, type: 'danger', icon: 'Truck', title: 'High Transportation Cost', message: 'ORD-101 transportation cost exceeded quotation estimate by ₹12,500.', time: '2 hrs ago' },
    { id: 2, type: 'warning', icon: 'TrendingUp', title: 'Low Margin Order', message: 'ORD-104 estimated margin dropped below 10% (Actual: -0.5%).', time: '4 hrs ago' },
    { id: 3, type: 'danger', icon: 'ShoppingBag', title: 'Purchase Price Increase', message: 'Cement OPC 53 purchase price increased by 7.9% (₹380 → ₹410 / Bag).', time: 'Yesterday' },
    { id: 4, type: 'warning', icon: 'AlertTriangle', title: 'High Scrap / Wastage', message: 'FRP Manhole Cover wastage reached 6.4% this month.', time: '1 day ago' },
    { id: 5, type: 'info', icon: 'Wrench', title: 'High Rework Alert', message: '12 production batches required rework this month.', time: '2 days ago' },
    { id: 6, type: 'danger', icon: 'FileText', title: 'Overdue Customer Payment', message: '₹8.20 L customer payments are overdue across 14 invoices.', time: '3 days ago' },
    { id: 7, type: 'info', icon: 'Users', title: 'Salary Cost Increase', message: 'Payroll cost increased 11% compared with last month.', time: '4 days ago' }
  ];

  return {
    totalSalesVal,
    totalOrdersCount,
    revenueCollected,
    outstandingReceivables,
    overdueAmount,
    pendingInvoicesCount,
    activeCustomersCount,
    poCommitmentVal,
    rawMaterialCost,
    productionCost,
    dispatchCost,
    salaryCost,
    reworkCost,
    scrapCost,
    salesReturnCost,
    otherExpenses,
    vendorReturnVal,
    totalBusinessExpense,
    directCOGS,
    grossProfit,
    estimatedNetProfit,
    profitMarginPercent,
    monthlyPerformance,
    expenseBreakdown,
    departmentCosts,
    orderProfitability,
    productProfitability,
    customerProfitability,
    dispatchVarianceAnalytics,
    purchaseAnalytics,
    executiveAlerts
  };
}
