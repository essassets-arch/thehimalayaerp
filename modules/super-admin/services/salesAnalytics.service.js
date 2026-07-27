// Sales Analytics ERP BI service containing calculations and mock datasets

// Helper to format currency
export const formatCurrency = (val) => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
};

export const mockAnalyticsData = {
  kpis: {
    revenue: 34200000,
    orders: 582,
    leads: 1200,
    customers: 214,
    profit: 11970000,
    outstanding: 4800000,
    collectionRate: 92,
    revenueGrowth: 18,
    orderGrowth: 22,
    customerGrowth: 12,
    retentionRate: 61,
    clv: 159813,
    aov: 58762,
    salesCycle: 14, // days
    leadResponse: 8.5, // hours
    winRate: 25, // %
  },
  
  quotationStats: {
    generated: 1280,
    approved: 842,
    rejected: 132,
    pending: 306
  },

  sampleStats: {
    sent: 842,
    accepted: 520,
    rejected: 188,
    pending: 134
  },

  paymentStats: {
    collected: 28600000,
    pending: 4800000,
    overdue: 1200000,
    rate: 92
  },

  revenueTrend: [
    { month: 'Jan', Revenue: 45, Orders: 28 },
    { month: 'Feb', Revenue: 58, Orders: 36 },
    { month: 'Mar', Revenue: 72, Orders: 42 },
    { month: 'Apr', Revenue: 64, Orders: 38 },
    { month: 'May', Revenue: 90, Orders: 54 },
    { month: 'Jun', Revenue: 110, Orders: 68 },
    { month: 'Jul', Revenue: 115, Orders: 71 },
    { month: 'Aug', Revenue: 120, Orders: 75 },
    { month: 'Sep', Revenue: 125, Orders: 79 },
    { month: 'Oct', Revenue: 135, Orders: 86 },
    { month: 'Nov', Revenue: 142, Orders: 91 },
    { month: 'Dec', Revenue: 155, Orders: 102 }
  ],

  yoyRevenue: [
    { month: 'Jan', '2025': 38, '2026': 45 },
    { month: 'Feb', '2025': 42, '2026': 58 },
    { month: 'Mar', '2025': 55, '2026': 72 },
    { month: 'Apr', '2025': 50, '2026': 64 },
    { month: 'May', '2025': 68, '2026': 90 },
    { month: 'Jun', '2025': 80, '2026': 110 },
    { month: 'Jul', '2025': 85, '2026': 115 },
    { month: 'Aug', '2025': 90, '2026': 120 },
    { month: 'Sep', '2025': 88, '2026': 125 },
    { month: 'Oct', '2025': 95, '2026': 135 },
    { month: 'Nov', '2025': 102, '2026': 142 },
    { month: 'Dec', '2025': 110, '2026': 155 }
  ],

  leadFunnel: [
    { name: 'Lead Created', Qty: 1200, fill: '#337a86', rate: '100%' },
    { name: 'Qualified', Qty: 900, fill: '#0284c7', rate: '75%' },
    { name: 'Sample Sent', Qty: 600, fill: '#3b82f6', rate: '50%' },
    { name: 'Quotation', Qty: 450, fill: '#4f46e5', rate: '37.5%' },
    { name: 'Approved', Qty: 350, fill: '#6366f1', rate: '29.2%' },
    { name: 'Order', Qty: 300, fill: '#10b981', rate: '25%' },
    { name: 'Production', Qty: 250, fill: '#f59e0b', rate: '20.8%' },
    { name: 'Dispatch', Qty: 200, fill: '#ea580c', rate: '16.7%' },
    { name: 'Delivered', Qty: 180, fill: '#16a34a', rate: '15%' }
  ],

  categorySales: [
    { category: 'Tiles', Sales: 120, fill: '#337a86' },
    { category: 'Bricks', Sales: 92, fill: '#0284c7' },
    { category: 'Blocks', Sales: 61, fill: '#f59e0b' },
    { category: 'Cement', Sales: 38, fill: '#ef4444' }
  ],

  productSales: [
    { product: 'Paver Block', Sales: 82, fill: '#337a86' },
    { product: 'Interlocking Tile', Sales: 76, fill: '#0284c7' },
    { product: 'Kerb Stone', Sales: 42, fill: '#f59e0b' },
    { product: 'Hollow Block', Sales: 31, fill: '#eab308' }
  ],

  categoryPerformance: [
    { name: 'Tiles', value: 42, fill: '#337a86' },
    { name: 'Blocks', value: 28, fill: '#0284c7' },
    { name: 'Kerb', value: 18, fill: '#f59e0b' },
    { name: 'Others', value: 12, fill: '#5E6B82' }
  ],

  stateSales: [
    { state: 'Gujarat', Revenue: 210, fill: '#337a86' },
    { state: 'Maharashtra', Revenue: 140, fill: '#0284c7' },
    { state: 'Rajasthan', Revenue: 92, fill: '#f59e0b' }
  ],

  industrySales: [
    { name: 'Construction', value: 48, fill: '#337a86' },
    { name: 'Government', value: 22, fill: '#0284c7' },
    { name: 'Retail', value: 18, fill: '#f59e0b' },
    { name: 'Industrial', value: 12, fill: '#5E6B82' }
  ],

  leadSource: [
    { name: 'Website', value: 32, fill: '#337a86' },
    { name: 'Reference', value: 28, fill: '#0284c7' },
    { name: 'WhatsApp', value: 15, fill: '#3b82f6' },
    { name: 'Sales Visit', value: 13, fill: '#4f46e5' },
    { name: 'Trade Fair', value: 7, fill: '#f59e0b' },
    { name: 'Others', value: 5, fill: '#5E6B82' }
  ],

  orderStatus: [
    { status: 'Pending', count: 48, fill: '#8893A7' },
    { status: 'Production', count: 96, fill: '#eab308' },
    { status: 'QC Check', count: 32, fill: '#3b82f6' },
    { status: 'Dispatch', count: 54, fill: '#ea580c' },
    { status: 'Delivered', count: 184, fill: '#16a34a' },
    { status: 'Closed', count: 210, fill: '#24345C' }
  ],

  heatmap: [
    { day: 'Mon', '9am-12pm': 12, '12pm-3pm': 24, '3pm-6pm': 18 },
    { day: 'Tue', '9am-12pm': 15, '12pm-3pm': 28, '3pm-6pm': 22 },
    { day: 'Wed', '9am-12pm': 18, '12pm-3pm': 32, '3pm-6pm': 25 },
    { day: 'Thu', '9am-12pm': 14, '12pm-3pm': 26, '3pm-6pm': 20 },
    { day: 'Fri', '9am-12pm': 22, '12pm-3pm': 38, '3pm-6pm': 30 },
    { day: 'Sat', '9am-12pm': 8, '12pm-3pm': 15, '3pm-6pm': 10 },
    { day: 'Sun', '9am-12pm': 2, '12pm-3pm': 4, '3pm-6pm': 3 }
  ],

  topSellingProducts: [
    { rank: 1, product: 'Paver Block', qty: 18240, revenue: 8200000, profit: 2870000, margin: 35 },
    { rank: 2, product: 'Kerb Stone', qty: 13400, revenue: 5300000, profit: 1590000, margin: 30 },
    { rank: 3, product: 'Hollow Block', qty: 11200, revenue: 4800000, profit: 1680000, margin: 35 }
  ],

  topCustomers: [
    { rank: 1, customer: 'ABC Infra', orders: 12, revenue: 6200000 },
    { rank: 2, customer: 'XYZ Builders', orders: 8, revenue: 4800000 },
    { rank: 3, customer: 'Kiran Construction', orders: 9, revenue: 4200000 }
  ],

  salesLeaderboard: [
    { rank: 1, employee: 'Ravi Patel', orders: 24, revenue: 8200000 },
    { rank: 2, employee: 'Mohan Shah', orders: 19, revenue: 7400000 },
    { rank: 3, employee: 'Akash Patel', orders: 18, revenue: 6900000 }
  ],

  recentHighValueOrders: [
    { orderNo: 'ORD-2026-9812', customer: 'ABC Infra', amount: 1250000, executive: 'Ravi Patel', status: 'In Production' },
    { orderNo: 'ORD-2026-9744', customer: 'XYZ Builders', amount: 890000, executive: 'Mohan Shah', status: 'Delivered' },
    { orderNo: 'ORD-2026-9630', customer: 'Kiran Construction', amount: 760000, executive: 'Akash Patel', status: 'QC Passed' }
  ]
};

