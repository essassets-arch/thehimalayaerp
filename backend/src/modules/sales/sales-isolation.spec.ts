import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PaymentsService } from '../finance/payments.service';
import { getOrderSalesScope, getPaymentSalesScope, getDispatchSalesScope } from '../../common/utils/rbac.util';

// Evaluate the ownership predicates against records from two sales users.
function matches(record: any, where: any): boolean {
  return Object.entries(where).every(([key, value]: [string, any]) => {
    if (key === 'OR') return value.some((clause: any) => matches(record, clause));
    if (key === 'AND') return value.every((clause: any) => matches(record, clause));
    if (value && typeof value === 'object') return record[key] != null && matches(record[key], value);
    return record[key] === value;
  });
}

describe('Sales user isolation', () => {
  const own = { salesExecutiveId: 'alice', createdById: 'admin' };
  const other = { salesExecutiveId: 'bob', createdById: 'alice', quotation: { createdById: 'alice' } };

  it.each(['SALES_EXECUTIVE', 'SALES_INTERN', 'SUPER_SALES', 'SUPER_SALES_2', 'SUPERSALES_1', 'SALES_12'])('%s sees only its assigned orders and related records', role => {
    const scope = getOrderSalesScope('alice', role);
    expect(matches(own, scope)).toBe(true);
    expect(matches(other, scope)).toBe(false);
    expect(matches({ salesExecutiveId: null, createdById: 'alice' }, scope)).toBe(true);
    expect(matches({ salesExecutiveId: null, createdById: 'bob' }, scope)).toBe(false);
    expect(matches({ salesOrder: own, createdById: 'finance' }, getPaymentSalesScope('alice', role))).toBe(true);
    expect(matches({ salesOrder: other, salesOrderId: 'other', createdById: 'alice' }, getPaymentSalesScope('alice', role))).toBe(false);
    expect(matches({ salesOrder: other, createdById: 'alice' }, getDispatchSalesScope('alice', role))).toBe(false);
    expect(() => getOrderSalesScope(undefined, role)).toThrow(UnauthorizedException);
  });

  it.each(['ADMIN', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'DISPATCH_EXECUTIVE'])('preserves %s operational access', role => {
    expect(getOrderSalesScope('operator', role)).toEqual({});
  });

  function setup() {
    const prisma: any = {
      salesOrder: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn().mockResolvedValue(null), findUnique: jest.fn().mockResolvedValue(null) },
      customerPayment: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]), create: jest.fn() },
      company: { findFirst: jest.fn().mockResolvedValue({ id: 'company' }) },
      user: { findMany: jest.fn().mockResolvedValue([]) },
      dispatch: { findMany: jest.fn().mockResolvedValue([]) },
      salesInvoice: { findMany: jest.fn().mockResolvedValue([]) },
    };
    prisma.$transaction = jest.fn(input => typeof input === 'function' ? input(prisma) : Promise.all(input));
    const sales = new SalesService(prisma, {} as any, {} as any, {} as any);
    const payments = new PaymentsService(prisma, {} as any, {} as any);
    return { prisma, sales, payments };
  }

  it.each([{}, { status: 'DELIVERED' }, { search: 'shared customer' }, { status: 'DELIVERED,PAYMENT_PENDING', search: 'shared customer' }])('retains ownership on list and count with filters %j', async query => {
    const { prisma, sales } = setup();
    await sales.listOrders(query as any, 'alice', 'SUPER_SALES');
    for (const mock of [prisma.salesOrder.findMany, prisma.salesOrder.count]) {
      const where = mock.mock.calls[0][0].where;
      expect(where.AND).toContainEqual(getOrderSalesScope('alice', 'SUPER_SALES'));
      expect(matches({ ...other, deletedAt: null, status: 'DELIVERED' }, where)).toBe(false);
    }
  });

  it('scopes direct order lookups and invoice edits', async () => {
    const { prisma, sales } = setup();
    await expect(sales.getOrder('other', 'alice', 'SALES_EXECUTIVE')).rejects.toThrow(NotFoundException);
    await expect(sales.updateInvoiceNumber('other', 'INV-1', 'alice', 'SALES_EXECUTIVE')).rejects.toThrow(NotFoundException);
    for (const [args] of prisma.salesOrder.findFirst.mock.calls) {
      expect(args.where.AND).toContainEqual(getOrderSalesScope('alice', 'SALES_EXECUTIVE'));
    }
  });

  it('scopes delivered orders in both sales and finance views', async () => {
    const { prisma, sales, payments } = setup();
    await sales.listDeliveredPendingPayment('alice', 'SUPER_SALES');
    await payments.listDeliveredOrders('alice', 'SUPER_SALES');
    for (const [args] of prisma.salesOrder.findMany.mock.calls) {
      expect(matches({ ...other, deletedAt: null }, args.where)).toBe(false);
      expect(JSON.stringify(args.where)).toContain('alice');
    }
  });

  it('denies cross-user payment lookup and order history, including legacy schema fallback', async () => {
    const { prisma, payments } = setup();
    await expect(payments.getPayment('other-payment', 'alice', 'SUPER_SALES_2')).rejects.toThrow(NotFoundException);
    expect(prisma.customerPayment.findFirst.mock.calls[0][0].where).toEqual({ id: 'other-payment', ...getPaymentSalesScope('alice', 'SUPER_SALES_2') });
    prisma.salesOrder.findUnique.mockRejectedValueOnce(new Error('complaintAdjustments unavailable'));
    await expect(payments.getOrderPaymentHistory('other', 'alice', 'SUPER_SALES_2')).rejects.toThrow(NotFoundException);
    for (const mock of [prisma.salesOrder.findFirst, prisma.salesOrder.findUnique]) {
      for (const [args] of mock.mock.calls) expect(args.where.AND).toContainEqual(getOrderSalesScope('alice', 'SUPER_SALES_2'));
    }
  });

  it('rejects recording against another user’s order before creating a payment', async () => {
    const { prisma, payments } = setup();
    const dto = { salesOrderId: 'other', customerId: 'shared-customer', amount: 100 };
    await expect(payments.recordPaymentFromSales(dto, 'alice', 'SALES_EXECUTIVE')).rejects.toThrow(NotFoundException);
    await expect(payments.createPayment(dto, 'alice', 'SALES_EXECUTIVE')).rejects.toThrow(NotFoundException);
    expect(prisma.customerPayment.create).not.toHaveBeenCalled();
    for (const [args] of prisma.salesOrder.findFirst.mock.calls) expect(args.where.AND).toContainEqual(getOrderSalesScope('alice', 'SALES_EXECUTIVE'));
  });
});
