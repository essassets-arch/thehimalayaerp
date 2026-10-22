'use client';

// ── Financial Color Palette ──
export const PALETTE = {
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  rose: '#EF4444',
  roseLight: '#FEF2F2',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  cyan: '#06B6D4',
  cyanLight: '#ECFEFF',
  slate: '#0F172A',
  slateMuted: '#64748B',
  border: '#E2E8F0',
  cardBg: '#FFFFFF',
};

// ── Standardized Currency Formatters ──
export const formatINR = (val) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatShortINR = (val) => {
  const num = Number(val || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${num.toFixed(0)}`;
};

// ── Date Extraction & Range Boundaries ──
export const getRecordDate = (record, fields) => {
  for (const field of fields) {
    const value = record?.[field];
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

// ── Indian Fiscal Quarters (Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar) ──
export const getFiscalQuarterInfo = (now = new Date()) => {
  const m = now.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Dec
  const fyStartYear = m >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fyEndYear = fyStartYear + 1;
  const fyLabel = `FY ${fyStartYear}–${String(fyEndYear).slice(-2)}`;

  let currentQuarterKey = 'Q3';
  if (m >= 3 && m <= 5) currentQuarterKey = 'Q1';
  else if (m >= 6 && m <= 8) currentQuarterKey = 'Q2';
  else if (m >= 9 && m <= 11) currentQuarterKey = 'Q3';
  else currentQuarterKey = 'Q4';

  const quarters = [
    {
      id: 'Q1',
      quarterNumber: 1,
      name: 'Q1',
      label: 'Q1 (Apr – Jun)',
      periodText: '1 Apr – 30 Jun',
      start: new Date(fyStartYear, 3, 1, 0, 0, 0, 0),
      end: new Date(fyStartYear, 5, 30, 23, 59, 59, 999),
      isCurrent: currentQuarterKey === 'Q1',
    },
    {
      id: 'Q2',
      quarterNumber: 2,
      name: 'Q2',
      label: 'Q2 (Jul – Sep)',
      periodText: '1 Jul – 30 Sep',
      start: new Date(fyStartYear, 6, 1, 0, 0, 0, 0),
      end: new Date(fyStartYear, 8, 30, 23, 59, 59, 999),
      isCurrent: currentQuarterKey === 'Q2',
    },
    {
      id: 'Q3',
      quarterNumber: 3,
      name: 'Q3',
      label: 'Q3 (Oct – Dec)',
      periodText: '1 Oct – 31 Dec',
      start: new Date(fyStartYear, 9, 1, 0, 0, 0, 0),
      end: new Date(fyStartYear, 11, 31, 23, 59, 59, 999),
      isCurrent: currentQuarterKey === 'Q3',
    },
    {
      id: 'Q4',
      quarterNumber: 4,
      name: 'Q4',
      label: 'Q4 (Jan – Mar)',
      periodText: '1 Jan – 31 Mar',
      start: new Date(fyEndYear, 0, 1, 0, 0, 0, 0),
      end: new Date(fyEndYear, 2, 31, 23, 59, 59, 999),
      isCurrent: currentQuarterKey === 'Q4',
    }
  ];

  const currentQ = quarters.find(q => q.id === currentQuarterKey) || quarters[0];

  let prevQ;
  if (currentQuarterKey === 'Q1') {
    prevQ = {
      id: 'PREV_Q',
      quarterNumber: 4,
      name: 'Q4 (Prev FY)',
      label: 'Previous Quarter (Q4)',
      periodText: `1 Jan – 31 Mar (${fyStartYear})`,
      start: new Date(fyStartYear, 0, 1, 0, 0, 0, 0),
      end: new Date(fyStartYear, 2, 31, 23, 59, 59, 999),
      isCurrent: false,
      isPrevious: true
    };
  } else {
    const prevIndex = quarters.findIndex(q => q.id === currentQuarterKey) - 1;
    const basePrev = quarters[prevIndex];
    prevQ = {
      ...basePrev,
      id: 'PREV_Q',
      label: `Previous Quarter (${basePrev.name})`,
      periodText: basePrev.periodText,
      isCurrent: false,
      isPrevious: true
    };
  }

  return {
    fyStartYear,
    fyEndYear,
    fyLabel,
    currentQuarterKey,
    currentQ,
    prevQ,
    quarters
  };
};

export const getRangeBounds = (range, now = new Date(), customStart = '', customEnd = '', quarterChoice = '') => {
  if (range === 'CUSTOM') {
    const start = customStart ? new Date(`${customStart}T00:00:00`) : new Date(NaN);
    const end = customEnd ? new Date(`${customEnd}T23:59:59.999`) : new Date(NaN);
    return { start, end };
  }

  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (range === '30D') {
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const fiscalInfo = getFiscalQuarterInfo(now);
  const yearStart = fiscalInfo.fyStartYear;
  const fiscalStart = new Date(yearStart, 3, 1, 0, 0, 0, 0);
  const fiscalEnd = new Date(yearStart + 1, 2, 31, 23, 59, 59, 999);

  if (range === '1Y') return { start: fiscalStart, end: fiscalEnd };
  if (range === '6M') {
    const halfStart = now.getMonth() >= 3 ? new Date(yearStart, 3, 1, 0, 0, 0, 0) : new Date(yearStart, 9, 1, 0, 0, 0, 0);
    const halfEnd = now.getMonth() >= 3
      ? new Date(yearStart, 8, 30, 23, 59, 59, 999)
      : new Date(yearStart + 1, 2, 31, 23, 59, 59, 999);
    return { start: halfStart, end: halfEnd };
  }

  // Quarter selection (90D, QUARTER, Q1, Q2, Q3, Q4, PREV_Q)
  const qKey = (quarterChoice || (range !== '90D' && range !== 'QUARTER' ? range : 'CURRENT')).toUpperCase();
  if (qKey === 'Q1') {
    const q1 = fiscalInfo.quarters.find(q => q.id === 'Q1');
    return { start: q1.start, end: q1.end };
  }
  if (qKey === 'Q2') {
    const q2 = fiscalInfo.quarters.find(q => q.id === 'Q2');
    return { start: q2.start, end: q2.end };
  }
  if (qKey === 'Q3') {
    const q3 = fiscalInfo.quarters.find(q => q.id === 'Q3');
    return { start: q3.start, end: q3.end };
  }
  if (qKey === 'Q4') {
    const q4 = fiscalInfo.quarters.find(q => q.id === 'Q4');
    return { start: q4.start, end: q4.end };
  }
  if (qKey === 'PREV_Q' || qKey === 'PREV' || qKey === 'PREVIOUS') {
    return { start: fiscalInfo.prevQ.start, end: fiscalInfo.prevQ.end };
  }

  // Default: Current Quarter
  return {
    start: fiscalInfo.currentQ.start,
    end: fiscalInfo.currentQ.end,
  };
};

export const isInRange = (record, fields, bounds) => {
  if (!bounds || !bounds.start || !bounds.end || isNaN(bounds.start.getTime()) || isNaN(bounds.end.getTime())) {
    return true;
  }
  const date = getRecordDate(record, fields);
  return Boolean(date && date >= bounds.start && date <= bounds.end);
};

export const getPeriodMeta = (timeRange, rangeBounds, quarterChoice = '', now = new Date()) => {
  const startLabel = rangeBounds.start && !isNaN(rangeBounds.start.getTime())
    ? rangeBounds.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const endLabel = rangeBounds.end && !isNaN(rangeBounds.end.getTime())
    ? rangeBounds.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const rangeLabel = startLabel && endLabel ? `${startLabel} – ${endLabel}` : '';
  const fiscalInfo = getFiscalQuarterInfo(now);
  const fyLabel = fiscalInfo.fyLabel;

  if (timeRange === '30D') {
    return { label: '30 Days', badge: `Last 30 Days (${rangeLabel})`, desc: rangeLabel };
  }
  if (timeRange === '6M') {
    return { label: '6 Months', badge: `Half Year (${rangeLabel})`, desc: rangeLabel };
  }
  if (timeRange === 'CUSTOM') {
    return { label: 'Custom', badge: `Custom Period (${rangeLabel})`, desc: rangeLabel };
  }
  if (timeRange === '1Y') {
    return { label: 'Full Year', badge: `Full Year (${fyLabel})`, desc: rangeLabel };
  }

  // Quarters
  const qKey = (quarterChoice || (timeRange !== '90D' && timeRange !== 'QUARTER' ? timeRange : 'CURRENT')).toUpperCase();
  if (qKey === 'PREV_Q' || qKey === 'PREV') {
    return {
      label: `Previous Quarter (${fiscalInfo.prevQ.name})`,
      badge: `Previous Quarter: ${fiscalInfo.prevQ.name} (${rangeLabel})`,
      desc: rangeLabel
    };
  }
  if (['Q1', 'Q2', 'Q3', 'Q4'].includes(qKey)) {
    return {
      label: `Quarter ${qKey}`,
      badge: `${qKey} (${rangeLabel})`,
      desc: rangeLabel
    };
  }

  return {
    label: `Quarter (${fiscalInfo.currentQuarterKey})`,
    badge: `Current Quarter (${fiscalInfo.currentQuarterKey}: ${rangeLabel})`,
    desc: rangeLabel
  };
};

// ── Generic Backend List Parser ──
export const parseList = (res) => {
  if (!res) return [];
  if (res.status && res.status !== 'fulfilled') return [];
  const v = res.value !== undefined ? res.value : res;
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (Array.isArray(v.items)) return v.items;
  if (Array.isArray(v.data)) return v.data;
  if (Array.isArray(v.data?.items)) return v.data.items;
  if (Array.isArray(v.data?.data)) return v.data.data;
  if (Array.isArray(v.records)) return v.records;
  return [];
};

// ── Deduplicate AR Invoices ──
export const deduplicateArInvoices = (applAr = [], hcpplAr = [], hcpplReg = [], finAr = [], fallbackPayments = [], fallbackInvoices = []) => {
  const combined = [
    ...(applAr || []),
    ...(hcpplAr || []),
    ...(hcpplReg || []),
    ...(finAr || [])
  ];
  const seen = new Set();
  const unique = [];
  for (const inv of combined) {
    const key = String(inv.invoiceNumber || inv.invoiceNo || inv.id || '');
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(inv);
    } else if (!key) {
      unique.push(inv);
    }
  }
  if (unique.length > 0) return unique;
  if (Array.isArray(fallbackPayments) && fallbackPayments.length > 0) return fallbackPayments;
  if (Array.isArray(fallbackInvoices) && fallbackInvoices.length > 0) return fallbackInvoices;
  return [];
};

// ── Period Comparison ──
export const calculatePeriodComparison = (rangeBounds, allArInvoices = [], filteredInvoices = [], filteredSalesOrders = [], salesOrders = []) => {
  if (!rangeBounds?.start || !rangeBounds?.end || isNaN(rangeBounds.start.getTime()) || isNaN(rangeBounds.end.getTime())) {
    return { label: 'Choose a valid custom date range', positive: null };
  }
  const duration = rangeBounds.end.getTime() - rangeBounds.start.getTime() + 1;
  if (!Number.isFinite(duration) || duration <= 0) return { label: 'Choose a valid custom date range', positive: null };
  const previousBounds = {
    start: new Date(rangeBounds.start.getTime() - duration),
    end: new Date(rangeBounds.start.getTime() - 1),
  };
  const sumAmounts = (records, fields) => records
    .filter((record) => isInRange(record, fields, previousBounds))
    .reduce((sum, record) => sum + Number(record.invoiceAmount || record.totalAmount || record.grand_total || 0), 0);
  const currentAmount = allArInvoices.length > 0
    ? filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0)
    : filteredSalesOrders.reduce((sum, order) => sum + Number(order.totalAmount || order.grand_total || 0), 0);
  const previousAmount = allArInvoices.length > 0
    ? sumAmounts(allArInvoices, ['invoiceDate', 'createdAt', 'date'])
    : sumAmounts(salesOrders, ['orderDate', 'createdAt', 'date']);
  if (!previousAmount) return { label: 'No previous-period data', positive: null };
  const change = ((currentAmount - previousAmount) / previousAmount) * 100;
  return { label: `${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs previous period`, positive: change >= 0 };
};

// ── Core Dynamic Metrics Aggregator ──
export const calculateDynamicMetrics = (filteredInvoices = [], filteredSalesOrders = [], filteredPurchaseOrders = [], timeRange, periodMeta, periodComparison) => {
  let revSum = 0;
  let collSum = 0;
  let outSum = 0;
  let overdueSum = 0;
  let overdueCount = 0;
  let unpaidCount = 0;

  const now = new Date();

  const activeInvoices = filteredInvoices.length > 0 ? filteredInvoices : [];
  const activeOrders = filteredSalesOrders.length > 0 ? filteredSalesOrders : [];

  if (activeInvoices.length > 0) {
    activeInvoices.forEach(inv => {
      const invAmt = Number(inv.invoiceAmount || 0);
      const rcvd = Number(inv.amtRcvd || 0);
      const out = Number(inv.outstanding !== undefined ? inv.outstanding : Math.max(0, invAmt - rcvd));

      revSum += invAmt;
      collSum += rcvd;
      outSum += out;

      if (out > 0) {
        unpaidCount++;
        const dueDate = new Date(inv.dueDate || inv.invoiceDate || now);
        if (dueDate < now) {
          overdueSum += out;
          overdueCount++;
        }
      }
    });
  } else if (activeOrders.length > 0) {
    activeOrders.forEach(o => {
      const tot = Number(o.totalAmount || o.grand_total || 0);
      const paid = Number(o.paidAmount || o.verified_paid_amount || 0);
      const out = Number(o.outstandingAmount !== undefined ? o.outstandingAmount : Math.max(0, tot - paid));

      revSum += tot;
      collSum += paid;
      outSum += out;

      if (out > 0) {
        unpaidCount++;
        const due = new Date(o.paymentDueDate || o.payment_due_date || o.orderDate || o.createdAt || now);
        if (due < now) {
          overdueSum += out;
          overdueCount++;
        }
      }
    });
  }

  const effNum = revSum > 0 ? Number(((collSum / revSum) * 100).toFixed(1)) : 0;
  const effRatio = effNum.toFixed(1);

  const poCount = filteredPurchaseOrders.length;
  const poTotal = filteredPurchaseOrders.reduce((s, p) => s + Number(p.totalAmount || 0), 0);

  const operatingSurplus = collSum - poTotal;

  const count = activeInvoices.length > 0 ? activeInvoices.length : activeOrders.length;

  return {
    totalRevenueStr: formatINR(revSum),
    totalRevenueRaw: revSum,
    totalCollectionsStr: formatINR(collSum),
    totalCollectionsRaw: collSum,
    outstandingReceivablesStr: formatINR(outSum),
    outstandingReceivablesRaw: outSum,
    overdueAmountStr: formatINR(overdueSum),
    overdueAmountRaw: overdueSum,
    unpaidInvoicesCount: unpaidCount,
    overdueInvoicesCount: overdueCount,
    collectionEfficiencyStr: `${effRatio}%`,
    effRatio: effNum,
    netProfitStr: formatINR(operatingSurplus),
    vendorPaymentsDueStr: formatINR(poTotal),
    vendorPaymentsDueRaw: poTotal,
    pendingVendorsCount: poCount,
    periodComparisonLabel: periodComparison?.label || '',
    periodComparisonPositive: periodComparison?.positive ?? null,
    targetBenchmarkStr: effNum >= 75 ? 'Target Met (75%)' : `Target: 75% (${(75 - effNum).toFixed(1)}% short)`,
    periodLabel: periodMeta.label,
    periodBadge: periodMeta.badge,
    invoicesCount: count,
  };
};

// ── Chart 1: Revenue vs Collections Trend ──
export const calculateRevenueTrendData = (timeRange, rangeBounds, filteredInvoices = [], filteredSalesOrders = []) => {
  const weekly = timeRange === '30D';
  const isQuarter = timeRange === '90D' || ['QUARTER', 'Q1', 'Q2', 'Q3', 'Q4', 'PREV_Q'].includes(timeRange);
  const customMonths = Math.max(1, Math.min(12, (rangeBounds.end.getFullYear() - rangeBounds.start.getFullYear()) * 12 + rangeBounds.end.getMonth() - rangeBounds.start.getMonth() + 1));
  const bucketCount = weekly ? 4 : timeRange === 'CUSTOM' ? customMonths : isQuarter ? 3 : timeRange === '6M' ? 6 : 12;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    if (weekly) return { start: new Date(rangeBounds.start.getTime() + index * 7 * 86400000), end: new Date(Math.min(rangeBounds.end.getTime(), rangeBounds.start.getTime() + (index + 1) * 7 * 86400000 - 1)), label: `Week ${index + 1}`, revenue: 0, collections: 0 };
    const date = new Date(rangeBounds.start.getFullYear(), rangeBounds.start.getMonth() + index, 1);
    return { year: date.getFullYear(), month: date.getMonth(), label: date.toLocaleDateString('en-IN', { month: 'short' }), revenue: 0, collections: 0 };
  });
  const source = filteredInvoices.length > 0
    ? filteredInvoices.map((record) => ({ record, date: getRecordDate(record, ['invoiceDate', 'createdAt', 'date']), revenue: Number(record.invoiceAmount || 0), collections: Number(record.amtRcvd || 0) }))
    : filteredSalesOrders.map((record) => ({ record, date: getRecordDate(record, ['orderDate', 'createdAt', 'date']), revenue: Number(record.totalAmount || record.grand_total || 0), collections: Number(record.paidAmount || record.verified_paid_amount || 0) }));
  source.forEach(({ date, revenue, collections }) => {
    if (!date) return;
    const bucket = weekly ? buckets.find((item) => date >= item.start && date <= item.end) : buckets.find((item) => item.year === date.getFullYear() && item.month === date.getMonth());
    if (bucket) { bucket.revenue += revenue; bucket.collections += collections; }
  });
  return buckets.map(({ label, revenue, collections }) => ({ label, revenue: Math.round(revenue), collections: Math.round(collections) }));
};

// ── Chart 2: Collections vs Outstanding Bar Data ──
export const calculateCollectionsVsOutstandingData = (timeRange, rangeBounds, filteredInvoices = [], filteredSalesOrders = []) => {
  const weekly = timeRange === '30D';
  const isQuarter = timeRange === '90D' || ['QUARTER', 'Q1', 'Q2', 'Q3', 'Q4', 'PREV_Q'].includes(timeRange);
  const customMonths = Math.max(1, Math.min(12, (rangeBounds.end.getFullYear() - rangeBounds.start.getFullYear()) * 12 + rangeBounds.end.getMonth() - rangeBounds.start.getMonth() + 1));
  const bucketCount = weekly ? 4 : timeRange === 'CUSTOM' ? customMonths : isQuarter ? 3 : timeRange === '6M' ? 6 : 12;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    if (weekly) return { start: new Date(rangeBounds.start.getTime() + index * 7 * 86400000), end: new Date(Math.min(rangeBounds.end.getTime(), rangeBounds.start.getTime() + (index + 1) * 7 * 86400000 - 1)), period: `Week ${index + 1}`, collections: 0, outstanding: 0 };
    const date = new Date(rangeBounds.start.getFullYear(), rangeBounds.start.getMonth() + index, 1);
    return { year: date.getFullYear(), month: date.getMonth(), period: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), collections: 0, outstanding: 0 };
  });
  const source = filteredInvoices.length > 0
    ? filteredInvoices.map((record) => ({ date: getRecordDate(record, ['invoiceDate', 'createdAt', 'date']), collections: Number(record.amtRcvd || 0), outstanding: Number(record.outstanding !== undefined ? record.outstanding : Math.max(0, Number(record.invoiceAmount || 0) - Number(record.amtRcvd || 0))) }))
    : filteredSalesOrders.map((record) => ({ date: getRecordDate(record, ['orderDate', 'createdAt', 'date']), collections: Number(record.paidAmount || record.verified_paid_amount || 0), outstanding: Number(record.outstandingAmount !== undefined ? record.outstandingAmount : Math.max(0, Number(record.totalAmount || record.grand_total || 0) - Number(record.paidAmount || record.verified_paid_amount || 0))) }));
  source.forEach(({ date, collections, outstanding }) => {
    if (!date) return;
    const bucket = weekly ? buckets.find((item) => date >= item.start && date <= item.end) : buckets.find((item) => item.year === date.getFullYear() && item.month === date.getMonth());
    if (bucket) { bucket.collections += collections; bucket.outstanding += outstanding; }
  });
  return buckets.map(({ period, collections, outstanding }) => ({ period, collections: Math.round(collections), outstanding: Math.round(outstanding) }));
};

// ── Chart 3: Aging Breakdown Donut ──
export const calculateAgingBreakdownData = (allArInvoices = [], salesOrders = []) => {
  const buckets = [
    { name: '0–30 Days (Current)', value: 0, color: PALETTE.emerald },
    { name: '31–60 Days (Aging)', value: 0, color: PALETTE.amber },
    { name: '61–90 Days (Overdue)', value: 0, color: '#F97316' },
    { name: '90+ Days (Critical)', value: 0, color: PALETTE.rose },
  ];
  const activeRecords = allArInvoices.length > 0 ? allArInvoices : salesOrders;
  activeRecords.forEach((record) => {
    const outstanding = Number(record.outstanding !== undefined
      ? record.outstanding
      : record.outstandingAmount !== undefined
        ? record.outstandingAmount
        : Math.max(0, Number(record.invoiceAmount || record.totalAmount || record.grand_total || 0) - Number(record.amtRcvd || record.paidAmount || 0)));
    if (outstanding <= 0) return;
    const dueDate = getRecordDate(record, ['dueDate', 'paymentDueDate', 'invoiceDate', 'orderDate']);
    const daysOverdue = dueDate ? Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / 86400000)) : 0;
    const bucketIndex = daysOverdue <= 30 ? 0 : daysOverdue <= 60 ? 1 : daysOverdue <= 90 ? 2 : 3;
    buckets[bucketIndex].value += outstanding;
  });
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  return buckets.map((bucket) => ({
    ...bucket,
    value: Number(bucket.value.toFixed(2)),
    percentage: `${total ? ((bucket.value / total) * 100).toFixed(1) : '0.0'}%`,
  }));
};

// ── Chart 4: Expense Allocation Donut ──
export const calculateExpenseAllocationData = (dynamicMetrics, filteredExpenses = []) => {
  const vendorPay = dynamicMetrics?.vendorPaymentsDueRaw || 0;
  const gstTax = 0;
  const totalExpensesLogged = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const payroll = 0;
  const operations = totalExpensesLogged;
  const admin = 0;

  const total = vendorPay + payroll + operations + admin + gstTax;

  return [
    { name: 'Statutory GST & Taxes', value: gstTax, color: PALETTE.blue, share: `${Math.round((gstTax / Math.max(1, total)) * 100)}%` },
    { name: 'Staff Salaries & Payroll', value: payroll, color: PALETTE.purple, share: `${Math.round((payroll / Math.max(1, total)) * 100)}%` },
    { name: 'Operations & Logistics', value: operations, color: PALETTE.emerald, share: `${Math.round((operations / Math.max(1, total)) * 100)}%` },
    { name: 'Office & Administration', value: admin, color: PALETTE.amber, share: `${Math.round((admin / Math.max(1, total)) * 100)}%` },
    { name: 'Vendor Procurement Orders', value: vendorPay, color: PALETTE.rose, share: `${Math.round((vendorPay / Math.max(1, total)) * 100)}%` },
  ];
};

// ── Top 5 Debtors List ──
export const calculateTopPendingCustomers = (filteredInvoices = [], filteredSalesOrders = []) => {
  const customerMap = new Map();
  const activeInvoices = filteredInvoices.length > 0 ? filteredInvoices : [];
  const activeOrders = filteredSalesOrders.length > 0 ? filteredSalesOrders : [];

  if (activeInvoices.length > 0) {
    activeInvoices.forEach((inv) => {
      const out = Number(inv.outstanding !== undefined ? inv.outstanding : Math.max(0, Number(inv.invoiceAmount || 0) - Number(inv.amtRcvd || 0)));
      if (out <= 0) return;
      const name = inv.companyName || 'Client';

      const existing = customerMap.get(name) || { name, totalBal: 0, count: 0, maxDays: 0 };
      const d = inv.dueDate || inv.invoiceDate;
      const days = d ? Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)) : 20;

      customerMap.set(name, {
        name,
        totalBal: existing.totalBal + out,
        count: existing.count + 1,
        maxDays: Math.max(existing.maxDays, days),
      });
    });
  } else if (activeOrders.length > 0) {
    activeOrders.forEach((o) => {
      const tot = Number(o.totalAmount || 0);
      const paid = Number(o.paidAmount || 0);
      const out = Number(o.outstandingAmount !== undefined ? o.outstandingAmount : Math.max(0, tot - paid));
      if (out <= 0) return;
      const name = o.customer?.companyName || 'Client';

      const existing = customerMap.get(name) || { name, totalBal: 0, count: 0, maxDays: 0 };
      customerMap.set(name, {
        name,
        totalBal: existing.totalBal + out,
        count: existing.count + 1,
        maxDays: 30,
      });
    });
  }

  const source = Array.from(customerMap.values());

  return source
    .sort((a, b) => b.totalBal - a.totalBal)
    .slice(0, 5)
    .map((c) => ({
      name: c.name,
      amountStr: formatINR(c.totalBal),
      amountRaw: c.totalBal,
      invoicesStr: `${c.count} Invoices`,
      status: c.maxDays > 30 ? 'OVERDUE' : 'PENDING',
      risk: c.maxDays > 40 ? 'HIGH' : c.maxDays > 25 ? 'MEDIUM' : 'LOW',
      riskColor: c.maxDays > 40 ? PALETTE.rose : c.maxDays > 25 ? PALETTE.amber : PALETTE.emerald,
    }));
};

// ── Sales Team Attribution List ──
export const calculateSalesTeamList = (filteredInvoices = [], filteredSalesOrders = []) => {
  const repMap = new Map();
  const activeInvoices = filteredInvoices.length > 0 ? filteredInvoices : [];
  const activeOrders = filteredSalesOrders.length > 0 ? filteredSalesOrders : [];

  if (activeInvoices.length > 0) {
    activeInvoices.forEach((inv) => {
      const rep = inv.salesPerson || 'Sales Team';
      const existing = repMap.get(rep) || { name: rep, count: 0, totalVal: 0, received: 0 };
      repMap.set(rep, {
        name: rep,
        role: rep.toLowerCase().includes('supersales') || rep.toLowerCase().includes('sstwo') ? 'SuperSales' : 'Sales Executive',
        count: existing.count + 1,
        totalVal: existing.totalVal + Number(inv.invoiceAmount || 0),
        received: existing.received + Number(inv.amtRcvd || 0),
      });
    });
  } else if (activeOrders.length > 0) {
    activeOrders.forEach((o) => {
      const rep = o.salesExecutive?.name || o.salesExecutive?.email || 'Sales Executive';
      const existing = repMap.get(rep) || { name: rep, count: 0, totalVal: 0, received: 0 };
      repMap.set(rep, {
        name: rep,
        role: rep.toLowerCase().includes('supersales') ? 'SuperSales' : 'Sales Executive',
        count: existing.count + 1,
        totalVal: existing.totalVal + Number(o.totalAmount || 0),
        received: existing.received + Number(o.paidAmount || 0),
      });
    });
  }

  const source = Array.from(repMap.values());

  return source
    .sort((a, b) => b.totalVal - a.totalVal)
    .map((r) => {
      const initials = r.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return {
        ...r,
        initials: initials || 'SE',
        salesValStr: formatINR(r.totalVal),
        receivedStr: formatINR(r.received),
      };
    });
};