// Mock Explorer Datasets corresponding to the 15 sections
export const mockExplorerData = {
  // Section 1: Summary Stats
  summary: {
    totalProducts: 128,
    categories: 12,
    orders: 582,
    sales: 34200000,
    customers: 214,
    salesUsers: 18
  },

  // Section 2: Product Category Performance
  categories: [
    { category: 'Paver Blocks', products: 24, orders: 182, qty: 22400, revenue: 12000000, profit: 3800000, margin: 32, pendingOrders: 14 },
    { category: 'Kerb Stone', products: 18, orders: 92, qty: 12800, revenue: 8200000, profit: 2200000, margin: 27, pendingOrders: 8 },
    { category: 'Hollow Blocks', products: 16, orders: 84, qty: 11200, revenue: 6100000, profit: 1900000, margin: 31, pendingOrders: 5 },
    { category: 'Cement Bricks', products: 12, orders: 120, qty: 32000, revenue: 3800000, profit: 1100000, margin: 29, pendingOrders: 11 },
    { category: 'Fencing Poles', products: 8, orders: 40, qty: 5400, revenue: 1800000, profit: 540000, margin: 30, pendingOrders: 3 },
    { category: 'Concrete Pipes', products: 15, orders: 36, qty: 2100, revenue: 1400000, profit: 420000, margin: 30, pendingOrders: 2 },
    { category: 'Manhole Covers', products: 10, orders: 28, qty: 1800, revenue: 900000, profit: 250000, margin: 28, pendingOrders: 1 }
  ],

  // Section 3: Product Wise Sales
  products: [
    { sku: 'PB001', product: 'Paver Block 80mm Heavy', category: 'Paver Blocks', size: '200x100x80', color: 'Grey', price: 45, orders: 82, qty: 18240, revenue: 8200000, cost: 5330000, profit: 2870000, margin: 35, stock: 15000, reserved: 4500, pendingProduction: 6000 },
    { sku: 'PB002', product: 'Paver Block 60mm ZigZag', category: 'Paver Blocks', size: '220x110x60', color: 'Red', price: 42, orders: 68, qty: 12400, revenue: 520800, cost: 338520, profit: 182280, margin: 35, stock: 8000, reserved: 2000, pendingProduction: 1000 },
    { sku: 'KS001', product: 'Standard Kerb Stone', category: 'Kerb Stone', size: '300x150x900', color: 'Grey', price: 395, orders: 92, qty: 12800, revenue: 5056000, cost: 3690880, profit: 1365120, margin: 27, stock: 2400, reserved: 1800, pendingProduction: 3000 },
    { sku: 'HB001', product: 'Hollow Block 8 inch', category: 'Hollow Blocks', size: '400x200x200', color: 'Grey', price: 54, orders: 84, qty: 11200, revenue: 604800, cost: 417312, profit: 187488, margin: 31, stock: 9500, reserved: 3200, pendingProduction: 1500 },
    { sku: 'CB001', product: 'Fly Ash Brick Grade-A', category: 'Cement Bricks', size: '230x110x75', color: 'Dark Grey', price: 12, orders: 120, qty: 32000, revenue: 384000, cost: 272640, profit: 111360, margin: 29, stock: 45000, reserved: 12000, pendingProduction: 25000 }
  ],

  // Section 4: Sales Employee Performance
  employees: [
    { employee: 'Ravi Patel', leads: 182, qualified: 135, samples: 74, quotations: 62, orders: 52, revenue: 8200000, pendingPayment: 1200000, collection: 7000000, conversion: 28.5, target: 8000000, achievement: 102.5 },
    { employee: 'Mohan Shah', leads: 166, qualified: 120, samples: 68, quotations: 50, orders: 46, revenue: 7400000, pendingPayment: 900000, collection: 6500000, conversion: 27.7, target: 7500000, achievement: 98.6 },
    { employee: 'Akash Patel', leads: 154, qualified: 110, samples: 59, quotations: 48, orders: 42, revenue: 6900000, pendingPayment: 800000, collection: 6100000, conversion: 27.2, target: 7000000, achievement: 98.5 },
    { employee: 'Vikram Singh', leads: 130, qualified: 92, samples: 45, quotations: 36, orders: 30, revenue: 4800000, pendingPayment: 600000, collection: 4200000, conversion: 23.0, target: 5000000, achievement: 96.0 },
    { employee: 'Sanjay Mehta', leads: 112, qualified: 80, samples: 32, quotations: 28, orders: 24, revenue: 3800000, pendingPayment: 400000, collection: 3400000, conversion: 21.4, target: 4000000, achievement: 95.0 }
  ],

  // Section 5: Customer Wise Sales
  customers: [
    { customer: 'ABC Infra', industry: 'Construction', state: 'Gujarat', city: 'Ahmedabad', orders: 12, revenue: 6200000, outstanding: 1200000, collected: 5000000, pending: 1200000, lastOrder: '2026-06-28', executive: 'Ravi Patel' },
    { customer: 'XYZ Builders', industry: 'Real Estate', state: 'Maharashtra', city: 'Mumbai', orders: 8, revenue: 4800000, outstanding: 800000, collected: 4000000, pending: 800000, lastOrder: '2026-06-25', executive: 'Mohan Shah' },
    { customer: 'Kiran Construction', industry: 'Infrastructure', state: 'Rajasthan', city: 'Jaipur', orders: 9, revenue: 4200000, outstanding: 600000, collected: 3600000, pending: 600000, lastOrder: '2026-06-24', executive: 'Akash Patel' },
    { customer: 'L&T Precast Unit', industry: 'Infrastructure', state: 'Gujarat', city: 'Vadodara', orders: 14, revenue: 5400000, outstanding: 500000, collected: 4900000, pending: 500000, lastOrder: '2026-06-29', executive: 'Ravi Patel' },
    { customer: 'Metro Rail Corp', industry: 'Government', state: 'Gujarat', city: 'Surat', orders: 6, revenue: 3800000, outstanding: 900000, collected: 2900000, pending: 900000, lastOrder: '2026-06-20', executive: 'Vikram Singh' }
  ],

  // Section 6: Lead Analysis
  leads: [
    { leadId: 'LD2026-001', company: 'Shree Balaji Developers', executive: 'Ravi Patel', source: 'Website', status: 'Converted', convertedDate: '2026-05-10', quotation: 'QT-2026-041', order: 'ORD-2026-012', revenue: 1450000 },
    { leadId: 'LD2026-002', company: 'Maruti Infrastructure', executive: 'Mohan Shah', source: 'Reference', status: 'Converted', convertedDate: '2026-05-15', quotation: 'QT-2026-045', order: 'ORD-2026-014', revenue: 980000 },
    { leadId: 'LD2026-003', company: 'Radhe Group', executive: 'Akash Patel', source: 'WhatsApp', status: 'Quoted', convertedDate: null, quotation: 'QT-2026-051', order: null, revenue: 0 },
    { leadId: 'LD2026-004', company: 'GIDC Industrial Corp', executive: 'Vikram Singh', source: 'Sales Visit', status: 'Qualified', convertedDate: null, quotation: null, order: null, revenue: 0 },
    { leadId: 'LD2026-005', company: 'Prime Builders & Contractors', executive: 'Sanjay Mehta', source: 'Trade Fair', status: 'Sample Sent', convertedDate: null, quotation: null, order: null, revenue: 0 }
  ],

  // Section 7: Quotation Analysis
  quotations: [
    { quotation: 'QT-2026-041', customer: 'Shree Balaji Developers', executive: 'Ravi Patel', amount: 1450000, status: 'Approved', approvedBy: 'Super Admin', revisionCount: 2, createdDate: '2026-05-02' },
    { quotation: 'QT-2026-045', customer: 'Maruti Infrastructure', executive: 'Mohan Shah', amount: 980000, status: 'Approved', approvedBy: 'Sales Admin', revisionCount: 1, createdDate: '2026-05-05' },
    { quotation: 'QT-2026-051', customer: 'Radhe Group', executive: 'Akash Patel', amount: 1200000, status: 'Pending', approvedBy: null, revisionCount: 3, createdDate: '2026-05-12' },
    { quotation: 'QT-2026-058', customer: 'Rajkot Smart City Project', executive: 'Ravi Patel', amount: 4800000, status: 'Draft', approvedBy: null, revisionCount: 0, createdDate: '2026-05-18' },
    { quotation: 'QT-2026-062', customer: 'Narmada Aqueduct Project', executive: 'Vikram Singh', amount: 2400000, status: 'Rejected', approvedBy: 'Super Admin', revisionCount: 1, createdDate: '2026-05-20' }
  ],

  // Section 8: Order Analysis
  orders: [
    { order: 'ORD-2026-9812', customer: 'ABC Infra', product: 'Paver Block 80mm Heavy', category: 'Paver Blocks', qty: 18240, value: 1250000, production: 'Completed', dispatch: 'Completed', delivery: 'Delivered', payment: 'Collected', status: 'Closed' },
    { order: 'ORD-2026-9744', customer: 'XYZ Builders', product: 'Interlocking ZigZag Red', category: 'Paver Blocks', qty: 15400, value: 890000, production: 'Completed', dispatch: 'Completed', delivery: 'Delivered', payment: 'Pending', status: 'Delivered' },
    { order: 'ORD-2026-9630', customer: 'Kiran Construction', product: 'Standard Kerb Stone 900', category: 'Kerb Stone', qty: 2500, value: 760000, production: 'Completed', dispatch: 'Pending', delivery: 'Pending', payment: 'Pending', status: 'QC Passed' },
    { order: 'ORD-2026-9524', customer: 'L&T Precast Unit', product: 'Fly Ash Brick Grade-A', category: 'Cement Bricks', qty: 45000, value: 540000, production: 'Active', dispatch: 'Pending', delivery: 'Pending', payment: 'Collected', status: 'In Production' },
    { order: 'ORD-2026-9488', customer: 'Metro Rail Corp', product: 'Hollow Block 8 inch', category: 'Hollow Blocks', qty: 10000, value: 920000, production: 'Pending', dispatch: 'Pending', delivery: 'Pending', payment: 'Pending', status: 'Approved' }
  ],

  // Section 9: Payment Analysis
  payments: [
    { order: 'ORD-2026-9812', customer: 'ABC Infra', invoice: 'INV-2026-1011', amount: 1250000, collected: 1250000, pending: 0, overdue: 0, financeStatus: 'Verified' },
    { order: 'ORD-2026-9744', customer: 'XYZ Builders', invoice: 'INV-2026-1015', amount: 890000, collected: 400000, pending: 490000, overdue: 0, financeStatus: 'Partially Paid' },
    { order: 'ORD-2026-9630', customer: 'Kiran Construction', invoice: 'INV-2026-1022', amount: 760000, collected: 0, pending: 760000, overdue: 360000, financeStatus: 'Overdue' },
    { order: 'ORD-2026-9524', customer: 'L&T Precast Unit', invoice: 'INV-2026-1030', amount: 540000, collected: 540000, pending: 0, overdue: 0, financeStatus: 'Verified' },
    { order: 'ORD-2026-9488', customer: 'Metro Rail Corp', invoice: 'INV-2026-1044', amount: 920000, collected: 0, pending: 920000, overdue: 0, financeStatus: 'Awaiting Invoice' }
  ],

  // Section 10: Region Wise Sales
  regions: [
    { state: 'Gujarat', city: 'Ahmedabad', orders: 182, customers: 74, revenue: 14500000, collection: 13500000, pending: 1000000 },
    { state: 'Gujarat', city: 'Surat', orders: 94, customers: 36, revenue: 6800000, collection: 6000000, pending: 800000 },
    { state: 'Gujarat', city: 'Vadodara', orders: 82, customers: 32, revenue: 4200000, collection: 3800000, pending: 400000 },
    { state: 'Gujarat', city: 'Rajkot', orders: 48, customers: 22, revenue: 3400000, collection: 2900000, pending: 500000 },
    { state: 'Maharashtra', city: 'Mumbai', orders: 96, customers: 30, revenue: 9800000, collection: 8500000, pending: 1300000 },
    { state: 'Rajasthan', city: 'Jaipur', orders: 80, customers: 20, revenue: 9200000, collection: 8000000, pending: 1200000 }
  ],

  // Section 11: Product Profitability
  profitability: [
    { product: 'Paver Block 80mm Heavy', sales: 8200000, cost: 5330000, grossProfit: 2870000, netProfit: 2050000, margin: 35, returnRate: 0.8, complaints: 2 },
    { product: 'Standard Kerb Stone 900', sales: 5300000, cost: 3710000, grossProfit: 1590000, netProfit: 1120000, margin: 30, returnRate: 1.2, complaints: 4 },
    { product: 'Hollow Block 8 inch', sales: 4800000, cost: 3120000, grossProfit: 1680000, netProfit: 1240000, margin: 35, returnRate: 0.5, complaints: 1 },
    { product: 'Interlocking ZigZag Red', sales: 7600000, cost: 4712000, grossProfit: 2888000, netProfit: 2180000, margin: 38, returnRate: 0.4, complaints: 3 }
  ],

  // Section 12: Inventory vs Sales
  inventory: [
    { product: 'Paver Block 80mm Heavy', stock: 15000, reserved: 4500, sold: 18240, production: 6000, available: 10500, stockDays: 28 },
    { product: 'Standard Kerb Stone 900', stock: 2400, reserved: 1800, sold: 13400, production: 3000, available: 600, stockDays: 5 },
    { product: 'Hollow Block 8 inch', stock: 9500, reserved: 3200, sold: 11200, production: 1500, available: 6300, stockDays: 16 },
    { product: 'Interlocking ZigZag Red', stock: 8000, reserved: 2000, sold: 16400, production: 1000, available: 6000, stockDays: 11 }
  ],

  // Section 13: Monthly Product Performance
  monthlyProductPerformance: [
    { month: '2026-06', product: 'Paver Block 80mm Heavy', qty: 4500, revenue: 202500, growth: 12.5, returns: 15 },
    { month: '2026-06', product: 'Standard Kerb Stone 900', qty: 2200, revenue: 869000, growth: 8.2, returns: 8 },
    { month: '2026-06', product: 'Hollow Block 8 inch', qty: 3100, revenue: 167400, growth: 15.0, returns: 5 },
    { month: '2026-05', product: 'Paver Block 80mm Heavy', qty: 4000, revenue: 180000, growth: 6.8, returns: 12 },
    { month: '2026-05', product: 'Standard Kerb Stone 900', qty: 2030, revenue: 801850, growth: 4.1, returns: 10 }
  ],

  // Section 14: Top 100 Products
  top100Products: [
    { rank: 1, product: 'Paver Block 80mm Heavy', revenue: 8200000, orders: 82, profit: 2870000, margin: 35, growth: 18.5 },
    { rank: 2, product: 'Interlocking ZigZag Red', revenue: 7600000, orders: 68, profit: 2888000, margin: 38, growth: 22.4 },
    { rank: 3, product: 'Standard Kerb Stone 900', revenue: 5300000, orders: 92, profit: 1590000, margin: 30, growth: 9.6 },
    { rank: 4, product: 'Hollow Block 8 inch', revenue: 4800000, orders: 84, profit: 1680000, margin: 35, growth: 14.2 },
    { rank: 5, product: 'Fly Ash Brick Grade-A', revenue: 3800000, orders: 120, profit: 1113600, margin: 29, growth: 11.8 }
  ],

  // Section 15: Sales Activity Log
  activityLog: [
    { date: '2026-07-01 10:30', salesUser: 'Ravi Patel', action: 'Created Lead', customer: 'Balaji Buildcon', lead: 'LD2026-102', quotation: null, order: null, remarks: 'Met partner today. Required heavy paver block pricing.' },
    { date: '2026-07-01 11:15', salesUser: 'Mohan Shah', action: 'Approved Quotation', customer: 'XYZ Builders', lead: null, quotation: 'QT-2026-045', order: 'ORD-2026-9744', remarks: 'Client finalized purchase and sent PO.' },
    { date: '2026-07-01 14:40', salesUser: 'Akash Patel', action: 'Sent Sample', customer: 'Radhe Group', lead: 'LD2026-003', quotation: null, order: null, remarks: 'Dispatched 5 samples of interlocking tiles for approval.' },
    { date: '2026-06-30 16:00', salesUser: 'Vikram Singh', action: 'Follow-up Call', customer: 'Metro Rail Corp', lead: 'LD2026-005', quotation: null, order: null, remarks: 'Discussed quality guidelines with head inspector.' }
  ]
};

