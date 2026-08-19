import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(query: any = {}) {
    const toNumber = (val: any) => (val === null || val === undefined ? 0 : Number(val) || 0);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const period = query?.period || 'This Month';
    const branchId = query?.branchId || (query?.branch !== 'All' ? query?.branch : undefined);

    let fromDate = new Date(year, month, 1, 0, 0, 0, 0);
    let toDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    let prevFromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    let prevToDate = new Date(year, month, 0, 23, 59, 59, 999);

    if (query.from && query.to) {
      fromDate = new Date(`${query.from}T00:00:00.000Z`);
      toDate = new Date(`${query.to}T23:59:59.999Z`);
      const duration = toDate.getTime() - fromDate.getTime();
      prevToDate = new Date(fromDate.getTime() - 1);
      prevFromDate = new Date(prevToDate.getTime() - duration);
    } else if (query.startDate && query.endDate) {
      fromDate = new Date(`${query.startDate}T00:00:00.000Z`);
      toDate = new Date(`${query.endDate}T23:59:59.999Z`);
      const duration = toDate.getTime() - fromDate.getTime();
      prevToDate = new Date(fromDate.getTime() - 1);
      prevFromDate = new Date(prevToDate.getTime() - duration);
    } else {
      switch (period) {
        case 'Today': {
          fromDate = new Date(year, month, now.getDate(), 0, 0, 0, 0);
          toDate = new Date(year, month, now.getDate(), 23, 59, 59, 999);
          prevFromDate = new Date(year, month, now.getDate() - 1, 0, 0, 0, 0);
          prevToDate = new Date(year, month, now.getDate() - 1, 23, 59, 59, 999);
          break;
        }
        case 'Yesterday': {
          fromDate = new Date(year, month, now.getDate() - 1, 0, 0, 0, 0);
          toDate = new Date(year, month, now.getDate() - 1, 23, 59, 59, 999);
          prevFromDate = new Date(year, month, now.getDate() - 2, 0, 0, 0, 0);
          prevToDate = new Date(year, month, now.getDate() - 2, 23, 59, 59, 999);
          break;
        }
        case 'This Week': {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          fromDate = new Date(year, month, diff, 0, 0, 0, 0);
          toDate = new Date(year, month, diff + 6, 23, 59, 59, 999);
          prevFromDate = new Date(year, month, diff - 7, 0, 0, 0, 0);
          prevToDate = new Date(year, month, diff - 1, 23, 59, 59, 999);
          break;
        }
        case 'Last Week': {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          fromDate = new Date(year, month, diff - 7, 0, 0, 0, 0);
          toDate = new Date(year, month, diff - 1, 23, 59, 59, 999);
          prevFromDate = new Date(year, month, diff - 14, 0, 0, 0, 0);
          prevToDate = new Date(year, month, diff - 8, 23, 59, 59, 999);
          break;
        }
        case 'This Month': {
          fromDate = new Date(year, month, 1, 0, 0, 0, 0);
          toDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
          prevFromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
          prevToDate = new Date(year, month, 0, 23, 59, 59, 999);
          break;
        }
        case 'Last Month': {
          fromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
          toDate = new Date(year, month, 0, 23, 59, 59, 999);
          prevFromDate = new Date(year, month - 2, 1, 0, 0, 0, 0);
          prevToDate = new Date(year, month - 1, 0, 23, 59, 59, 999);
          break;
        }
        case 'This Quarter': {
          const qStartMonth = Math.floor(month / 3) * 3;
          fromDate = new Date(year, qStartMonth, 1, 0, 0, 0, 0);
          toDate = new Date(year, qStartMonth + 3, 0, 23, 59, 59, 999);
          prevFromDate = new Date(year, qStartMonth - 3, 1, 0, 0, 0, 0);
          prevToDate = new Date(year, qStartMonth, 0, 23, 59, 59, 999);
          break;
        }
        case 'Last Quarter': {
          const qStartMonth = Math.floor(month / 3) * 3;
          fromDate = new Date(year, qStartMonth - 3, 1, 0, 0, 0, 0);
          toDate = new Date(year, qStartMonth, 0, 23, 59, 59, 999);
          prevFromDate = new Date(year, qStartMonth - 6, 1, 0, 0, 0, 0);
          prevToDate = new Date(year, qStartMonth - 3, 0, 23, 59, 59, 999);
          break;
        }
        case 'This Financial Year': {
          const fyStartYear = month >= 3 ? year : year - 1;
          fromDate = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
          toDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
          prevFromDate = new Date(fyStartYear - 1, 3, 1, 0, 0, 0, 0);
          prevToDate = new Date(fyStartYear, 2, 31, 23, 59, 59, 999);
          break;
        }
        case 'Last Financial Year': {
          const fyStartYear = month >= 3 ? year - 1 : year - 2;
          fromDate = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
          toDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
          prevFromDate = new Date(fyStartYear - 1, 3, 1, 0, 0, 0, 0);
          prevToDate = new Date(fyStartYear, 2, 31, 23, 59, 59, 999);
          break;
        }
      }
    }

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const [
      salesOrders,
      prevSalesOrders,
      todayOrders,
      yesterdayOrders,
      customerPayments,
      expenses,
      dispatches,
      todayDispatches,
      todayProductionReports,
      productionTargets,
      products,
      employees,
      departments,
      salesReturns,
      replacementOrders
    ] = await (Promise.all([
      this.prisma.salesOrder.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: fromDate, lte: toDate },
          ...(branchId ? { customer: { branchId } } : {})
        },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { product: true } },
          dispatches: true,
          customerPayments: true
        }
      }).catch(() => []),
      this.prisma.salesOrder.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: prevFromDate, lte: prevToDate }
        }
      }).catch(() => []),
      this.prisma.salesOrder.findMany({
        where: { deletedAt: null, createdAt: { gte: todayStart, lte: todayEnd } }
      }).catch(() => []),
      this.prisma.salesOrder.findMany({
        where: { deletedAt: null, createdAt: { gte: yesterdayStart, lte: yesterdayEnd } }
      }).catch(() => []),
      this.prisma.customerPayment.findMany({
        where: {
          status: { in: ['VERIFIED'] },
          receivedAt: { gte: fromDate, lte: toDate }
        },
        include: { customer: true, salesOrder: true }
      }).catch(() => []),
      this.prisma.expense.findMany({
        where: {
          status: 'APPROVED',
          expenseDate: { gte: fromDate, lte: toDate }
        }
      }).catch(() => []),
      this.prisma.dispatch.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } },
        include: { items: true, salesOrder: { include: { customer: true } } }
      }).catch(() => []),
      this.prisma.dispatch.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: { items: true }
      }).catch(() => []),
      this.prisma.productionDailyReport.findMany({
        where: { reportDate: { gte: todayStart, lte: todayEnd } },
        include: { items: true }
      }).catch(() => []),
      this.prisma.productionTarget.findMany({
        where: { status: 'ACTIVE', startDate: { lte: toDate }, endDate: { gte: fromDate } }
      }).catch(() => []),
      this.prisma.product.findMany({
        where: { isActive: true },
        include: { FinishedGoods: true }
      }).catch(() => []),
      this.prisma.employee.findMany({
        where: { status: { not: 'TERMINATED' } },
        include: { department: true }
      }).catch(() => []),
      this.prisma.department.findMany({ where: { isActive: true } }).catch(() => []),
      this.prisma.salesReturn.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } },
        include: { items: true, creditNotes: true }
      }).catch(() => []),
      this.prisma.replacementOrder.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } }
      }).catch(() => [])
    ]) as any) as [any[], any[], any[], any[], any[], any[], any[], any[], any[], any[], any[], any[], any[], any[], any[]];

    // 1. Financial Command Center (Sales + Finance)
    const confirmedStatuses = new Set(['CONFIRMED', 'SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'COMPLETED', 'DELIVERED', 'PAID']);
    const validSalesOrders = salesOrders.filter((o: any) => confirmedStatuses.has(o.status) || o.status === 'CONFIRMED' || o.totalAmount > 0);
    const totalSales: number = validSalesOrders.reduce((sum: number, o: any) => sum + toNumber(o.totalAmount || o.subtotal), 0);
    const confirmedOrders: number = validSalesOrders.length;
    const prevTotalSales: number = prevSalesOrders.filter((o: any) => confirmedStatuses.has(o.status) || o.totalAmount > 0).reduce((sum: number, o: any) => sum + toNumber(o.totalAmount || o.subtotal), 0);
    const salesGrowthPercent = prevTotalSales > 0 ? Number((((totalSales - prevTotalSales) / prevTotalSales) * 100).toFixed(1)) : null;

    const paymentReceived: number = customerPayments.reduce((sum: number, p: any) => sum + toNumber(p.amount), 0);
    const outstanding: number = Math.max(0, totalSales - paymentReceived);
    const pendingInvoices: number = validSalesOrders.filter((o: any) => o.status !== 'PAID' && o.status !== 'COMPLETED').length;
    const debtorCustomers: number = new Set(validSalesOrders.filter((o: any) => o.status !== 'PAID').map((o: any) => o.customerId)).size;

    const overdue: number = validSalesOrders
      .filter((o: any) => {
        if (o.status === 'PAID' || o.status === 'COMPLETED') return false;
        const days = o.paymentTermsDays || 30;
        const dueDate = new Date(new Date(o.orderDate || o.createdAt).getTime() + days * 24 * 60 * 60 * 1000);
        return dueDate.getTime() < now.getTime();
      })
      .reduce((sum: number, o: any) => sum + toNumber(o.totalAmount || o.subtotal), 0);

    const totalExpense: number = expenses.reduce((sum: number, e: any) => sum + toNumber(e.amount), 0);
    const grossProfit: number = Math.max(0, totalSales - totalExpense);
    const estimatedNetProfit: number = totalSales - totalExpense;
    const profitMarginPercent = totalSales > 0 ? Number(((estimatedNetProfit / totalSales) * 100).toFixed(1)) : 0;

    // 2. Operational Overview
    const dailyProduction: number = todayProductionReports.reduce((sum: number, r: any) => sum + (r.totalSets || r.totalCovers || 0), 0);
    const productionTarget: number = productionTargets.length > 0
      ? Math.round(productionTargets.reduce((sum: number, t: any) => sum + t.quantityTarget, 0) / 30)
      : 0;
    const productionAchievement = productionTarget > 0 ? Number(((dailyProduction / productionTarget) * 100).toFixed(1)) : 0;

    const dispatchCount: number = todayDispatches.length;
    const dispatchedQuantity: number = todayDispatches.reduce((sum: number, d: any) => sum + (d.items?.reduce((isum: number, it: any) => isum + toNumber(it.quantity), 0) || toNumber(d.deliveredQuantity)), 0);
    const pendingDispatchOrders: number = validSalesOrders.filter((o: any) => o.status === 'CONFIRMED' || o.status === 'READY_FOR_PICKUP' || o.status === 'DISPATCH_APPROVED').length;

    const dailySales: number = todayOrders.reduce((sum: number, o: any) => sum + toNumber(o.totalAmount || o.subtotal), 0);
    const dailySalesOrders: number = todayOrders.length;
    const yesterdaySales: number = yesterdayOrders.reduce((sum: number, o: any) => sum + toNumber(o.totalAmount || o.subtotal), 0);
    const dailySalesGrowth = yesterdaySales > 0 ? Number((((dailySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1)) : null;

    const openOrders = validSalesOrders.filter((o: any) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    const pendingOrders: number = openOrders.length;
    const urgentOrders: number = openOrders.filter((o: any) => String(o.remarks || '').toLowerCase().includes('urgent') || String(o.deliveryTerms || '').toLowerCase().includes('urgent')).length;

    let lowStockItems = 0;
    let outOfStockItems = 0;
    products.forEach((p: any) => {
      const stock = p.FinishedGoods ? toNumber(p.FinishedGoods.availableQuantity) : 0;
      const minStock = toNumber(p.minimumStock);
      if (stock <= 0 && minStock > 0) {
        outOfStockItems++;
      } else if (stock > 0 && stock <= minStock) {
        lowStockItems++;
      }
    });

    // 3. Where Did We Spend Money?
    const totalTransportCost: number = dispatches.reduce((sum: number, d: any) => sum + toNumber(d.freightAmount), 0);
    const periodDispatchCount: number = dispatches.length;
    const periodDispatchedQty: number = dispatches.reduce((sum: number, d: any) => sum + (d.items?.reduce((isum: number, it: any) => isum + toNumber(it.quantity), 0) || toNumber(d.deliveredQuantity)), 0);
    const averageCostPerDispatch = periodDispatchCount > 0 ? Math.round(totalTransportCost / periodDispatchCount) : 0;
    const costPerDeliveredUnit = periodDispatchedQty > 0 ? Math.round(totalTransportCost / periodDispatchedQty) : 0;

    const grossPayroll: number = employees.reduce((sum: number, e: any) => sum + toNumber(e.baseSalary), 0);
    const payrollTotal: number = grossPayroll;

    const returnedValue: number = salesReturns.reduce((sum: number, r: any) => sum + (r.creditNotes?.reduce((csum: number, cn: any) => csum + toNumber(cn.amount), 0) || 0), 0);
    const replacementCost: number = replacementOrders.reduce((sum: number, ro: any) => sum + toNumber(ro.commercialValue), 0);
    const salesReturnsTotal: number = returnedValue + replacementCost;

    // 4. Expense Breakdown (Real Expense Management Categories)
    const expenseGroupMap = new Map<string, number>();
    expenses.forEach((e: any) => {
      const catName = e.expenseName || 'General Operations';
      expenseGroupMap.set(catName, (expenseGroupMap.get(catName) || 0) + toNumber(e.amount));
    });
    const expColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ea580c', '#ec4899', '#5E6B82'];
    const expenseBreakdown = Array.from(expenseGroupMap.entries()).map(([category, amount], idx) => ({
      category,
      name: category,
      amount,
      value: Number((amount / 100000).toFixed(2)),
      percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0,
      percent: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0,
      color: expColors[idx % expColors.length]
    }));

    // 5. Department-Wise Cost Analysis (COST ONLY, no revenue, no units)
    const empDeptMap = new Map<string, string>();
    employees.forEach((e: any) => {
      if (e.department?.name) empDeptMap.set(e.id, e.department.name);
    });

    const deptCostMap = new Map<string, number>();
    departments.forEach((d: any) => deptCostMap.set(d.name, 0));

    expenses.forEach((e: any) => {
      const dName = empDeptMap.get(e.employeeId) || 'General Operations';
      deptCostMap.set(dName, (deptCostMap.get(dName) || 0) + toNumber(e.amount));
    });

    const deptColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1'];
    const departmentCosts = Array.from(deptCostMap.entries()).map(([name, cost], idx) => ({
      name,
      cost: cost >= 100000 ? `₹${(cost / 100000).toFixed(2)} L` : `₹${cost.toLocaleString('en-IN')}`,
      costVal: cost,
      accent: deptColors[idx % deptColors.length]
    }));

    // 6. Order-Wise Profitability Control (Real Orders Only, NO Rework tab)
    const orderProfitability = validSalesOrders.map((o: any, idx: number) => {
      const sales = toNumber(o.totalAmount || o.subtotal);
      const directCost = toNumber(o.freightAmount);
      const orderGrossProfit = sales - directCost;
      const margin = sales > 0 ? Number(((orderGrossProfit / sales) * 100).toFixed(1)) : 0;
      let category = 'Normal';
      if (margin >= 35) category = 'Most Profitable';
      else if (orderGrossProfit < 0 || margin < 0) category = 'Loss-Making';
      else if (directCost > 10000) category = 'High Transport';

      return {
        id: o.orderNumber || `SO-${idx + 1}`,
        cust: o.customer?.companyName || 'Unknown Customer',
        prod: o.items?.[0]?.productNameSnapshot || o.items?.[0]?.product?.name || 'Standard Product',
        qty: o.items?.reduce((s: number, it: any) => s + toNumber(it.orderedQuantity), 0) || 0,
        sales,
        directCost,
        grossProfit: orderGrossProfit,
        margin,
        category
      };
    });

    // 7. Top Customers (Real Orders Only)
    const custMap = new Map<string, { customerId: string; name: string; salesValue: number; orderCount: number }>();
    validSalesOrders.forEach((o: any) => {
      const cId = o.customerId;
      const cName = o.customer?.companyName || 'Unknown Customer';
      const amt = toNumber(o.totalAmount || o.subtotal);
      const existing = custMap.get(cId) || { customerId: cId, name: cName, salesValue: 0, orderCount: 0 };
      existing.salesValue += amt;
      existing.orderCount += 1;
      custMap.set(cId, existing);
    });

    const topCustomers = Array.from(custMap.values())
      .sort((a, b) => b.salesValue - a.salesValue)
      .slice(0, 5)
      .map(c => ({
        customerId: c.customerId,
        customerName: c.name,
        name: c.name,
        salesValue: c.salesValue,
        revenue: c.salesValue >= 100000 ? `₹${(c.salesValue / 100000).toFixed(2)} L` : `₹${c.salesValue.toLocaleString('en-IN')}`,
        orderCount: c.orderCount,
        orders: c.orderCount,
        yoyGrowthPercent: null
      }));

    // 8. Recent Orders (Real Orders Only)
    const recentOrders = validSalesOrders.slice(0, 10).map((o: any, idx: number) => {
      let stage = 'Production';
      const s = String(o.status || '').toUpperCase();
      if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'CLOSED') stage = 'Delivered';
      else if (s === 'DISPATCHED' || s === 'IN_TRANSIT') stage = 'Dispatch';
      else if (s === 'QC_PENDING' || s === 'QC_PASSED' || s === 'QC_IN_PROGRESS') stage = 'QC';
      else if (o.dispatches && o.dispatches.length > 0) stage = 'Dispatch';

      const val = toNumber(o.totalAmount || o.subtotal);
      return {
        id: o.orderNumber || `SO-${idx + 1}`,
        cust: o.customer?.companyName || 'Client',
        prod: o.items?.[0]?.productNameSnapshot || o.items?.[0]?.product?.name || 'Standard Item',
        qty: `${o.items?.[0]?.orderedQuantity || 0} Units`,
        stage,
        amount: val >= 100000 ? `₹${(val / 100000).toFixed(2)} L` : `₹${val.toLocaleString('en-IN')}`,
        priority: String(o.remarks || '').toLowerCase().includes('urgent') ? 'Urgent' : 'Normal'
      };
    });

    // 9. Monthly Performance (Real 4-month P&L aggregation)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = now.getMonth();
    const past4Months = [3, 2, 1, 0].map(offset => {
      const d = new Date(now.getFullYear(), currentMonthIdx - offset, 1);
      return {
        month: monthNames[d.getMonth()],
        startDate: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0),
        endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    });

    const monthlyPerformance = past4Months.map(m => {
      const mSales = validSalesOrders
        .filter((o: any) => new Date(o.createdAt) >= m.startDate && new Date(o.createdAt) <= m.endDate)
        .reduce((sum: number, o: any) => sum + toNumber(o.totalAmount || o.subtotal), 0);
      const mPayments = customerPayments
        .filter((p: any) => new Date(p.receivedAt) >= m.startDate && new Date(p.receivedAt) <= m.endDate)
        .reduce((sum: number, p: any) => sum + toNumber(p.amount), 0);
      const mExpenses = expenses
        .filter((e: any) => new Date(e.expenseDate) >= m.startDate && new Date(e.expenseDate) <= m.endDate)
        .reduce((sum: number, e: any) => sum + toNumber(e.amount), 0);
      const mGross = Math.max(0, mSales - mExpenses);
      const mNet = mSales - mExpenses;

      return {
        month: m.month,
        revenue: Number((mSales / 100000).toFixed(2)),
        collected: Number((mPayments / 100000).toFixed(2)),
        expense: Number((mExpenses / 100000).toFixed(2)),
        grossProfit: Number((mGross / 100000).toFixed(2)),
        estimatedProfit: Number((mNet / 100000).toFixed(2))
      };
    });

    // 10. Executive Alerts (Real Triggers Only)
    const executiveAlerts: any[] = [];
    if (overdue > 0) {
      executiveAlerts.push({
        id: 1,
        type: 'danger',
        icon: 'FileText',
        title: 'Overdue Customer Payment',
        message: `₹${(overdue / 100000).toFixed(2)} L customer payments are overdue across pending invoices.`,
        time: 'Real-time'
      });
    }
    if (lowStockItems > 0 || outOfStockItems > 0) {
      executiveAlerts.push({
        id: 2,
        type: 'warning',
        icon: 'AlertTriangle',
        title: 'Low Stock Alert',
        message: `${lowStockItems + outOfStockItems} items are low or out of stock in warehouse.`,
        time: 'Real-time'
      });
    }

    // 11. Top Products (Real Order Items)
    const productSalesMap = new Map<string, number>();
    validSalesOrders.forEach((o: any) => {
      o.items?.forEach((item: any) => {
        const pName = item.productNameSnapshot || item.product?.name || 'Standard Product';
        const pTotal = toNumber(item.lineTotal || (toNumber(item.orderedQuantity) * toNumber(item.unitPrice)));
        productSalesMap.set(pName, (productSalesMap.get(pName) || 0) + pTotal);
      });
    });

    const topProductsData = Array.from(productSalesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, val], idx) => {
        const percent = totalSales > 0 ? Math.round((val / totalSales) * 100) : 0;
        return {
          name,
          value: Number((val / 100000).toFixed(2)),
          percent,
          color: expColors[idx % expColors.length]
        };
      });

    // 12. Receivables Aging
    const ageingData = [
      { name: '0 - 30 Days', value: Number((outstanding / 100000).toFixed(2)), count: pendingInvoices, color: '#10B981' },
      { name: '31 - 60 Days', value: 0, count: 0, color: '#F59E0B' },
      { name: '61 - 90 Days', value: 0, count: 0, color: '#EF4444' },
      { name: '90+ Days Critical', value: Number((overdue / 100000).toFixed(2)), count: overdue > 0 ? 1 : 0, color: '#8B5CF6' }
    ];

    // Canonical Section 16 Response Payload + Backwards Compatible Flat KPIs
    return {
      period: {
        period,
        startDate: fromDate.toISOString().slice(0, 10),
        endDate: toDate.toISOString().slice(0, 10)
      },

      financial: {
        totalSales,
        confirmedOrders,
        salesGrowthPercent,
        paymentReceived,
        outstanding,
        pendingInvoices,
        debtorCustomers,
        overdue,
        totalExpense
      },

      operational: {
        dailyProduction,
        productionTarget,
        productionAchievement,
        dispatchCount,
        dispatchedQuantity,
        pendingDispatchOrders,
        dailySales,
        dailySalesOrders,
        dailySalesGrowth,
        pendingOrders,
        urgentOrders,
        pendingPayments: outstanding,
        activeDebtors: debtorCustomers,
        overduePayments: overdue,
        lowStockItems,
        outOfStockItems
      },

      expenditure: {
        trackedExpenses: totalExpense,
        dispatch: {
          totalTransportCost,
          dispatchCount: periodDispatchCount,
          averageCostPerDispatch,
          costPerDeliveredUnit
        },
        payroll: {
          total: payrollTotal,
          grossPayroll,
          overtime: 0,
          bonus: 0
        },
        salesReturns: {
          total: salesReturnsTotal,
          returnedValue,
          replacementCost,
          logisticsCost: 0
        }
      },

      kpis: {
        totalSalesVal: totalSales,
        totalOrdersCount: confirmedOrders,
        salesGrowthPercent,
        revenueCollected: paymentReceived,
        outstandingReceivables: outstanding,
        overdueAmount: overdue,
        pendingInvoicesCount: pendingInvoices,
        activeCustomersCount: debtorCustomers,
        totalBusinessExpense: totalExpense,
        grossProfit,
        estimatedNetProfit,
        profitMarginPercent,
        dailyProductionTarget: productionTarget,
        dailyProductionVal: dailyProduction,
        dailyProductionProgress: productionAchievement,
        dailyDispatchCount: dispatchCount,
        dailyUnitsDispatched: dispatchedQuantity,
        dailyDispatchPending: pendingDispatchOrders,
        dailySalesVal: dailySales,
        dailySalesOrders,
        pendingOrdersCount: pendingOrders,
        urgentOrdersCount: urgentOrders,
        lowStockCount: lowStockItems + outOfStockItems,
        criticalStockCount: outOfStockItems,
        dispatchCost: totalTransportCost,
        totalDispatchesCount: periodDispatchCount,
        salaryCost: payrollTotal,
        grossPayroll,
        overtimeBonus: 0,
        salesReturnCost: salesReturnsTotal,
        returnedValue,
        replacementLogisticsCost: 0
      },

      expenseBreakdown,
      departmentCosts,
      orderProfitability,
      productionData: [
        { name: "Target", value: productionTarget, fill: "#D6E2F0" },
        { name: "Produced", value: dailyProduction, fill: "#10b981" }
      ],
      salesDispatchTrendData: [],
      monthlyPerformance,
      monthlyRevenueData: monthlyPerformance,
      monthlyProductionData: [],
      topProductsData,
      ageingData,
      topCustomers,
      recentOrders,
      executiveAlerts
    };
  }

  async getUserTypes() {
    const roles = await this.prisma.role.findMany({
      include: {
        _count: { select: { users: true, rolePermissions: true } }
      }
    });

    return roles.map(r => ({
      id: r.id,
      publicId: r.publicId,
      name: r.name,
      code: r.code,
      assignedUsersCount: r._count.users,
      permissionsCount: r._count.rolePermissions,
      isSystemType: true,
      isActive: true,
      createdAt: r.createdAt
    }));
  }

  async getPermissionsCatalog() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { code: 'asc' }
    });
    return permissions;
  }

  async getCompanies() {
    const list = await this.prisma.company.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { branches: true }
        }
      }
    });
    return list.map(c => ({
      id: c.id,
      publicId: c.publicId,
      name: c.name,
      industry: 'General Manufacturing',
      domain: c.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      branchesCount: c._count.branches,
      status: 'Active',
      createdAt: c.createdAt
    }));
  }

  async createCompany(dto: any) {
    const { randomUUID } = await import('crypto');
    const company = await this.prisma.company.create({
      data: {
        publicId: randomUUID(),
        name: dto.name
      }
    });
    return {
      id: company.id,
      publicId: company.publicId,
      name: company.name,
      industry: dto.industry || 'General Manufacturing',
      domain: dto.domain || (company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'),
      branchesCount: 0,
      status: 'Active',
      createdAt: company.createdAt
    };
  }

  async updateCompany(id: string, dto: any) {
    const company = await this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name
      }
    });
    return {
      id: company.id,
      publicId: company.publicId,
      name: company.name,
      industry: dto.industry || 'General Manufacturing',
      domain: dto.domain || (company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'),
      branchesCount: 0,
      status: 'Active',
      createdAt: company.createdAt
    };
  }

  async deleteCompany(id: string) {
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return { success: true };
  }

  async getRoles() {
    const list = await this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    return list.map(r => ({
      id: r.id,
      publicId: r.publicId,
      name: r.name,
      code: r.code,
      assignedUsersCount: r._count.users,
      isSystemType: true,
      isActive: true,
      createdAt: r.createdAt
    }));
  }

  /**
   * Read-only command-center projection.  Values intentionally remain raw
   * numbers so presentation/formatting is exclusively a frontend concern.
   */
  async getExecutiveCommandCenter(query: any, companyId: string) {
    const toNumber = (value: any) => Number(value ?? 0);
    const percentage = (numerator: number, denominator: number) => denominator ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;
    const dayStart = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const now = new Date();
    const end = query?.to ? new Date(`${query.to}T23:59:59.999Z`) : now;
    const start = query?.from ? new Date(`${query.from}T00:00:00.000Z`) : new Date(end.getFullYear(), end.getMonth(), 1);
    const duration = Math.max(1, end.getTime() - start.getTime() + 1);
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration + 1);
    const inRange = { gte: start, lte: end };
    const salesRole: any = {
      deletedAt: null,
      email: { not: { endsWith: '.test' } },
      OR: [
        { role: { code: { in: ['SALES_EXECUTIVE', 'SUPER_SALES', 'SALES_MANAGER', 'SALES_ADMIN'] } } },
        { role: { code: { contains: 'SALES', mode: 'insensitive' } } },
        { role: { name: { contains: 'Sales', mode: 'insensitive' } } },
        { email: { contains: 'sales', mode: 'insensitive' } }
      ]
    };
    const orderWhere: any = {
      deletedAt: null,
      createdAt: inRange,
      customer: { companyId },
      ...(query?.customerId ? { customerId: query.customerId } : {}),
      ...(query?.salespersonId ? { salesExecutiveId: query.salespersonId } : {}),
      ...(query?.status ? { status: query.status } : {}),
      ...(query?.branchId ? { customer: { companyId, branchId: query.branchId } } : {}),
      ...(query?.productId || query?.categoryId ? { items: { some: { ...(query.productId ? { productId: query.productId } : {}), ...(query.categoryId ? { product: { category: query.categoryId } } : {}) } } } : {})
    };
    const priorOrderWhere = { ...orderWhere, createdAt: { gte: previousStart, lte: previousEnd } };
    const [salespeople, branches, customers, products, orders, previousOrders, payments, invoices, leads, quotations, samples, dispatches, workOrders, qcInspections, targets] = await Promise.all([
      this.prisma.user.findMany({ where: salesRole, select: { id: true, name: true, email: true, role: { select: { code: true, name: true } } }, orderBy: { name: 'asc' } }).catch(() => []),
      this.prisma.branch.findMany({ where: { companyId, deletedAt: null }, select: { id: true, name: true } }).catch(() => []),
      this.prisma.customer.findMany({ where: { companyId, deletedAt: null }, select: { id: true, companyName: true } }).catch(() => []),
      this.prisma.product.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true, category: true } }).catch(() => []),
      this.prisma.salesOrder.findMany({ where: orderWhere, include: { customer: true, salesExecutive: { select: { id: true, name: true, email: true } }, items: { include: { product: true } }, invoices: { include: { paymentAllocations: { include: { payment: true } } } }, dispatches: true } }).catch(() => []),
      this.prisma.salesOrder.findMany({ where: priorOrderWhere, select: { totalAmount: true } }).catch(() => []),
      this.prisma.customerPayment.findMany({ where: { status: 'VERIFIED', receivedAt: inRange, customer: { companyId }, ...(query?.salespersonId ? { salesOrder: { salesExecutiveId: query.salespersonId } } : {}) }, include: { salesOrder: true } }).catch(() => []),
      this.prisma.salesInvoice.findMany({ where: { createdAt: { lte: end }, salesOrder: { customer: { companyId } } }, include: { salesOrder: { include: { customer: true, salesExecutive: true } }, paymentAllocations: { include: { payment: true } } } }).catch(() => []),
      this.prisma.lead.findMany({ where: { deletedAt: null, ...(companyId ? { OR: [{ companyId }, { companyId: null }] } : {}), ...(query?.salespersonId ? { OR: [{ salesExecutiveId: query.salespersonId }, { assignedToId: query.salespersonId }, { createdById: query.salespersonId }] } : {}) }, select: { id: true, salesExecutiveId: true, assignedToId: true, createdById: true, createdAt: true, convertedAt: true, source: true } }).catch(() => []),
      this.prisma.quotation.findMany({ where: { companyId, createdAt: inRange, deletedAt: null, ...(query?.salespersonId ? { OR: [{ salesExecutiveId: query.salespersonId }, { createdById: query.salespersonId }] } : {}) }, select: { id: true, salesExecutiveId: true, createdById: true, salesOrder: { select: { id: true } } } }).catch(() => []),
      this.prisma.sampleRequest.findMany({ where: { companyId, requestedDate: inRange, deletedAt: null, ...(query?.salespersonId ? { salesExecutiveId: query.salespersonId } : {}) }, select: { id: true, status: true, deliveredAt: true } }).catch(() => []),
      this.prisma.dispatch.findMany({ where: { createdAt: inRange, salesOrder: { customer: { companyId }, ...(query?.salespersonId ? { salesExecutiveId: query.salespersonId } : {}) } }, include: { salesOrder: true } }).catch(() => []),
      this.prisma.workOrder.findMany({ where: { createdAt: inRange, productionPlan: { salesOrder: { customer: { companyId } } } }, include: { productionPlan: { include: { salesOrder: true } }, qcInspections: true, shiftEntries: true, scrapEntries: true } }).catch(() => []),
      this.prisma.qCInspection.findMany({ where: { createdAt: inRange, workOrder: { productionPlan: { salesOrder: { customer: { companyId } } } } } }).catch(() => []),
      this.prisma.salesTarget.findMany({ where: { status: 'ACTIVE', startDate: { lte: end }, endDate: { gte: start }, salesperson: { companyId } } }).catch(() => [])
    ]) as any[];

    const confirmedStatuses = new Set(['CONFIRMED', 'SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'COMPLETED']);
    const confirmedOrders = orders.filter((order: any) => confirmedStatuses.has(order.status));
    const grossSalesRevenue = confirmedOrders.reduce((sum: number, order: any) => sum + toNumber(order.totalAmount), 0);
    const cashCollections = payments.reduce((sum: number, payment: any) => sum + toNumber(payment.amount), 0);
    const invoiceRows = invoices.filter((invoice: any) => invoice.status !== 'DRAFT');
    const receivables = invoiceRows.map((invoice: any) => ({ invoice, paid: invoice.paymentAllocations.filter((a: any) => a.payment.status === 'VERIFIED').reduce((sum: number, a: any) => sum + toNumber(a.amount), 0) }));
    const outstandingReceivables = receivables.reduce((sum: number, row: any) => sum + Math.max(0, toNumber(row.invoice.totalAmount) - row.paid), 0);
    const previousRevenue = previousOrders.filter((order: any) => confirmedStatuses.has(order.status)).reduce((sum: number, order: any) => sum + toNumber(order.totalAmount), 0);
      const periodLeads = leads.filter((lead: any) => lead.createdAt >= start && lead.createdAt <= end);
      const activeLeads = leads.filter((lead: any) => !lead.convertedAt).length;
      const convertedLeads = periodLeads.filter((lead: any) => !!lead.convertedAt).length;
    const passedQc = qcInspections.filter((item: any) => ['PASSED', 'APPROVED'].includes(item.status)).length;
    const completedQc = qcInspections.filter((item: any) => ['PASSED', 'APPROVED', 'FAILED', 'REWORK', 'PARTIAL'].includes(item.status)).length;
    const delivered = dispatches.filter((item: any) => item.status === 'DELIVERED');
    const onTimeDelivered = delivered.filter((item: any) => !item.salesOrder.requestedDeliveryDate || item.deliveredAt <= item.salesOrder.requestedDeliveryDate).length;
    const produced = workOrders.reduce((sum: number, item: any) => sum + item.shiftEntries.reduce((subtotal: number, entry: any) => subtotal + toNumber(entry.producedQty), 0), 0);
    const planned = workOrders.reduce((sum: number, item: any) => sum + toNumber(item.quantity), 0);
    const ageBuckets: any = { '0_30': { amount: 0, invoices: 0 }, '31_60': { amount: 0, invoices: 0 }, '61_90': { amount: 0, invoices: 0 }, '90_plus': { amount: 0, invoices: 0 } };
    receivables.forEach((row: any) => { const remaining = Math.max(0, toNumber(row.invoice.totalAmount) - row.paid); if (!remaining) return; const age = Math.max(0, Math.floor((now.getTime() - row.invoice.createdAt.getTime()) / 86400000)); const key = age <= 30 ? '0_30' : age <= 60 ? '31_60' : age <= 90 ? '61_90' : '90_plus'; ageBuckets[key].amount += remaining; ageBuckets[key].invoices += 1; });
    const targetByUser = new Map<string, number>(); targets.forEach((target: any) => targetByUser.set(target.salespersonId, (targetByUser.get(target.salespersonId) || 0) + toNumber(target.revenueTarget)));
    const executives = salespeople.map((user: any) => { const owns = (record: any) => [record.salesExecutiveId, record.assignedToId, record.createdById].includes(user.id); const userOrders = confirmedOrders.filter(owns); const revenue = userOrders.reduce((sum: number, order: any) => sum + toNumber(order.totalAmount), 0); const userPayments = payments.filter((payment: any) => owns(payment.salesOrder || {})).reduce((sum: number, payment: any) => sum + toNumber(payment.amount), 0); const userLeads = leads.filter(owns); const userQuotations = quotations.filter(owns); const targetRevenue = targetByUser.get(user.id) ?? null; return { userId: user.id, executive: user.name, name: user.name, email: user.email, leads: userLeads.length, leadsBreakdown: { total: userLeads.length, active: userLeads.filter((lead: any) => !lead.convertedAt).length, converted: userLeads.filter((lead: any) => lead.convertedAt).length }, quotations: { total: userQuotations.length, converted: userQuotations.filter((quotation: any) => quotation.salesOrder).length }, orders: { total: orders.filter(owns).length, confirmed: userOrders.length, delivered: userOrders.filter((order: any) => order.dispatches.some((dispatch: any) => dispatch.status === 'DELIVERED')).length }, revenue: revenue, revenueGenerated: revenue, collections: userPayments, outstanding: Math.max(0, revenue - userPayments), conversionRate: percentage(userLeads.filter((lead: any) => lead.convertedAt).length, userLeads.length), quotationConversionRate: percentage(userQuotations.filter((quotation: any) => quotation.salesOrder).length, userQuotations.length), averageOrderValue: userOrders.length ? revenue / userOrders.length : 0, targetRevenue, achievementPercent: targetRevenue ? percentage(revenue, targetRevenue) : null }; });
    const kpi = (value: number, previousValue = 0, target: number | null = null) => ({ value, previousValue, changePercent: previousValue ? percentage(value - previousValue, previousValue) : 0, target, achievementPercent: target ? percentage(value, target) : null });
    const sourceCounts = new Map<string, number>(); periodLeads.forEach((lead: any) => sourceCounts.set(lead.source || 'UNSPECIFIED', (sourceCounts.get(lead.source || 'UNSPECIFIED') || 0) + 1));
    const billingsReceipts = new Map<string, any>(); confirmedOrders.forEach((order: any) => { const key = order.orderDate.toISOString().slice(0, 10); const point = billingsReceipts.get(key) || { period: key, billings: 0, receipts: 0 }; point.billings += toNumber(order.totalAmount); billingsReceipts.set(key, point); }); payments.forEach((payment: any) => { const key = (payment.receivedAt || payment.createdAt).toISOString().slice(0, 10); const point = billingsReceipts.get(key) || { period: key, billings: 0, receipts: 0 }; point.receipts += toNumber(payment.amount); billingsReceipts.set(key, point); });
    const criticalExceptions = receivables.filter((row: any) => Math.max(0, toNumber(row.invoice.totalAmount) - row.paid) > 0 && row.invoice.createdAt < now).map((row: any) => ({ type: 'OVERDUE_RECEIVABLE', severity: 'HIGH', customer: row.invoice.salesOrder.customer.companyName, amount: Math.max(0, toNumber(row.invoice.totalAmount) - row.paid), daysOverdue: Math.floor((now.getTime() - row.invoice.createdAt.getTime()) / 86400000) })).slice(0, 20);
    return { generatedAt: now.toISOString(), period: { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), previousFrom: previousStart.toISOString().slice(0, 10), previousTo: previousEnd.toISOString().slice(0, 10), label: `${start.toLocaleDateString('en-GB')} – ${end.toLocaleDateString('en-GB')}` }, filters: { branches, customers, products, categories: [...new Set(products.map((product: any) => product.category).filter(Boolean))], salespersons: salespeople.map((user: any) => ({ id: user.id, name: user.name, email: user.email })), statuses: ['CONFIRMED', 'SENT_TO_PLANT', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'COMPLETED'] }, kpis: { grossSalesRevenue: kpi(grossSalesRevenue, previousRevenue), cashCollections: kpi(cashCollections), outstandingReceivables: kpi(outstandingReceivables), confirmedOrders: kpi(confirmedOrders.length), averageOrderValue: kpi(confirmedOrders.length ? grossSalesRevenue / confirmedOrders.length : 0), activeCrmLeads: kpi(activeLeads), leadConversionRate: kpi(percentage(convertedLeads, periodLeads.length)), quotationConversionRate: kpi(percentage(quotations.filter((quotation: any) => quotation.salesOrder).length, quotations.length)), productionOutputYield: kpi(percentage(produced, planned)), qcPassRate: kpi(percentage(passedQc, completedQc)), dispatchesDelivered: kpi(delivered.length), onTimeDispatchRate: kpi(percentage(onTimeDelivered, delivered.length)), overdueInvoices: kpi(ageBuckets['90_plus'].invoices), activeEnterpriseClients: kpi(new Set(confirmedOrders.map((order: any) => order.customerId)).size), sampleFulfillment: kpi(percentage(samples.filter((sample: any) => !!sample.deliveredAt).length, samples.length)), reworkAndScrapLoss: { value: 0, dataAvailable: false }, salesRepAchievement: kpi(grossSalesRevenue, 0, [...targetByUser.values()].reduce((sum, value) => sum + value, 0) || null) }, healthIndexes: { salesPipeline: { score: percentage(convertedLeads, periodLeads.length) }, productionRuntimes: { score: percentage(produced, planned) }, qcYields: { score: percentage(passedQc, completedQc) }, dispatchLogistics: { score: percentage(onTimeDelivered, delivered.length) }, collectionsEfficiency: { score: percentage(cashCollections, grossSalesRevenue) }, financeCashFlows: { score: percentage(cashCollections, grossSalesRevenue) } }, criticalExceptions, liveFeed: [...confirmedOrders.map((order: any) => ({ type: 'ORDER_CONFIRMED', occurredAt: order.confirmedAt || order.createdAt, details: order.orderNumber })), ...payments.map((payment: any) => ({ type: 'PAYMENT_VERIFIED', occurredAt: payment.verifiedAt || payment.receivedAt || payment.createdAt, details: payment.paymentNo })), ...delivered.map((dispatch: any) => ({ type: 'DISPATCH_DELIVERED', occurredAt: dispatch.deliveredAt || dispatch.updatedAt, details: dispatch.dispatchNo }))].sort((a: any, b: any) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, 50), charts: { billingsReceipts: [...billingsReceipts.values()].sort((a: any, b: any) => a.period.localeCompare(b.period)), productionOutput: [{ period: start.toISOString().slice(0, 10), planned, produced }], leadSources: [...sourceCounts.entries()].map(([source, count]) => ({ source, count, percentage: percentage(count, periodLeads.length) })) }, executives, receivablesAgeing: ageBuckets, transactions: orders.map((order: any) => ({ id: order.id, orderNumber: order.orderNumber, orderDate: order.orderDate, customer: order.customer.companyName, salesperson: order.salesExecutive?.name || null, salespersonId: order.salesExecutiveId, product: order.items[0]?.productNameSnapshot || null, quantity: order.items.reduce((sum: number, item: any) => sum + toNumber(item.orderedQuantity), 0), amount: toNumber(order.totalAmount), collected: order.invoices.reduce((sum: number, invoice: any) => sum + invoice.paymentAllocations.filter((allocation: any) => allocation.payment.status === 'VERIFIED').reduce((sub: number, allocation: any) => sub + toNumber(allocation.amount), 0), 0), status: order.status, dispatchStatus: order.dispatches[0]?.status || null })).slice(0, 100), pagination: { page: 1, pageSize: 100, total: orders.length }, diagnostics: process.env.NODE_ENV === 'production' ? undefined : { salesUsersFound: salespeople.length, leadsMatched: leads.length, quotationsMatched: quotations.length, ordersMatched: orders.length, invoicesMatched: invoices.length, paymentsMatched: payments.length, workOrdersMatched: workOrders.length, qcRecordsMatched: qcInspections.length, dispatchesMatched: dispatches.length } };
  }

  async getProductionAnalytics(query: any, companyId: string) {
    const number = (value: any) => Number(value ?? 0);
    const pct = (a: number, b: number) => b ? Number(((a / b) * 100).toFixed(2)) : null;
    const now = new Date();
    const end = query?.to ? new Date(`${query.to}T23:59:59.999Z`) : now;
    const start = query?.from ? new Date(`${query.from}T00:00:00.000Z`) : new Date(end.getFullYear(), end.getMonth(), 1);
    const duration = end.getTime() - start.getTime() + 1;
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration + 1);
    const productFilter: any = { ...(query?.productId ? { id: query.productId } : {}), ...(query?.categoryId ? { category: query.categoryId } : {}) };
    let statusFilter: any = {};
    if (query?.status) {
      if (query.status === 'CREATED') {
        statusFilter = { status: 'CREATED' };
      } else if (query.status === 'IN_PROGRESS') {
        statusFilter = {
          OR: [
            { status: 'STARTED' },
            { status: 'PARTIALLY_COMPLETED' },
            { status: 'READY' },
            { productionStatus: 'IN_PRODUCTION' },
            { productionStatus: 'REWORK_IN_PROGRESS' }
          ]
        };
      } else if (query.status === 'COMPLETED') {
        statusFilter = { status: 'COMPLETED' };
      } else if (query.status === 'QC_FAILED') {
        statusFilter = { productionStatus: 'QC_FAILED' };
      } else {
        statusFilter = { status: query.status };
      }
    }
    const workOrderWhere: any = { productionPlan: { salesOrder: { customer: { companyId, ...(query?.branchId ? { branchId: query.branchId } : {}) } } }, ...statusFilter, ...(query?.productId || query?.categoryId ? { salesOrderItem: { product: productFilter } } : {}) };
    const [entries, previousEntries, workOrders, targets, products, branches] = await Promise.all([
      this.prisma.productionShiftEntry.findMany({ where: { date: { gte: start, lte: end }, ...(query?.shiftId ? { shift: query.shiftId } : {}), workOrder: workOrderWhere }, include: { workOrder: { include: { qcInspections: true, scrapEntries: true, productionPlan: { include: { salesOrder: true } } } } } }),
      this.prisma.productionShiftEntry.findMany({ where: { date: { gte: previousStart, lte: previousEnd }, ...(query?.shiftId ? { shift: query.shiftId } : {}), workOrder: workOrderWhere }, select: { producedQty: true } }),
      this.prisma.workOrder.findMany({ where: workOrderWhere, include: { qcInspections: true, scrapEntries: true, productionPlan: true } }),
      this.prisma.productionTarget.findMany({ where: { status: 'ACTIVE', startDate: { lte: end }, endDate: { gte: start }, ...(query?.branchId ? { plantId: query.branchId } : {}) } }),
      this.prisma.product.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true, category: true, unit: true } }),
      this.prisma.branch.findMany({ where: { companyId, deletedAt: null }, select: { id: true, name: true } })
    ]) as any[];
    const actual = entries.reduce((sum: number, entry: any) => sum + number(entry.producedQty), 0);
    const plannedFromEntries = entries.reduce((sum: number, entry: any) => sum + number(entry.targetQty), 0);
    const configuredTarget = targets.reduce((sum: number, target: any) => sum + number(target.quantityTarget), 0);
    const target = configuredTarget || plannedFromEntries;
    const previousActual = previousEntries.reduce((sum: number, entry: any) => sum + number(entry.producedQty), 0);
    const accepted = workOrders.flatMap((workOrder: any) => workOrder.qcInspections).filter((qc: any) => ['PASSED', 'APPROVED'].includes(qc.status)).reduce((sum: number, qc: any) => sum + number(qc.approvedQuantity), 0) || actual;
    const reworkEntries = entries.filter((entry: any) => number(entry.reworkQty) > 0 || entry.workOrder.reworkCount > 0 || entry.workOrder.qcInspections.some((qc: any) => qc.status === 'REWORK'));
    const reworkQuantity = entries.reduce((sum: number, entry: any) => sum + number(entry.reworkQty), 0);
    const scrapEntries = workOrders.flatMap((workOrder: any) => workOrder.scrapEntries).filter((entry: any) => entry.date >= start && entry.date <= end);
    const scrapQuantity = scrapEntries.reduce((sum: number, entry: any) => sum + number(entry.scrapQty) + number(entry.wastageQty), 0);
    const shiftMap = new Map<string, any>();
    entries.forEach((entry: any) => { const row = shiftMap.get(entry.shift) || { shiftName: entry.shift, targetQuantity: 0, actualProduced: 0, reworkQuantity: 0, trackedCost: 0 }; row.targetQuantity += number(entry.targetQty); row.actualProduced += number(entry.producedQty); row.reworkQuantity += number(entry.reworkQty); shiftMap.set(entry.shift, row); });
    const shifts = [...shiftMap.values()].map((row: any) => ({ ...row, efficiencyPercent: pct(row.actualProduced, row.targetQuantity) }));
    const delayed = workOrders.filter((workOrder: any) => workOrder.productionPlan.plannedEndDate && workOrder.productionPlan.plannedEndDate < now && !['COMPLETED', 'CANCELLED'].includes(workOrder.status));
    return { generatedAt: now.toISOString(), period: { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), previousFrom: previousStart.toISOString().slice(0, 10), previousTo: previousEnd.toISOString().slice(0, 10) }, filters: { branches, products, categories: [...new Set(products.map((product: any) => product.category).filter(Boolean))], statuses: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'QC_FAILED'], shifts: [...new Set(entries.map((entry: any) => entry.shift))] }, plantYield: { percentage: pct(accepted, target), acceptedQuantity: accepted, plannedQuantity: target }, productionOutput: { actual, target, quotaAchievement: pct(actual, target), previousActual, changePercent: previousActual ? pct(actual - previousActual, previousActual) : null }, productionCost: { material: 0, labour: 0, power: 0, other: 0, total: 0, costPerUnit: null, dataAvailable: false }, rework: { batchCount: new Set(reworkEntries.map((entry: any) => entry.workOrderId)).size, quantity: reworkQuantity, cost: 0 }, scrap: { quantity: scrapQuantity, weightKg: null, cost: 0, wastageRate: null, threshold: 3 }, workOrders: { total: workOrders.length, completed: workOrders.filter((workOrder: any) => workOrder.status === 'COMPLETED').length, inProgress: workOrders.filter((workOrder: any) => workOrder.status === 'IN_PROGRESS').length, delayed: delayed.length, delayedQuantity: delayed.reduce((sum: number, workOrder: any) => sum + number(workOrder.quantity), 0) }, shiftPerformance: shifts };
  }

  async getInventoryAnalytics(query: any, companyId: string) {
    const toNumber = (val: any) => Number(val ?? 0);
    const now = new Date();
    const end = query?.to ? new Date(`${query.to}T23:59:59.999Z`) : now;
    const start = query?.from ? new Date(`${query.from}T00:00:00.000Z`) : new Date(end.getFullYear(), end.getMonth(), 1);
    const inRange = { gte: start, lte: end };

    const rawMaterialWhere: any = { companyId };
    if (query?.category && query.category !== 'All') {
      rawMaterialWhere.category = query.category;
    }
    if (query?.unit && query.unit !== 'All') {
      rawMaterialWhere.unit = query.unit;
    }
    if (query?.search) {
      const lower = String(query.search).trim();
      rawMaterialWhere.OR = [
        { name: { contains: lower, mode: 'insensitive' } },
        { sku: { contains: lower, mode: 'insensitive' } },
        { category: { contains: lower, mode: 'insensitive' } }
      ];
    }

    const [rawMaterials, allBranches, allTransactions, inRangeTransactions, purchaseIndents] = await Promise.all([
      this.prisma.rawMaterial.findMany({
        where: rawMaterialWhere,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.findMany({
        where: { companyId, deletedAt: null },
        select: { id: true, name: true }
      }),
      this.prisma.inventoryTransaction.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryTransaction.findMany({
        where: { companyId, createdAt: inRange },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseIndent.findMany({
        where: { companyId },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      }).catch(() => [])
    ]) as any[];

    const totalStockMap = new Map<string, number>();
    const lastInTxMap = new Map<string, Date>();
    const lastOutTxMap = new Map<string, Date>();
    const lastMovementMap = new Map<string, Date>();

    for (const tx of allTransactions) {
      const id = tx.rawMaterialId || tx.productId;
      if (!id) continue;

      const current = totalStockMap.get(id) || 0;
      const qty = toNumber(tx.quantity);
      const type = (tx.type || '').toUpperCase().trim();

      if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN'].includes(type)) {
        totalStockMap.set(id, current + qty);
        if (!lastInTxMap.has(id)) lastInTxMap.set(id, tx.createdAt);
      } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(type)) {
        totalStockMap.set(id, current - qty);
        if (!lastOutTxMap.has(id)) lastOutTxMap.set(id, tx.createdAt);
      } else if (type === 'ADJUSTMENT') {
        totalStockMap.set(id, current + qty);
      }

      if (!lastMovementMap.has(id)) {
        lastMovementMap.set(id, tx.createdAt);
      }
    }

    const materialIndentMap = new Map<string, string>();
    for (const indent of (purchaseIndents || [])) {
      for (const item of (indent.items || [])) {
        if (item.productId && !materialIndentMap.has(item.productId)) {
          materialIndentMap.set(item.productId, indent.status || 'PENDING');
        }
      }
    }

    let totalMaterialsCount = rawMaterials.length;
    let totalStockQty = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;
    let fastCount = 0;
    let slowCount = 0;
    let nonMovingCount = 0;

    const unitMap = new Map<string, { unit: string; materials: number; quantity: number }>();
    const categoryMap = new Map<string, { category: string; totalMaterials: number; inStock: number; lowStock: number; outOfStock: number; quantity: number; inventoryValue: number }>();

    const processedMaterials = rawMaterials.map(m => {
      const currentStock = totalStockMap.get(m.id) ?? 0;
      const minStock = toNumber(m.minimumStock);
      const unitCost = toNumber((m as any).unitPrice || (m as any).effectiveCost || 0);
      const value = currentStock > 0 ? currentStock * unitCost : 0;
      totalValuation += value;
      totalStockQty += currentStock;

      const shortage = Math.max(minStock - currentStock, 0);

      let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
      if (currentStock <= 0) {
        stockStatus = 'OUT_OF_STOCK';
        outOfStockCount++;
      } else if (currentStock <= minStock) {
        stockStatus = 'LOW_STOCK';
        lowStockCount++;
      } else {
        stockStatus = 'IN_STOCK';
        inStockCount++;
      }

      const lastTxDate = lastMovementMap.get(m.id);
      let daysSinceLastMovement: number | null = null;
      let movementStatus: 'FAST' | 'SLOW' | 'NON_MOVING';

      if (lastTxDate) {
        daysSinceLastMovement = Math.max(0, Math.floor((now.getTime() - lastTxDate.getTime()) / 86400000));
        if (daysSinceLastMovement <= 30) {
          movementStatus = 'FAST';
          fastCount++;
        } else if (daysSinceLastMovement <= 180) {
          movementStatus = 'SLOW';
          slowCount++;
        } else {
          movementStatus = 'NON_MOVING';
          nonMovingCount++;
        }
      } else {
        movementStatus = 'NON_MOVING';
        nonMovingCount++;
      }

      if (query?.stockStatus && query.stockStatus !== 'All') {
        const queryStatus = query.stockStatus.toUpperCase().replace(/\s+/g, '_');
        if (stockStatus !== queryStatus) return null;
      }
      if (query?.movementStatus && query.movementStatus !== 'All') {
        const queryMovement = query.movementStatus.toUpperCase().replace(/\s+/g, '_');
        if (movementStatus !== queryMovement) return null;
      }

      const uKey = (m.unit || 'PCS').toUpperCase();
      const uRow = unitMap.get(uKey) || { unit: uKey, materials: 0, quantity: 0 };
      uRow.materials += 1;
      uRow.quantity += currentStock;
      unitMap.set(uKey, uRow);

      const cKey = m.category || 'Raw Material';
      const cRow = categoryMap.get(cKey) || { category: cKey, totalMaterials: 0, inStock: 0, lowStock: 0, outOfStock: 0, quantity: 0, inventoryValue: 0 };
      cRow.totalMaterials += 1;
      if (stockStatus === 'IN_STOCK') cRow.inStock += 1;
      else if (stockStatus === 'LOW_STOCK') cRow.lowStock += 1;
      else cRow.outOfStock += 1;
      cRow.quantity += currentStock;
      cRow.inventoryValue += value;
      categoryMap.set(cKey, cRow);

      return {
        id: m.id,
        code: m.sku || m.publicId || 'N/A',
        name: m.name,
        category: m.category || 'Raw Material',
        unit: m.unit || 'PCS',
        currentStock,
        minimumStock: minStock,
        shortage,
        stockStatus,
        movementStatus,
        lastStockIn: lastInTxMap.get(m.id)?.toISOString() || null,
        lastStockOut: lastOutTxMap.get(m.id)?.toISOString() || null,
        lastMovement: lastTxDate ? lastTxDate.toISOString() : null,
        daysSinceLastMovement,
        inventoryValue: value,
        indentStatus: materialIndentMap.get(m.id) || 'No Indent'
      };
    }).filter(Boolean);

    let stockInQty = 0;
    let stockOutQty = 0;
    let adjustmentQty = 0;
    let txRangeCount = inRangeTransactions.length;

    const movementTrendMap = new Map<string, { date: string; stockIn: number; stockOut: number; adjustments: number }>();

    for (const tx of inRangeTransactions) {
      const qty = toNumber(tx.quantity);
      const type = (tx.type || '').toUpperCase().trim();
      const dateKey = tx.createdAt.toISOString().slice(0, 10);
      const tRow = movementTrendMap.get(dateKey) || { date: dateKey, stockIn: 0, stockOut: 0, adjustments: 0 };

      if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN'].includes(type)) {
        stockInQty += qty;
        tRow.stockIn += qty;
      } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(type)) {
        stockOutQty += qty;
        tRow.stockOut += qty;
      } else if (type === 'ADJUSTMENT') {
        adjustmentQty += qty;
        tRow.adjustments += qty;
      }
      movementTrendMap.set(dateKey, tRow);
    }

    const netMovement = stockInQty - stockOutQty + adjustmentQty;
    const availabilityPercent = totalMaterialsCount > 0 ? Number(((inStockCount / totalMaterialsCount) * 100).toFixed(2)) : 0;
    const outOfStockPercent = totalMaterialsCount > 0 ? Number(((outOfStockCount / totalMaterialsCount) * 100).toFixed(2)) : 0;
    const lowStockPercent = totalMaterialsCount > 0 ? Number(((lowStockCount / totalMaterialsCount) * 100).toFixed(2)) : 0;

    const criticalMaterials = processedMaterials
      .filter(m => m.stockStatus === 'OUT_OF_STOCK' || m.stockStatus === 'LOW_STOCK')
      .sort((a, b) => b.shortage - a.shortage);

    const pendingIndentsCount = criticalMaterials.filter(m => m.indentStatus !== 'No Indent').length;

    const nonMovingMaterials = processedMaterials
      .filter(m => m.movementStatus === 'NON_MOVING')
      .sort((a, b) => (b.daysSinceLastMovement ?? 9999) - (a.daysSinceLastMovement ?? 9999));

    const highestStockMaterials = [...processedMaterials]
      .sort((a, b) => b.currentStock - a.currentStock)
      .slice(0, 10);

    const page = Math.max(1, parseInt(query?.page || '1', 10));
    const limit = Math.max(1, parseInt(query?.limit || '15', 10));
    const startIndex = (page - 1) * limit;
    const paginatedMaterials = processedMaterials.slice(startIndex, startIndex + limit);

    return {
      generatedAt: now.toISOString(),
      period: {
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10)
      },
      filters: {
        branches: allBranches,
        categories: [...new Set(rawMaterials.map(m => m.category).filter(Boolean))],
        units: [...new Set(rawMaterials.map(m => m.unit).filter(Boolean))],
        stockStatuses: ['All', 'In Stock', 'Low Stock', 'Out of Stock'],
        movementStatuses: ['All', 'Fast Moving', 'Slow Moving', 'Non-Moving']
      },
      summary: {
        totalMaterials: totalMaterialsCount,
        totalStockQuantity: totalStockQty,
        inStock: inStockCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalInventoryValue: Number(totalValuation.toFixed(2))
      },
      health: {
        availabilityPercent,
        outOfStockPercent,
        lowStockPercent,
        healthyStockPercent: availabilityPercent
      },
      movement: {
        stockIn: stockInQty,
        stockOut: stockOutQty,
        adjustments: adjustmentQty,
        netMovement,
        transactionCount: txRangeCount
      },
      movementClassification: {
        fast: fastCount,
        slow: slowCount,
        nonMoving: nonMovingCount
      },
      alerts: {
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
        totalCritical: outOfStockCount + lowStockCount,
        pendingIndents: pendingIndentsCount
      },
      unitBreakdown: Array.from(unitMap.values()),
      categoryBreakdown: Array.from(categoryMap.values()),
      movementTrend: Array.from(movementTrendMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      criticalMaterials: criticalMaterials.slice(0, 50),
      topMaterials: highestStockMaterials,
      nonMovingMaterials: nonMovingMaterials.slice(0, 50),
      materials: paginatedMaterials,
      pagination: {
        page,
        limit,
        total: processedMaterials.length,
        pages: Math.ceil(processedMaterials.length / limit) || 1
      }
    };
  }

  private normalizeReportFilters(query: any) {
    const now = new Date();
    let start: Date;
    let end: Date;

    const rangePreset = (query?.rangePreset || '').toUpperCase();
    const rawFrom = query?.startDate || query?.from;
    const rawTo = query?.endDate || query?.to;

    if (rawFrom && rawTo) {
      start = new Date(`${rawFrom.split('T')[0]}T00:00:00.000Z`);
      end = new Date(`${rawTo.split('T')[0]}T23:59:59.999Z`);
    } else if (rangePreset === 'TODAY') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (rangePreset === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
    } else if (rangePreset === 'THIS_WEEK') {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diffToMonday));
      start.setHours(0, 0, 0, 0);
      end = new Date();
    } else if (rangePreset === 'LAST_WEEK') {
      const day = now.getDay();
      const diffToLastMonday = now.getDate() - day - 6 + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diffToLastMonday));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (rangePreset === 'LAST_MONTH') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (rangePreset === 'THIS_QUARTER') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0, 0);
      end = new Date();
    } else if (rangePreset === 'THIS_FINANCIAL_YEAR') {
      const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      start = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
      end = new Date();
    } else if (rangePreset === 'LAST_FINANCIAL_YEAR') {
      const fyStartYear = (now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1) - 1;
      start = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
      end = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
    } else {
      // THIS_MONTH default
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date();
    }

    const duration = Math.max(1, end.getTime() - start.getTime() + 1);
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration + 1);

    const formatDateStr = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return {
      start,
      end,
      previousStart,
      previousEnd,
      inRange: { gte: start, lte: end },
      priorRange: { gte: previousStart, lte: previousEnd },
      branchId: query?.branchId && query.branchId !== 'All' ? query.branchId : null,
      department: query?.department && query.department !== 'All' ? query.department : null,
      customerId: query?.customerId && query.customerId !== 'All' ? query.customerId : null,
      vendorId: query?.vendorId && query.vendorId !== 'All' ? query.vendorId : null,
      productId: query?.productId && query.productId !== 'All' ? query.productId : null,
      status: query?.status && query.status !== 'All' ? query.status : null,
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        comparisonStartDate: previousStart.toISOString().split('T')[0],
        comparisonEndDate: previousEnd.toISOString().split('T')[0],
        label: `${formatDateStr(start)} – ${formatDateStr(end)}`
      }
    };
  }

  private async getSalesReport(companyId: string, f: any) {
    const orderWhere: any = {
      deletedAt: null,
      createdAt: f.inRange,
      ...(f.branchId ? { customer: { companyId, branchId: f.branchId } } : { customer: { companyId } }),
      ...(f.customerId ? { customerId: f.customerId } : {}),
      ...(f.status ? { status: f.status } : {})
    };

    const priorOrderWhere = { ...orderWhere, createdAt: f.priorRange };

    const [ordersCount, priorOrdersCount, verifiedPayments, leadsCount, quotationsCount, samplesCount, closedOrdersCount] = await Promise.all([
      this.prisma.salesOrder.count({ where: orderWhere }).catch(() => 0),
      this.prisma.salesOrder.count({ where: priorOrderWhere }).catch(() => 0),
      this.prisma.customerPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'VERIFIED' as any, receivedAt: f.inRange, customer: { companyId, ...(f.branchId ? { branchId: f.branchId } : {}) }, ...(f.customerId ? { customerId: f.customerId } : {}) }
      }).catch(() => ({ _sum: { amount: 0 } })),
      this.prisma.lead.count({
        where: { companyId, deletedAt: null, createdAt: f.inRange } as any
      }).catch(() => 0),
      this.prisma.quotation.count({
        where: { companyId, deletedAt: null, createdAt: f.inRange } as any
      }).catch(() => 0),
      this.prisma.sampleRequest.count({
        where: { companyId, deletedAt: null, requestedDate: f.inRange } as any
      }).catch(() => 0),
      this.prisma.salesOrder.count({
        where: { ...orderWhere, status: { in: ['COMPLETED', 'DISPATCHED', 'DELIVERED'] as any } }
      }).catch(() => 0)
    ]);

    const revenueCollected = Number((verifiedPayments as any)?._sum?.amount ?? 0);
    const orderDiff = ordersCount - priorOrdersCount;
    const orderChangePercent = priorOrdersCount > 0 ? Number(((orderDiff / priorOrdersCount) * 100).toFixed(1)) : 0;

    return {
      totalOrders: ordersCount,
      totalOrdersChangePercent: orderChangePercent,
      revenueCollected,
      leadsInFunnel: leadsCount,
      activeQuotations: quotationsCount,
      samplesPending: samplesCount,
      ordersClosedOrDispatched: closedOrdersCount
    };
  }

  private async getProductionReport(companyId: string, f: any) {
    const [workOrdersReleased, currentlyRunning, batchesCompleted, completedOrders, qcFailuresCount] = await Promise.all([
      this.prisma.workOrder.count({
        where: { createdAt: f.inRange, productionPlan: { salesOrder: { customer: { companyId } } } }
      }).catch(() => 0),
      this.prisma.workOrder.count({
        where: {
          productionPlan: { salesOrder: { customer: { companyId } } },
          status: { in: ['DRAFT', 'RELEASED', 'IN_PROGRESS'] as any }
        }
      }).catch(() => 0),
      this.prisma.workOrder.count({
        where: {
          createdAt: f.inRange,
          productionPlan: { salesOrder: { customer: { companyId } } },
          status: 'COMPLETED' as any
        }
      }).catch(() => 0),
      this.prisma.workOrder.findMany({
        where: {
          createdAt: f.inRange,
          productionPlan: { salesOrder: { customer: { companyId } } },
          status: 'COMPLETED' as any
        },
        select: { createdAt: true, updatedAt: true } as any
      }).catch(() => []),
      this.prisma.qCInspection.count({
        where: {
          createdAt: f.inRange,
          workOrder: { productionPlan: { salesOrder: { customer: { companyId } } } }
        } as any
      }).catch(() => 0)
    ]);

    let totalDelayDays = 0;
    let delayedBatchesCount = 0;
    completedOrders.forEach((w: any) => {
      if (w.updatedAt && w.createdAt) {
        const diffMs = new Date(w.updatedAt).getTime() - new Date(w.createdAt).getTime();
        if (diffMs > 0) {
          totalDelayDays += diffMs / (1000 * 60 * 60 * 24);
          delayedBatchesCount++;
        }
      }
    });

    const avgBatchDelayDays = delayedBatchesCount > 0 ? Number((totalDelayDays / delayedBatchesCount).toFixed(1)) : 0;
    const totalBatchesEvaluated = batchesCompleted + qcFailuresCount;
    const shopFloorYield = totalBatchesEvaluated > 0 ? Number(((batchesCompleted / totalBatchesEvaluated) * 100).toFixed(1)) : 100;

    return {
      workOrdersReleased,
      currentlyRunning,
      batchesCompleted,
      qcFailuresOrRework: qcFailuresCount,
      avgBatchDelayDays,
      shopFloorYield
    };
  }

  private async getPlantHeadReport(companyId: string, f: any) {
    const [pendingMatReqs, approvedMatReqs, pendingPOs, issuedClearances, matReqList] = await Promise.all([
      this.prisma.materialRequest.count({
        where: { status: 'PENDING' as any }
      }).catch(() => 0),
      this.prisma.materialRequest.count({
        where: { createdAt: f.inRange, status: { in: ['APPROVED', 'ISSUED'] as any } }
      }).catch(() => 0),
      this.prisma.purchaseIndent.count({
        where: { status: 'PENDING' as any }
      }).catch(() => 0),
      this.prisma.materialRequest.count({
        where: { createdAt: f.inRange, status: 'ISSUED' as any }
      }).catch(() => 0),
      this.prisma.materialRequest.findMany({
        where: { createdAt: f.inRange, approvedAt: { not: null } },
        select: { createdAt: true, approvedAt: true }
      }).catch(() => [])
    ]);

    let totalTatMs = 0;
    let tatCount = 0;
    matReqList.forEach((m: any) => {
      if (m.createdAt && m.approvedAt) {
        const ms = new Date(m.approvedAt).getTime() - new Date(m.createdAt).getTime();
        if (ms >= 0) {
          totalTatMs += ms;
          tatCount++;
        }
      }
    });

    const avgApprovalTatDays = tatCount > 0 ? Number((totalTatMs / (tatCount * 1000 * 60 * 60 * 24)).toFixed(1)) : 0;
    const scheduleAdherence = approvedMatReqs + pendingMatReqs > 0 ? Number(((approvedMatReqs / (approvedMatReqs + pendingMatReqs)) * 100).toFixed(1)) : 100;

    return {
      materialRequestsPending: pendingMatReqs,
      materialRequestsApproved: approvedMatReqs,
      poApprovalsPending: pendingPOs,
      totalClearancesIssued: issuedClearances + approvedMatReqs,
      scheduleAdherence,
      avgApprovalTatDays
    };
  }

  private async getStoreReport(companyId: string, f: any) {
    const [rawMaterials, allTransactions, poRequestsCount, issuancesCount] = await Promise.all([
      this.prisma.rawMaterial.findMany({
        where: { companyId, isActive: true },
        select: { id: true, minimumStock: true }
      }).catch(() => []),
      this.prisma.inventoryTransaction.findMany({
        select: { rawMaterialId: true, productId: true, quantity: true, type: true }
      }).catch(() => []),
      this.prisma.purchaseIndent.count({
        where: { createdAt: f.inRange }
      }).catch(() => 0),
      this.prisma.inventoryTransaction.count({
        where: { createdAt: f.inRange, type: { in: ['OUT', 'ISSUANCE', 'ISSUE'] } }
      }).catch(() => 0)
    ]);

    const totalStockMap = new Map<string, number>();
    for (const tx of allTransactions) {
      const id = tx.rawMaterialId || tx.productId;
      if (!id) continue;
      const current = totalStockMap.get(id) || 0;
      const qty = Number(tx.quantity || 0);
      const type = (tx.type || '').toUpperCase().trim();
      if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN'].includes(type)) {
        totalStockMap.set(id, current + qty);
      } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(type)) {
        totalStockMap.set(id, current - qty);
      } else if (type === 'ADJUSTMENT') {
        totalStockMap.set(id, current + qty);
      }
    }

    const totalRawStockItems = rawMaterials.length;
    let lowStockAlerts = 0;
    let rawInventoryValue = 0;

    rawMaterials.forEach((m: any) => {
      const stock = totalStockMap.get(m.id) ?? 0;
      const minStock = Number(m.minimumStock ?? 0);
      if (stock <= minStock) lowStockAlerts++;
      rawInventoryValue += Math.max(0, stock) * 100;
    });

    return {
      totalRawStockItems,
      rawInventoryValue,
      lowStockAlerts,
      poRequestsRaised: poRequestsCount,
      materialIssuances: issuancesCount
    };
  }

  private async getQcReport(companyId: string, f: any) {
    const [totalSamplesLogged, underTesting, approvedPassed, rejectedFailed] = await Promise.all([
      this.prisma.qCInspection.count({
        where: { createdAt: f.inRange, workOrder: { productionPlan: { salesOrder: { customer: { companyId } } } } }
      }).catch(() => 0),
      this.prisma.qCInspection.count({
        where: { workOrder: { productionPlan: { salesOrder: { customer: { companyId } } } } }
      }).catch(() => 0),
      this.prisma.qCInspection.count({
        where: { createdAt: f.inRange, workOrder: { productionPlan: { salesOrder: { customer: { companyId } } } } }
      }).catch(() => 0),
      this.prisma.qCInspection.count({
        where: { createdAt: f.priorRange, workOrder: { productionPlan: { salesOrder: { customer: { companyId } } } } }
      }).catch(() => 0)
    ]);

    const completedInspections = approvedPassed + rejectedFailed;
    const firstPassYield = completedInspections > 0 ? Number(((approvedPassed / completedInspections) * 100).toFixed(1)) : 100;
    const defectRate = completedInspections > 0 ? Number(((rejectedFailed / completedInspections) * 100).toFixed(1)) : 0;

    return {
      totalSamplesLogged,
      underTesting,
      approvedPassed,
      rejectedFailed,
      firstPassYield,
      defectRate
    };
  }

  private async getDispatchReport(companyId: string, f: any) {
    const [shipmentsDispatched, currentlyInTransit, deliveredDispatches, podConfirmations] = await Promise.all([
      this.prisma.dispatch.count({
        where: { createdAt: f.inRange, salesOrder: { customer: { companyId } } }
      }).catch(() => 0),
      this.prisma.dispatch.count({
        where: { salesOrder: { customer: { companyId } }, status: 'DISPATCHED' as any }
      }).catch(() => 0),
      this.prisma.dispatch.findMany({
        where: { createdAt: f.inRange, salesOrder: { customer: { companyId } }, status: 'DELIVERED' as any },
        include: { salesOrder: { select: { totalAmount: true } } }
      }).catch(() => []),
      this.prisma.dispatch.count({
        where: { createdAt: f.inRange, salesOrder: { customer: { companyId } }, status: 'DELIVERED' as any }
      }).catch(() => 0)
    ]);

    const totalDeliveredValue = (deliveredDispatches as any[]).reduce((sum: number, d: any) => sum + Number(d.salesOrder?.totalAmount ?? 0), 0);
    const totalFreightCost = 0;
    const onTimeDeliveryRate = shipmentsDispatched > 0 ? Number(((podConfirmations / shipmentsDispatched) * 100).toFixed(1)) : 100;

    return {
      shipmentsDispatched,
      currentlyInTransit,
      totalDeliveredValue,
      totalFreightCost,
      onTimeDeliveryRate,
      podConfirmations
    };
  }

  private async getFinanceReport(companyId: string, f: any) {
    const [verifiedPayments, confirmedOrders, customerPayments] = await Promise.all([
      this.prisma.customerPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'VERIFIED' as any, receivedAt: f.inRange, customer: { companyId } }
      }).catch(() => ({ _sum: { amount: 0 } })),
      this.prisma.salesOrder.aggregate({
        _sum: { totalAmount: true },
        where: {
          deletedAt: null,
          createdAt: f.inRange,
          customer: { companyId },
          status: { in: ['CONFIRMED', 'SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'COMPLETED'] as any }
        }
      }).catch(() => ({ _sum: { totalAmount: 0 } })),
      this.prisma.customerPayment.findMany({
        where: { receivedAt: f.inRange, customer: { companyId } },
        select: { status: true, amount: true }
      }).catch(() => [])
    ]);

    const revenueCollected = Number((verifiedPayments as any)?._sum?.amount ?? 0);
    const invoicedSales = Number((confirmedOrders as any)?._sum?.totalAmount ?? 0);
    const outstandingReceivables = Math.max(0, invoicedSales - revenueCollected);

    const verifiedInvoices = customerPayments.filter((p: any) => p.status === 'VERIFIED').length;
    const pendingVerification = customerPayments.filter((p: any) => p.status === 'PENDING').length;
    const collectionEfficiency = invoicedSales > 0 ? Number(((revenueCollected / invoicedSales) * 100).toFixed(1)) : 100;

    return {
      revenueCollected,
      outstandingReceivables,
      advancePaymentsHeld: 0,
      invoicesVerified: verifiedInvoices,
      pendingVerification,
      collectionEfficiency
    };
  }

  private async getHrReport(companyId: string, f: any) {
    const users = await this.prisma.user.findMany({
      where: { companyId, isActive: true, deletedAt: null },
      select: { id: true, role: { select: { name: true } } }
    });

    const totalEmployees = users.length;
    const currentlyActive = users.length;
    const activeDeptsCount = new Set(users.map((u: any) => u.role?.name).filter(Boolean)).size || 1;

    return {
      totalEmployees,
      currentlyActive,
      onLeave: 0,
      activeDepartments: activeDeptsCount,
      monthlyPayrollOutflow: 0,
      erpSystemUsers: users.length
    };
  }

  private async getCentralizedReportFilterOptions(companyId: string) {
    const [branches, customers, products] = await Promise.all([
      this.prisma.branch.findMany({ where: { companyId, deletedAt: null }, select: { id: true, name: true } }),
      this.prisma.customer.findMany({ where: { companyId, deletedAt: null }, select: { id: true, companyName: true } }),
      this.prisma.product.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true } })
    ]);

    return {
      branches: branches.map(b => ({ id: b.id, name: b.name })),
      customers: customers.map(c => ({ id: c.id, name: c.companyName })),
      vendors: [],
      products: products.map(p => ({ id: p.id, name: p.name })),
      statuses: ['All', 'Active', 'Pending', 'Completed', 'Approved', 'Cancelled', 'In Transit', 'Delivered']
    };
  }

  async getCentralizedReports(query: any, companyId: string) {
    const filters = this.normalizeReportFilters(query);

    const [
      sales,
      production,
      plantHead,
      store,
      qc,
      dispatch,
      finance,
      hr,
      filterOptions,
    ] = await Promise.all([
      this.getSalesReport(companyId, filters),
      this.getProductionReport(companyId, filters),
      this.getPlantHeadReport(companyId, filters),
      this.getStoreReport(companyId, filters),
      this.getQcReport(companyId, filters),
      this.getDispatchReport(companyId, filters),
      this.getFinanceReport(companyId, filters),
      this.getHrReport(companyId, filters),
      this.getCentralizedReportFilterOptions(companyId),
    ]);

    return {
      period: filters.period,
      sales,
      production,
      plantHead,
      store,
      qc,
      dispatch,
      finance,
      hr,
      filters: filterOptions,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildCentralizedReportCsv(report: any, selectedDepartment?: string) {
    const rows: string[] = ['Department,Metric,Value,Unit,Start Date,End Date'];
    const p = report.period;

    const addRow = (dept: string, metric: string, value: any, unit: string) => {
      if (selectedDepartment && selectedDepartment !== 'All' && selectedDepartment.toLowerCase() !== dept.toLowerCase() && !selectedDepartment.toLowerCase().includes(dept.toLowerCase())) {
        return;
      }
      const cleanVal = typeof value === 'number' ? value : String(value).replace(/,/g, '');
      rows.push(`"${dept}","${metric}",${cleanVal},"${unit}",${p.startDate},${p.endDate}`);
    };

    // Sales
    addRow('Sales', 'Total Orders', report.sales.totalOrders, 'Orders');
    addRow('Sales', 'Gross Revenue Collected', report.sales.revenueCollected, 'INR');
    addRow('Sales', 'Leads in Funnel', report.sales.leadsInFunnel, 'Leads');
    addRow('Sales', 'Active Quotations', report.sales.activeQuotations, 'Quotations');
    addRow('Sales', 'Samples Pending', report.sales.samplesPending, 'Samples');
    addRow('Sales', 'Orders Closed / Dispatched', report.sales.ordersClosedOrDispatched, 'Orders');

    // Production
    addRow('Production', 'Work Orders Released', report.production.workOrdersReleased, 'Batches');
    addRow('Production', 'Currently Running', report.production.currentlyRunning, 'Batches');
    addRow('Production', 'Batches Completed', report.production.batchesCompleted, 'Batches');
    addRow('Production', 'QC Failures / Rework', report.production.qcFailuresOrRework, 'Batches');
    addRow('Production', 'Avg Batch Delay', report.production.avgBatchDelayDays, 'Days');
    addRow('Production', 'Shop Floor Yield', report.production.shopFloorYield, '%');

    // Plant Head
    addRow('Plant Head', 'Material Requests Pending', report.plantHead.materialRequestsPending, 'Requests');
    addRow('Plant Head', 'Material Requests Approved', report.plantHead.materialRequestsApproved, 'Requests');
    addRow('Plant Head', 'PO Approvals Pending', report.plantHead.poApprovalsPending, 'Indents');
    addRow('Plant Head', 'Total Clearances Issued', report.plantHead.totalClearancesIssued, 'Clearances');
    addRow('Plant Head', 'Schedule Adherence', report.plantHead.scheduleAdherence, '%');
    addRow('Plant Head', 'Avg Approval TAT', report.plantHead.avgApprovalTatDays, 'Days');

    // Store
    addRow('Store', 'Total Raw Stock Items', report.store.totalRawStockItems, 'Items');
    addRow('Store', 'Raw Inventory Value', report.store.rawInventoryValue, 'INR');
    addRow('Store', 'Low Stock Alerts', report.store.lowStockAlerts, 'Items');
    addRow('Store', 'PO Requests Raised', report.store.poRequestsRaised, 'Requests');
    addRow('Store', 'Material Issuances', report.store.materialIssuances, 'Issuances');

    // QC
    addRow('QC', 'Total Samples Logged', report.qc.totalSamplesLogged, 'Samples');
    addRow('QC', 'Under Testing', report.qc.underTesting, 'Samples');
    addRow('QC', 'Approved / Passed', report.qc.approvedPassed, 'Samples');
    addRow('QC', 'Rejected / Failed', report.qc.rejectedFailed, 'Samples');
    addRow('QC', 'First Pass Yield', report.qc.firstPassYield, '%');
    addRow('QC', 'Defect Rate', report.qc.defectRate, '%');

    // Dispatch
    addRow('Dispatch', 'Shipments Dispatched', report.dispatch.shipmentsDispatched, 'Shipments');
    addRow('Dispatch', 'Currently In Transit', report.dispatch.currentlyInTransit, 'Shipments');
    addRow('Dispatch', 'Total Delivered Value', report.dispatch.totalDeliveredValue, 'INR');
    addRow('Dispatch', 'Total Freight Cost', report.dispatch.totalFreightCost, 'INR');
    addRow('Dispatch', 'On-Time Delivery Rate', report.dispatch.onTimeDeliveryRate, '%');
    addRow('Dispatch', 'POD Confirmations', report.dispatch.podConfirmations, 'Confirmations');

    // Finance
    addRow('Finance', 'Revenue Collected', report.finance.revenueCollected, 'INR');
    addRow('Finance', 'Outstanding Receivables', report.finance.outstandingReceivables, 'INR');
    addRow('Finance', 'Advance Payments Held', report.finance.advancePaymentsHeld, 'INR');
    addRow('Finance', 'Invoices Verified', report.finance.invoicesVerified, 'Invoices');
    addRow('Finance', 'Pending Verification', report.finance.pendingVerification, 'Invoices');
    addRow('Finance', 'Collection Efficiency', report.finance.collectionEfficiency, '%');

    // HR
    addRow('HR', 'Total Employees', report.hr.totalEmployees, 'Employees');
    addRow('HR', 'Currently Active', report.hr.currentlyActive, 'Employees');
    addRow('HR', 'On Leave', report.hr.onLeave, 'Employees');
    addRow('HR', 'Active Departments', report.hr.activeDepartments, 'Departments');
    addRow('HR', 'Monthly Payroll Outflow', report.hr.monthlyPayrollOutflow, 'INR');
    addRow('HR', 'ERP System Users', report.hr.erpSystemUsers, 'Users');

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const filename = `centralized-business-report-${p.startDate}-to-${p.endDate}.csv`;

    return {
      content: csvContent,
      filename
    };
  }

  async exportCentralizedReportsCsv(query: any, companyId: string) {
    const report = await this.getCentralizedReports(query, companyId);
    return this.buildCentralizedReportCsv(report, query?.department);
  }
}
