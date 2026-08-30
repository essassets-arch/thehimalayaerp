import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FinanceReportsService {
  constructor(private readonly prisma: PrismaService) { }

  async getRevenueExpense(dateFrom?: string, dateTo?: string, companyId?: string) {
    const from = dateFrom ? new Date(dateFrom) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const to = dateTo ? new Date(dateTo) : new Date();

    let payments: any[] = [];
    let expenses: any[] = [];
    let orders: any[] = [];

    try {
      payments = await this.prisma.customerPayment.findMany({
        where: {
          status: 'VERIFIED',
          createdAt: { gte: from, lte: to },
          ...(companyId && { customer: { companyId } }),
        },
      });
    } catch {
      payments = [];
    }

    try {
      expenses = await this.prisma.expense.findMany({
        where: {
          status: 'APPROVED',
          createdAt: { gte: from, lte: to },
          ...(companyId && { companyId }),
        },
      });
    } catch {
      expenses = [];
    }

    try {
      orders = await this.prisma.salesOrder.findMany({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED', 'READY_FOR_DISPATCH'] },
          createdAt: { gte: from, lte: to },
          ...(companyId && { companyId }),
        },
      });
    } catch {
      orders = [];
    }

    const totalRevenue: number =
      payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0) ||
      orders.reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0);
    const totalExpense: number = expenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);

    const monthMap = new Map<string, { revenue: number; expense: number }>();
    const getMonthKey = (d: Date) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    payments.forEach((p: any) => {
      const k = getMonthKey(new Date(p.createdAt));
      const curr = monthMap.get(k) || { revenue: 0, expense: 0 };
      curr.revenue += Number(p.amount || 0);
      monthMap.set(k, curr);
    });

    expenses.forEach((e: any) => {
      const k = getMonthKey(new Date(e.createdAt));
      const curr = monthMap.get(k) || { revenue: 0, expense: 0 };
      curr.expense += Number(e.amount || 0);
      monthMap.set(k, curr);
    });

    const summary = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expense: data.expense,
      profit: data.revenue - data.expense,
    }));

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      summary,
    };
  }

  async getCashFlow(dateFrom?: string, dateTo?: string, companyId?: string) {
    const from = dateFrom ? new Date(dateFrom) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const to = dateTo ? new Date(dateTo) : new Date();

    let payments: any[] = [];
    let expenses: any[] = [];
    let vendorPayments: any[] = [];

    try {
      payments = await this.prisma.customerPayment.findMany({
        where: {
          status: 'VERIFIED',
          createdAt: { gte: from, lte: to },
          ...(companyId && { customer: { companyId } }),
        },
      });
    } catch {
      payments = [];
    }

    try {
      expenses = await this.prisma.expense.findMany({
        where: {
          status: 'APPROVED',
          createdAt: { gte: from, lte: to },
          ...(companyId && { companyId }),
        },
      });
    } catch {
      expenses = [];
    }

    try {
      vendorPayments = await this.prisma.vendorPayment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: from, lte: to },
          ...(companyId && { companyId }),
        },
      });
    } catch {
      vendorPayments = [];
    }

    const totalIncoming: number = payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
    const expenseSum: number = expenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
    const vendorPaymentSum: number = vendorPayments.reduce((acc: number, vp: any) => acc + Number(vp.paidAmount || vp.amount || 0), 0);
    const totalOutgoing: number = expenseSum + vendorPaymentSum;

    const monthMap = new Map<string, { incoming: number; outgoing: number }>();
    const getMonthKey = (d: Date) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    payments.forEach((p: any) => {
      const k = getMonthKey(new Date(p.createdAt));
      const curr = monthMap.get(k) || { incoming: 0, outgoing: 0 };
      curr.incoming += Number(p.amount || 0);
      monthMap.set(k, curr);
    });

    expenses.forEach((e: any) => {
      const k = getMonthKey(new Date(e.createdAt));
      const curr = monthMap.get(k) || { incoming: 0, outgoing: 0 };
      curr.outgoing += Number(e.amount || 0);
      monthMap.set(k, curr);
    });

    vendorPayments.forEach((vp: any) => {
      const k = getMonthKey(new Date(vp.createdAt));
      const curr = monthMap.get(k) || { incoming: 0, outgoing: 0 };
      curr.outgoing += Number(vp.paidAmount || vp.amount || 0);
      monthMap.set(k, curr);
    });

    const summary = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      incoming: data.incoming,
      outgoing: data.outgoing,
      net: data.incoming - data.outgoing,
    }));

    return {
      totalIncoming,
      totalOutgoing,
      netCashFlow: totalIncoming - totalOutgoing,
      summary,
    };
  }
}