// Drilldown Drawer Data Fetchers
export const getProductDetails = (skuOrName) => {
  const p = mockExplorerData.products.find(x => x.sku === skuOrName || x.product === skuOrName) || mockExplorerData.products[0];
  return {
    ...p,
    salesTrend: [
      { month: 'Jan', Sales: 450000 },
      { month: 'Feb', Sales: 620000 },
      { month: 'Mar', Sales: 800000 },
      { month: 'Apr', Sales: 720000 },
      { month: 'May', Sales: 980000 },
      { month: 'Jun', Sales: 1250000 }
    ],
    topCustomers: [
      { name: 'ABC Infra', share: '32%' },
      { name: 'L&T Precast Unit', share: '28%' },
      { name: 'XYZ Builders', share: '18%' }
    ],
    salesExecutives: [
      { name: 'Ravi Patel', amount: 3500000 },
      { name: 'Mohan Shah', amount: 2800000 }
    ],
    regionalSales: [
      { city: 'Ahmedabad', revenue: 4200000 },
      { city: 'Surat', revenue: 2200000 },
      { city: 'Mumbai', revenue: 1800000 }
    ]
  };
};

export const getCustomerDetails = (name) => {
  const c = mockExplorerData.customers.find(x => x.customer === name) || mockExplorerData.customers[0];
  return {
    ...c,
    lifetimeRevenue: 15400000,
    purchasedProducts: [
      { name: 'Paver Block 80mm Heavy', qty: 15000 },
      { name: 'Standard Kerb Stone 900', qty: 2500 }
    ],
    invoices: [
      { invNo: 'INV-2026-1011', amount: 1250000, date: '2026-06-01', status: 'Paid' },
      { invNo: 'INV-2026-0942', amount: 3200000, date: '2026-05-15', status: 'Paid' }
    ],
    history: [
      { date: '2026-06-28', event: 'Order Logged: ORD-2026-9812' },
      { date: '2026-06-02', event: 'Payment Received: ₹12.5L for INV-1011' },
      { date: '2026-05-15', event: 'Quotation Approved: QT-2026-041' }
    ]
  };
};

export const getEmployeeDetails = (name) => {
  const e = mockExplorerData.employees.find(x => x.employee === name) || mockExplorerData.employees[0];
  return {
    ...e,
    topCustomers: [
      { name: 'ABC Infra', share: '62%' },
      { name: 'L&T Precast Unit', share: '38%' }
    ],
    activities: [
      { date: '2026-07-01 10:30', detail: 'Created Lead: Balaji Buildcon' },
      { date: '2026-06-29 14:15', detail: 'Sent quotation QT-2026-058 to client' },
      { date: '2026-06-28 09:30', detail: 'Closed Order ORD-2026-9812 for ₹12.5L' }
    ],
    monthlyPerformance: [
      { month: 'Jan', sales: 42 },
      { month: 'Feb', sales: 58 },
      { month: 'Mar', sales: 69 },
      { month: 'Apr', sales: 61 },
      { month: 'May', sales: 78 },
      { month: 'Jun', sales: 82 } // Lakhs
    ]
  };
};

export const getOrderDetails = (orderNo) => {
  const o = mockExplorerData.orders.find(x => x.order === orderNo) || mockExplorerData.orders[0];
  return {
    ...o,
    timeline: [
      { label: 'Created', date: '2026-06-18', status: 'done', desc: 'Order entered by Ravi Patel' },
      { label: 'Production', date: '2026-06-22', status: 'done', desc: 'Finished heavy curing line 2' },
      { label: 'QC Passed', date: '2026-06-26', status: 'done', desc: 'Passed standard structural stress audit' },
      { label: 'Dispatched', date: '2026-06-27', status: 'done', desc: 'Shipped via Transporter RJ-14' },
      { label: 'Delivered', date: '2026-06-28', status: 'done', desc: 'QC check at ABC Site approved' },
      { label: 'Payment Clear', date: '2026-07-01', status: 'pending', desc: 'Invoice collection in process' }
    ],
    invoice: { invNo: 'INV-2026-1011', amount: o.value, tax: 225000, gross: o.value + 225000, date: '2026-06-28' },
    history: [
      { date: '2026-06-28', user: 'Gate Inspector', action: 'Inbound delivery verified' },
      { date: '2026-06-26', user: 'QC Auditor', action: 'Strength verified (35 Mpa)' }
    ]
  };
};

// Calculate and filter datasets based on context values
export const getFilteredAnalytics = (filters) => {
  // Filters out mock statistics dynamically based on filters object
  let analytics = JSON.parse(JSON.stringify(mockAnalyticsData));
  
  if (filters.category !== 'all') {
    // scale metrics down slightly to mock filtering
    analytics.kpis.revenue = Math.round(analytics.kpis.revenue * 0.4);
    analytics.kpis.orders = Math.round(analytics.kpis.orders * 0.38);
    analytics.kpis.profit = Math.round(analytics.kpis.profit * 0.42);
  }
  
  if (filters.state !== 'all') {
    analytics.kpis.revenue = Math.round(analytics.kpis.revenue * 0.6);
    analytics.kpis.orders = Math.round(analytics.kpis.orders * 0.55);
  }

  return analytics;
};

// ─── Filter Utilities for Dynamic Mock Data ───────────────────────────────────
export const getFilterMultiplier = (filters = {}) => {
  let scale = 1.0;
  
  // Period scaling
  if (filters.period) {
    if (filters.period === 'today') scale *= 0.035;
    else if (filters.period === 'this_week') scale *= 0.23;
    else if (filters.period === 'this_month') scale *= 1.0;
    else if (filters.period === 'last_month') scale *= 0.94;
    else if (filters.period === 'this_quarter') scale *= 2.9;
    else if (filters.period === 'last_quarter') scale *= 2.7;
    else if (filters.period === 'this_year') scale *= 11.5;
    else if (filters.period === 'last_year') scale *= 10.8;
  }
  
  // Region scaling
  if (filters.region && filters.region !== 'All Regions') {
    if (filters.region === 'North') scale *= 0.41;
    else if (filters.region === 'South') scale *= 0.34;
    else if (filters.region === 'East') scale *= 0.25;
    else if (filters.region === 'West') scale *= 0.29;
    else if (filters.region === 'Central') scale *= 0.21;
  }
  
  // Category scaling
  if (filters.category && filters.category !== 'All Categories') {
    if (filters.category === 'Tiles') scale *= 0.35;
    else if (filters.category === 'Bricks') scale *= 0.27;
    else if (filters.category === 'Blocks') scale *= 0.18;
    else if (filters.category === 'Cement') scale *= 0.11;
    else if (filters.category === 'Kerb') scale *= 0.09;
  }

  // Employee scaling
  if (filters.employee && filters.employee !== 'All Employees') {
    if (filters.employee === 'Ravi Patel') scale *= 0.24;
    else if (filters.employee === 'Kiran Rajan') scale *= 0.21;
    else if (filters.employee === 'Ankit Sharma') scale *= 0.19;
    else if (filters.employee === 'Suresh Das') scale *= 0.17;
    else scale *= 0.15;
  }

  return scale;
};

export const getFilteredExplorerData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  const f = filters;
  
  const summary = {
    totalProducts: mockExplorerData.summary.totalProducts,
    categories: mockExplorerData.summary.categories,
    orders: Math.round(mockExplorerData.summary.orders * scale),
    sales: Math.round(mockExplorerData.summary.sales * scale),
    customers: Math.round(mockExplorerData.summary.customers * (scale > 1 ? 1.5 : Math.max(0.3, scale))),
    salesUsers: mockExplorerData.summary.salesUsers
  };

  let categories = mockExplorerData.categories.map(c => ({
    ...c,
    orders: Math.round(c.orders * scale),
    qty: Math.round(c.qty * scale),
    revenue: Math.round(c.revenue * scale),
    profit: Math.round(c.profit * scale),
    pendingOrders: Math.round(c.pendingOrders * scale)
  }));
  if (f.category && f.category !== 'All Categories') {
    categories = categories.filter(c => c.category.toLowerCase().includes(f.category.toLowerCase().replace('all ', '').trim().substring(0, 4)));
  }

  let products = mockExplorerData.products.map(p => ({
    ...p,
    orders: Math.round(p.orders * scale),
    qty: Math.round(p.qty * scale),
    revenue: Math.round(p.revenue * scale),
    cost: Math.round(p.cost * scale),
    profit: Math.round(p.profit * scale),
    stock: Math.round(p.stock),
    reserved: Math.round(p.reserved),
    pendingProduction: Math.round(p.pendingProduction * scale)
  }));
  if (f.category && f.category !== 'All Categories') {
    products = products.filter(p => p.category.toLowerCase().includes(f.category.toLowerCase().replace('all ', '').trim().substring(0, 4)));
  }

  let employees = mockExplorerData.employees.map(e => ({
    ...e,
    leads: Math.round(e.leads * scale),
    qualified: Math.round(e.qualified * scale),
    samples: Math.round(e.samples * scale),
    quotations: Math.round(e.quotations * scale),
    orders: Math.round(e.orders * scale),
    revenue: Math.round(e.revenue * scale),
    pendingPayment: Math.round(e.pendingPayment * scale),
    collection: Math.round(e.collection * scale),
    target: Math.round(e.target)
  }));
  if (f.employee && f.employee !== 'All Employees') {
    employees = employees.filter(e => e.employee === f.employee);
  }

  let customers = mockExplorerData.customers.map(c => ({
    ...c,
    orders: Math.round(c.orders * scale),
    revenue: Math.round(c.revenue * scale),
    outstanding: Math.round(c.outstanding * scale),
    collected: Math.round(c.collected * scale),
    pending: Math.round(c.pending * scale)
  }));
  if (f.region && f.region !== 'All Regions') {
    const isMatch = (state, region) => {
      if (region === 'North') return ['gujarat', 'delhi', 'rajasthan'].includes(state.toLowerCase());
      if (region === 'South') return ['tamil nadu', 'karnataka', 'chennai', 'bangalore'].includes(state.toLowerCase());
      if (region === 'West') return ['maharashtra', 'gujarat'].includes(state.toLowerCase());
      if (region === 'East') return ['west bengal', 'bihar', 'odisha'].includes(state.toLowerCase());
      return true;
    };
    customers = customers.filter(c => isMatch(c.state, f.region));
  }

  let leads = mockExplorerData.leads.map(l => ({
    ...l,
    revenue: Math.round(l.revenue * scale)
  }));
  if (f.employee && f.employee !== 'All Employees') {
    leads = leads.filter(l => l.executive === f.employee);
  }

  let quotations = mockExplorerData.quotations.map(q => ({
    ...q,
    amount: Math.round(q.amount * scale)
  }));
  if (f.employee && f.employee !== 'All Employees') {
    quotations = quotations.filter(q => q.executive === f.employee);
  }

  let orders = mockExplorerData.orders.map(o => ({
    ...o,
    qty: Math.round(o.qty * scale),
    value: Math.round(o.value * scale)
  }));
  if (f.category && f.category !== 'All Categories') {
    orders = orders.filter(o => o.category.toLowerCase().includes(f.category.toLowerCase().replace('all ', '').trim().substring(0, 4)));
  }

  let payments = mockExplorerData.payments.map(p => ({
    ...p,
    amount: Math.round(p.amount * scale),
    collected: Math.round(p.collected * scale),
    pending: Math.round(p.pending * scale),
    overdue: Math.round(p.overdue * scale)
  }));

  let regions = mockExplorerData.regions.map(r => ({
    ...r,
    orders: Math.round(r.orders * scale),
    customers: Math.round(r.customers),
    revenue: Math.round(r.revenue * scale),
    collection: Math.round(r.collection * scale),
    pending: Math.round(r.pending * scale)
  }));
  if (f.region && f.region !== 'All Regions') {
    regions = regions.filter(r => r.state === f.region);
  }

  let inventory = mockExplorerData.inventory.map(i => ({
    ...i,
    stock: Math.round(i.stock),
    reserved: Math.round(i.reserved),
    sold: Math.round(i.sold * scale),
    production: Math.round(i.production * scale),
    available: Math.round(i.available)
  }));

  let monthlyProductPerformance = mockExplorerData.monthlyProductPerformance.map(m => ({
    ...m,
    qty: Math.round(m.qty * scale),
    revenue: Math.round(m.revenue * scale)
  }));

  let top100Products = mockExplorerData.top100Products.map(t => ({
    ...t,
    revenue: Math.round(t.revenue * scale),
    orders: Math.round(t.orders * scale),
    profit: Math.round(t.profit * scale)
  }));

  let activityLog = mockExplorerData.activityLog;
  if (f.employee && f.employee !== 'All Employees') {
    activityLog = activityLog.filter(a => a.salesUser === f.employee);
  }

  return {
    summary, categories, products, employees, customers, leads, quotations,
    orders, payments, regions, inventory, monthlyProductPerformance, top100Products, activityLog
  };
};

// ─── KPI Mock Data ─────────────────────────────────────────────────────────────
export const mockKPIData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  const totalOrders = Math.round(582 * scale);
  const leadsCreated = Math.round(1200 * scale);
  const qualifiedLeads = Math.round(780 * scale);
  const totalRevenue = (3.42 * scale).toFixed(2);
  const avgOrderValue = (58.7 * (0.95 + (Math.sin(scale) * 0.05))).toFixed(1);
  const revenuePerDay = (11.4 * (0.95 + (Math.cos(scale) * 0.05))).toFixed(1);
  
  return {
    totalRevenue, revenueTrend: Math.round(18 * (scale > 0.8 ? 1.05 : 0.9)),
    avgOrderValue, aovTrend: Math.round(4 * (scale > 0.8 ? 1.0 : 0.85)),
    revenuePerDay, revenuePerDayTrend: Math.round(8 * (scale > 0.8 ? 1.1 : 0.9)),
    pendingPayments: Math.round(48 * scale),
    totalOrders, ordersTrend: Math.round(22 * (scale > 0.8 ? 1.1 : 0.88)),
    deliveredOrders: Math.round(totalOrders * 0.9), deliveryRate: 90,
    inProduction: Math.round(totalOrders * 0.07), cancelledOrders: Math.round(totalOrders * 0.03), cancelRate: 2.7,
    leadsCreated, leadsTrend: 14,
    qualifiedLeads, qualifyRate: 65,
    leadConvRate: 25, convRateTrend: 3,
    avgLeadCycle: 14,
    totalCustomers: Math.max(5, Math.round(214 * (scale > 1 ? 1.4 : Math.max(0.3, scale)))), custGrowth: 12,
    repeatCustomers: Math.max(3, Math.round(129 * (scale > 1 ? 1.4 : Math.max(0.3, scale)))), repeatRate: 60,
    newCustomers: Math.max(1, Math.round(38 * (scale > 1 ? 1.25 : Math.max(0.3, scale)))), newCustTrend: 9,
    avgLTV: (1.6 * (0.95 + (Math.sin(scale) * 0.05))).toFixed(1), ltvTrend: 6
  };
};

const MONTHS_LIST = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

export const mockChartData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  return {
    monthlyRevenue: MONTHS_LIST.map((m, idx) => ({ month: m, revenue: Math.round((25 + (idx * 3) + (Math.sin(idx) * 8)) * scale), target: Math.round(55 * scale) })),
    dailyRevenue: Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, revenue: Math.round((8 + (Math.sin(i) * 3) + (i % 5 === 0 ? 5 : 0)) * scale) })),
    quarterly: [
      { quarter: 'Q1', y2023: Math.round(88 * scale), y2024: Math.round(102 * scale), y2025: Math.round(118 * scale) },
      { quarter: 'Q2', y2023: Math.round(95 * scale), y2024: Math.round(114 * scale), y2025: Math.round(138 * scale) },
      { quarter: 'Q3', y2023: Math.round(78 * scale), y2024: Math.round(98 * scale), y2025: Math.round(122 * scale) },
      { quarter: 'Q4', y2023: Math.round(105 * scale), y2024: Math.round(124 * scale), y2025: Math.round(148 * scale) }
    ],
    yoyGrowth: [
      { year: 'FY21', growth: 6 }, { year: 'FY22', growth: 12 }, { year: 'FY23', growth: 9 },
      { year: 'FY24', growth: 18 }, { year: 'FY25', growth: 22 }, { year: 'FY26', growth: 25 }
    ],
    categoryMonthly: MONTHS_LIST.map((m, idx) => ({
      month: m,
      tiles: Math.round((15 + idx + Math.sin(idx) * 4) * scale),
      bricks: Math.round((10 + idx * 0.8 + Math.cos(idx) * 3) * scale),
      blocks: Math.round((8 + idx * 0.5 + Math.sin(idx) * 2) * scale),
      cement: Math.round((5 + idx * 0.3) * scale)
    })),
    regionMonthly: MONTHS_LIST.map((m, idx) => ({
      month: m,
      north: Math.round((20 + idx * 1.5) * scale),
      south: Math.round((15 + idx * 1.2) * scale),
      east: Math.round((10 + idx) * scale),
      west: Math.round((12 + idx * 1.1) * scale)
    })),
    dailyOrders: Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, orders: Math.round((8 + (i % 7 === 0 ? 10 : 3) + Math.cos(i) * 2) * scale) })),
    orderStatus: MONTHS_LIST.map((m, idx) => ({
      month: m,
      delivered: Math.round((28 + idx * 2) * scale),
      production: Math.round((5 + Math.sin(idx) * 2) * scale),
      pending: Math.round((3 + idx % 3) * scale),
      cancelled: Math.round((1 + idx % 4 === 0 ? 1 : 0) * scale)
    })),
    orderTrend: MONTHS_LIST.map((m, i) => ({
      month: m,
      orders: Math.round((40 + i * 4 + Math.sin(i) * 5) * scale),
      movingAvg: Math.round((42 + i * 3.5) * scale)
    }))
  };
};

export const mockFunnelData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  return {
    stages: [
      { stage: 'Lead Created', value: Math.round(1200 * scale), avgDays: 0 },
      { stage: 'Qualified', value: Math.round(780 * scale), avgDays: 3 },
      { stage: 'Sample Sent', value: Math.round(560 * scale), avgDays: 6 },
      { stage: 'Quotation', value: Math.round(420 * scale), avgDays: 10 },
      { stage: 'Approved', value: Math.round(320 * scale), avgDays: 13 },
      { stage: 'Order Placed', value: Math.round(270 * scale), avgDays: 18 },
      { stage: 'In Production', value: Math.round(245 * scale), avgDays: 22 },
      { stage: 'Dispatched', value: Math.round(230 * scale), avgDays: 28 },
      { stage: 'Delivered', value: Math.round(218 * scale), avgDays: 32 }
    ]
  };
};

export const mockProductData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  return {
    categories: [
      { name: 'Tiles', revenue: Math.round(120 * scale) },
      { name: 'Bricks', revenue: Math.round(92 * scale) },
      { name: 'Blocks', revenue: Math.round(61 * scale) },
      { name: 'Cement', revenue: Math.round(38 * scale) }
    ],
    topProducts: [
      { product: 'Paver Block', revenue: Math.round(82 * scale) },
      { product: 'Interlocking Tile', revenue: Math.round(76 * scale) },
      { product: 'Kerb Stone', revenue: Math.round(53 * scale) },
      { product: 'Hollow Block', revenue: Math.round(48 * scale) },
      { product: 'Fly Ash Brick', revenue: Math.round(42 * scale) },
      { product: 'AAC Block', revenue: Math.round(38 * scale) },
      { product: 'Concrete Block', revenue: Math.round(34 * scale) },
      { product: 'Fancy Tile', revenue: Math.round(29 * scale) },
      { product: 'Solid Block', revenue: Math.round(24 * scale) },
      { product: 'Retaining Block', revenue: Math.round(20 * scale) }
    ],
    topSelling: [
      { product: 'Paver Block', category: 'Blocks', qty: Math.round(18240 * scale), revenue: Math.round(82 * scale), avgPrice: '4,500', growth: 12 },
      { product: 'Kerb Stone', category: 'Kerb', qty: Math.round(13400 * scale), revenue: Math.round(53 * scale), avgPrice: '3,960', growth: 8 },
      { product: 'Hollow Block', category: 'Blocks', qty: Math.round(11200 * scale), revenue: Math.round(48 * scale), avgPrice: '4,286', growth: 15 },
      { product: 'Fly Ash Brick', category: 'Bricks', qty: Math.round(9800 * scale), revenue: Math.round(42 * scale), avgPrice: '4,286', growth: 4 },
      { product: 'AAC Block', category: 'Blocks', qty: Math.round(8400 * scale), revenue: Math.round(38 * scale), avgPrice: '4,524', growth: 22 }
    ],
    radarData: [
      { metric: 'Revenue', tiles: Math.round(120 * scale), bricks: Math.round(92 * scale), blocks: Math.round(61 * scale), cement: Math.round(38 * scale) },
      { metric: 'Volume', tiles: Math.round(95 * scale), bricks: Math.round(80 * scale), blocks: Math.round(55 * scale), cement: Math.round(42 * scale) },
      { metric: 'Margin', tiles: 28, bricks: 22, blocks: 32, cement: 18 },
      { metric: 'Growth', tiles: 18, bricks: 8, blocks: 24, cement: 4 },
      { metric: 'Spread', tiles: Math.round(75 * scale), bricks: Math.round(60 * scale), blocks: Math.round(48 * scale), cement: Math.round(30 * scale) }
    ]
  };
};

export const mockRegionalData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  return {
    regions: [
      { name: 'North', revenue: Math.round(142 * scale), target: Math.round(160 * scale), orders: Math.round(198 * scale), growth: 14 },
      { name: 'South', revenue: Math.round(118 * scale), target: Math.round(130 * scale), orders: Math.round(162 * scale), growth: 8 },
      { name: 'East', revenue: Math.round(88 * scale), target: Math.round(95 * scale), orders: Math.round(124 * scale), growth: 18 },
      { name: 'West', revenue: Math.round(104 * scale), target: Math.round(110 * scale), orders: Math.round(142 * scale), growth: 12 },
      { name: 'Central', revenue: Math.round(68 * scale), target: Math.round(80 * scale), orders: Math.round(96 * scale), growth: -4 }
    ],
    monthlyByRegion: MONTHS_LIST.map((m, idx) => ({
      month: m,
      north: Math.round((25 + idx * 2) * scale),
      south: Math.round((20 + idx * 1.5) * scale),
      east: Math.round((14 + idx) * scale),
      west: Math.round((16 + idx * 1.3) * scale),
      central: Math.round((10 + idx * 0.8) * scale)
    })),
    cities: [
      { city: 'Jaipur', region: 'North', orders: Math.round(84 * scale), revenue: Math.round(62 * scale), customers: 42, avgOrder: 73.8, growth: 18, rep: 'Ravi Patel' },
      { city: 'Chennai', region: 'South', orders: Math.round(72 * scale), revenue: Math.round(54 * scale), customers: 36, avgOrder: 75.0, growth: 10, rep: 'Kiran Rajan' },
      { city: 'Kolkata', region: 'East', orders: Math.round(58 * scale), revenue: Math.round(44 * scale), customers: 28, avgOrder: 75.9, growth: 22, rep: 'Suresh Das' },
      { city: 'Ahmedabad', region: 'West', orders: Math.round(64 * scale), revenue: Math.round(48 * scale), customers: 34, avgOrder: 75.0, growth: 14, rep: 'Dilip Shah' },
      { city: 'Indore', region: 'Central', orders: Math.round(42 * scale), revenue: Math.round(32 * scale), customers: 22, avgOrder: 76.2, growth: -6, rep: 'Mehta A.' },
      { city: 'Delhi', region: 'North', orders: Math.round(76 * scale), revenue: Math.round(56 * scale), customers: 38, avgOrder: 73.7, growth: 10, rep: 'Ankit S.' },
      { city: 'Bangalore', region: 'South', orders: Math.round(68 * scale), revenue: Math.round(50 * scale), customers: 32, avgOrder: 73.5, growth: 8, rep: 'Priya L.' }
    ]
  };
};

export const mockPaymentData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  return {
    summary: [
      { label: 'Received', amount: Math.round(286 * scale), count: Math.round(468 * scale) },
      { label: 'Pending', amount: Math.round(48 * scale), count: Math.round(72 * scale) },
      { label: 'Overdue', amount: Math.round(12 * scale), count: Math.round(18 * scale) },
      { label: 'Partial', amount: Math.round(24 * scale), count: Math.round(32 * scale) },
      { label: 'Advance', amount: Math.round(18 * scale), count: Math.round(28 * scale) }
    ],
    modes: [
      { mode: 'RTGS/NEFT', amount: Math.round(142 * scale) },
      { mode: 'Cheque', amount: Math.round(68 * scale) },
      { mode: 'Cash', amount: Math.round(48 * scale) },
      { mode: 'UPI', amount: Math.round(18 * scale) },
      { mode: 'LC/BG', amount: Math.round(10 * scale) }
    ],
    aging: [
      { bucket: '0–30d', amount: Math.round(32 * scale) },
      { bucket: '31–60d', amount: Math.round(18 * scale) },
      { bucket: '61–90d', amount: Math.round(8 * scale) },
      { bucket: '91–120d', amount: Math.round(4 * scale) },
      { bucket: '>120d', amount: Math.round(6 * scale) }
    ],
    monthly: MONTHS_LIST.map((m, idx) => ({
      month: m,
      billed: Math.round((60 + idx * 3) * scale),
      collected: Math.round((50 + idx * 2.8) * scale),
      outstanding: Math.round((8 + idx * 0.5) * scale)
    })),
    overdueAccounts: [
      { customer: 'Sigma Constructions', region: 'North', overdue: Math.round(8.2 * scale), days: 92, orders: 14, lastPayment: '2026-04-10', risk: 'High' },
      { customer: 'Shree Infra', region: 'South', overdue: Math.round(5.6 * scale), days: 64, orders: 8, lastPayment: '2026-05-02', risk: 'Medium' },
      { customer: 'Varun Builders', region: 'East', overdue: Math.round(3.8 * scale), days: 45, orders: 6, lastPayment: '2026-05-18', risk: 'Medium' },
      { customer: 'Bright Tiles Co.', region: 'West', overdue: Math.round(2.1 * scale), days: 28, orders: 4, lastPayment: '2026-06-03', risk: 'Low' }
    ]
  };
};

export const mockLeaderboardData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  return {
    employees: [
      { name: 'Ravi Patel', zone: 'North', revenue: Math.round(82 * scale), orders: Math.round(124 * scale), leads: Math.round(240 * scale), conv: 32, avgDeal: 66, revPct: 100 },
      { name: 'Kiran Rajan', zone: 'South', revenue: Math.round(74 * scale), orders: Math.round(108 * scale), leads: Math.round(210 * scale), conv: 28, avgDeal: 69, revPct: 90 },
      { name: 'Ankit Sharma', zone: 'North', revenue: Math.round(68 * scale), orders: Math.round(96 * scale), leads: Math.round(188 * scale), conv: 26, avgDeal: 71, revPct: 83 },
      { name: 'Suresh Das', zone: 'East', revenue: Math.round(58 * scale), orders: Math.round(82 * scale), leads: Math.round(160 * scale), conv: 24, avgDeal: 71, revPct: 71 },
      { name: 'Priya Lalit', zone: 'South', revenue: Math.round(52 * scale), orders: Math.round(74 * scale), leads: Math.round(142 * scale), conv: 22, avgDeal: 70, revPct: 63 }
    ],
    customers: [
      { name: 'ABC Infra', region: 'North', orders: 28, revenue: Math.round(62 * scale), outstanding: Math.round(4.2 * scale), lastOrder: '2026-06-28', status: 'Active', revPct: 100 },
      { name: 'XYZ Builders', region: 'South', orders: 22, revenue: Math.round(48 * scale), outstanding: Math.round(2.8 * scale), lastOrder: '2026-06-24', status: 'Active', revPct: 77 },
      { name: 'Kiran Const.', region: 'East', orders: 18, revenue: Math.round(42 * scale), outstanding: Math.round(1.2 * scale), lastOrder: '2026-06-20', status: 'Active', revPct: 68 },
      { name: 'Sigma Projects', region: 'West', orders: 14, revenue: Math.round(36 * scale), outstanding: Math.round(8.2 * scale), lastOrder: '2026-04-12', status: 'At Risk', revPct: 58 },
      { name: 'Balaji Buildcon', region: 'North', orders: 12, revenue: Math.round(28 * scale), outstanding: Math.round(0.4 * scale), lastOrder: '2026-07-01', status: 'Active', revPct: 45 }
    ],
    products: [
      { name: 'Paver Block', category: 'Blocks', qty: Math.round(18240 * scale), revenue: Math.round(82 * scale), margin: 28, returns: 0.8, revPct: 100 },
      { name: 'Kerb Stone', category: 'Kerb', qty: Math.round(13400 * scale), revenue: Math.round(53 * scale), margin: 24, returns: 1.2, revPct: 65 },
      { name: 'Hollow Block', category: 'Blocks', qty: Math.round(11200 * scale), revenue: Math.round(48 * scale), margin: 32, returns: 0.4, revPct: 59 },
      { name: 'Fly Ash Brick', category: 'Bricks', qty: Math.round(9800 * scale), revenue: Math.round(42 * scale), margin: 20, returns: 1.8, revPct: 51 },
      { name: 'AAC Block', category: 'Blocks', qty: Math.round(8400 * scale), revenue: Math.round(38 * scale), margin: 35, returns: 0.2, revPct: 46 }
    ]
  };
};

export const mockHeatMapData = (filters = {}) => {
  const scale = getFilterMultiplier(filters);
  const raw = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.round(Math.random() * 40 * scale)));
  [0,1,2,3,4].forEach(d => { raw[d][10] = Math.round(35 * scale); raw[d][11] = Math.round(38 * scale); raw[d][14] = Math.round(32 * scale); raw[d][15] = Math.round(36 * scale); });
  [5,6].forEach(d => raw[d].forEach((_, h) => { raw[d][h] = Math.round(raw[d][h] * 0.3); }));
  return {
    0: raw[0], 1: raw[1], 2: raw[2], 3: raw[3], 4: raw[4], 5: raw[5], 6: raw[6],
    flat: () => raw.flat(),
    insights: { peakDay: 'Wednesday', peakHour: '3 PM', slowPeriod: 'Sat–Sun 6–8 AM', weekendPct: 12 },
    monthCalendar: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, date: `2026-07-${String(i + 1).padStart(2, '0')}`, revenue: i < new Date().getDate() ? Math.round((5 + Math.random() * 20) * scale) : 0 })),
    maxDailyRevenue: Math.max(5, Math.round(25 * scale))
  };
};

export const getMergedKPIs = (dbData, filters = {}) => {
  const mock = mockKPIData(filters);
  if (!dbData || !dbData.summary || dbData.summary.length === 0) {
    return mock;
  }

  const summary = dbData.summary;
  let totalRevenueNum = 0;
  let totalOrdersVal = 0;
  summary.forEach(s => {
    totalRevenueNum += parseFloat(s.total_revenue || 0);
    totalOrdersVal += parseInt(s.order_count || 0);
  });

  let delivered = 0;
  let inProduction = 0;
  let cancelled = 0;
  let pending = 0;
  if (dbData.orderStatus) {
    dbData.orderStatus.forEach(s => {
      const statusLower = String(s.status).toLowerCase();
      if (statusLower === 'delivered' || statusLower === 'closed' || statusLower === 'invoiced') {
        delivered += parseInt(s.count || 0);
      } else if (statusLower === 'in production' || statusLower === 'production' || statusLower === 'qc') {
        inProduction += parseInt(s.count || 0);
      } else if (statusLower === 'cancelled' || statusLower === 'rejected') {
        cancelled += parseInt(s.count || 0);
      } else {
        pending += parseInt(s.count || 0);
      }
    });
  }

  const totalRevenue = totalRevenueNum > 0 ? (totalRevenueNum / 10000000).toFixed(2) : mock.totalRevenue;
  const totalOrders = totalOrdersVal > 0 ? totalOrdersVal : mock.totalOrders;
  const avgOrderValue = totalOrders > 0 ? ((totalRevenueNum / totalOrders) / 1000).toFixed(1) : mock.avgOrderValue;
  const revenuePerDay = (totalRevenueNum > 0 ? ((totalRevenueNum / 30) / 100000).toFixed(1) : mock.revenuePerDay);

  const pendingPayments = dbData.kpis?.finance?.outstandingReceivables 
    ? Math.round(dbData.kpis.finance.outstandingReceivables / 100000) 
    : mock.pendingPayments;

  const leadConvRate = dbData.kpis?.sales?.leadConversionRate || mock.leadConvRate;
  const qualifyRate = dbData.kpis?.sales?.quoteWinRate || mock.qualifyRate;
  const avgLeadCycle = dbData.kpis?.sales?.averageSalesCycleDays || mock.avgLeadCycle;

  const totalCustomers = dbData.customerPerformance?.length || mock.totalCustomers;

  return {
    ...mock,
    totalRevenue,
    avgOrderValue,
    revenuePerDay,
    pendingPayments,
    totalOrders,
    deliveredOrders: delivered > 0 ? delivered : Math.round(totalOrders * 0.9),
    inProduction: inProduction > 0 ? inProduction : Math.round(totalOrders * 0.07),
    cancelledOrders: cancelled > 0 ? cancelled : Math.round(totalOrders * 0.03),
    leadConvRate,
    qualifyRate,
    avgLeadCycle,
    totalCustomers,
    newCustomers: Math.max(1, Math.round(totalCustomers * 0.15)),
    repeatCustomers: Math.max(1, Math.round(totalCustomers * 0.6))
  };
};

export const getMergedCharts = (dbData, filters = {}) => {
  const mock = mockChartData(filters);
  if (!dbData || !dbData.summary || dbData.summary.length === 0) {
    return mock;
  }

  const monthlyRevenue = dbData.summary.map(s => ({
    month: s.month,
    revenue: Math.round(parseFloat(s.total_revenue || 0) / 100000),
    target: Math.round((parseFloat(s.total_revenue || 0) / 100000) * 1.1)
  })).reverse();

  const orderStatus = dbData.summary.map(s => ({
    month: s.month,
    delivered: s.order_count,
    production: 0,
    pending: 0,
    cancelled: 0
  })).reverse();

  return {
    ...mock,
    monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : mock.monthlyRevenue,
    orderStatus: orderStatus.length > 0 ? orderStatus : mock.orderStatus
  };
};

export const getMergedProducts = (dbData, filters = {}) => {
  const mock = mockProductData(filters);
  if (!dbData || !dbData.topProducts || dbData.topProducts.length === 0) {
    return mock;
  }

  const topProducts = dbData.topProducts.slice(0, 10).map(p => ({
    product: p.product_name,
    revenue: Math.round(parseFloat(p.total_revenue || 0) / 100000)
  }));

  const topSelling = dbData.topProducts.slice(0, 5).map(p => ({
    product: p.product_name,
    category: p.category_name || 'General',
    qty: p.total_quantity,
    revenue: Math.round(parseFloat(p.total_revenue || 0) / 100000),
    avgPrice: parseFloat(p.avg_price || 0).toLocaleString('en-IN'),
    growth: 10
  }));

  return {
    ...mock,
    topProducts: topProducts.length > 0 ? topProducts : mock.topProducts,
    topSelling: topSelling.length > 0 ? topSelling : mock.topSelling
  };
};

export const getMergedFunnel = (dbData, filters = {}) => {
  return mockFunnelData(filters);
};

export const getMergedRegional = (dbData, filters = {}) => {
  return mockRegionalData(filters);
};

export const getMergedPayment = (dbData, filters = {}) => {
  return mockPaymentData(filters);
};

export const getMergedLeaderboards = (dbData, filters = {}) => {
  const mock = mockLeaderboardData(filters);
  if (!dbData) return mock;

  const customers = (dbData.customerPerformance || []).slice(0, 5).map((c, idx) => ({
    name: c.customer_name,
    orders: c.order_count,
    revenue: Math.round(parseFloat(c.total_revenue || 0) / 100000),
    outstanding: 0,
    lastOrder: '—',
    status: 'Active',
    revPct: idx === 0 ? 100 : Math.round((parseFloat(c.total_revenue) / parseFloat(dbData.customerPerformance[0].total_revenue)) * 100)
  }));

  const products = (dbData.topProducts || []).slice(0, 5).map((p, idx) => ({
    name: p.product_name,
    category: p.category_name || 'General',
    qty: p.total_quantity,
    revenue: Math.round(parseFloat(p.total_revenue || 0) / 100000),
    margin: 30,
    returns: 0.5,
    revPct: idx === 0 ? 100 : Math.round((parseFloat(p.total_revenue) / parseFloat(dbData.topProducts[0].total_revenue)) * 100)
  }));

  return {
    ...mock,
    customers: customers.length > 0 ? customers : mock.customers,
    products: products.length > 0 ? products : mock.products
  };
};

export const getMergedExplorer = (dbData, filters = {}) => {
  const mock = getFilteredExplorerData(filters);
  if (!dbData) return mock;

  const totalProducts = dbData.topProducts?.length || mock.summary.totalProducts;
  const orderCount = dbData.summary?.reduce((acc, s) => acc + parseInt(s.order_count || 0), 0) || mock.summary.orders;
  const totalSales = dbData.summary?.reduce((acc, s) => acc + parseFloat(s.total_revenue || 0), 0) || mock.summary.sales;
  const customerCount = dbData.customerPerformance?.length || mock.summary.customers;

  const summary = {
    ...mock.summary,
    totalProducts,
    orders: orderCount,
    sales: totalSales,
    customers: customerCount
  };

  const products = (dbData.topProducts || []).map(p => ({
    sku: p.product_code || '—',
    product: p.product_name,
    category: p.category_name || 'General',
    size: '—',
    color: '—',
    price: p.avg_price,
    orders: p.order_count,
    qty: p.total_quantity,
    revenue: p.total_revenue,
    cost: p.total_revenue * 0.7,
    profit: p.total_revenue * 0.3,
    margin: 30,
    stock: 0,
    reserved: 0,
    pendingProduction: 0
  }));

  const customers = (dbData.customerPerformance || []).map(c => ({
    customer: c.customer_name,
    industry: 'Construction',
    state: c.state || 'Gujarat',
    city: c.city || 'Ahmedabad',
    orders: c.order_count,
    revenue: c.total_revenue,
    outstanding: 0,
    collected: c.total_revenue,
    pending: 0,
    lastOrder: '—',
    executive: '—'
  }));

  return {
    ...mock,
    summary,
    products: products.length > 0 ? products : mock.products,
    customers: customers.length > 0 ? customers : mock.customers
  };
};

