import { Prisma } from '@prisma/client';
import { businessRegisters, loadBusinessRegister, registerCatalog, registerCsv } from './business-report-registers';

describe('Detailed centralized reporting', () => {
  const query = { dataset: 'orders', rangePreset: 'ALL_TIME' };
  const model = () => ({ count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) });
  const db = () => Object.fromEntries(Prisma.dmmf.datamodel.models.map(m => [m.name[0].toLowerCase() + m.name.slice(1), model()])) as any;

  it('validates every allowed model, column, date and filter against the generated database schema', () => {
    const check = (model: string, path: string) => {
      let current = model;
      for (const part of path.split('.')) {
        if (part === 'some') continue;
        const field = Prisma.dmmf.datamodel.models.find(m => m.name === current)?.fields.find(f => f.name === part);
        expect({ model, path, part, valid: !!field }).toEqual({ model, path, part, valid: true });
        current = field!.type;
      }
    };
    expect(new Set(businessRegisters.map(r => r.key)).size).toBe(businessRegisters.length);
    for (const r of businessRegisters) {
      for (const path of [...r.fields.split(' '), ...Object.values(r.filters || {}), ...(r.date ? [r.date] : []), ...(!r.tenant.startsWith('$') ? [r.tenant] : [])]) check(r.model, path);
    }
    expect(registerCatalog()).toHaveLength(businessRegisters.length);
    const columns = registerCatalog().flatMap(r => r.columns.map(c => c.key));
    expect(columns.some(c => /password|Encrypted|Hash|selfie|latitude|longitude/i.test(c))).toBe(false);
  });

  it('uses tenant ownership, all statuses, stable pagination and an unbounded All Time period', async () => {
    const database = db();
    database.salesOrder.count.mockResolvedValue(45);
    database.salesOrder.findMany.mockResolvedValue([{ id: 'a', status: 'DRAFT', customer: { companyName: 'Actual customer' }, totalAmount: new Prisma.Decimal('1234567890123.45') }]);
    const report = await loadBusinessRegister(database, { ...query, page: '2', pageSize: '25', vendorId: 'v' }, 'company');
    expect(report).toMatchObject({ total: 45, page: 2, ignoredFilters: ['vendorId'] });
    expect(report.rows[0]).toMatchObject({ id: 'a', status: 'DRAFT', 'customer.companyName': 'Actual customer', totalAmount: '1234567890123.45', paidAmount: null });
    expect(database.salesOrder.findMany.mock.calls[0][0]).toMatchObject({ skip: 25, take: 25, orderBy: { id: 'asc' }, where: { AND: [{ customer: { companyId: 'company' } }, { deletedAt: null }, { customer: { deletedAt: null } }] } });
    expect(JSON.stringify(database.salesOrder.count.mock.calls[0])).not.toMatch(/orderDate|status/);
  });

  it('applies event dates and applicable commercial filters without overwriting tenant scope', async () => {
    const database = db();
    await loadBusinessRegister(database, { ...query, rangePreset: 'CUSTOM', startDate: '2026-09-01', endDate: '2026-09-23', customerId: 'c', branchId: 'b', productId: 'p' }, 'company');
    const where = database.salesOrder.count.mock.calls[0][0].where;
    expect(where.AND).toEqual(expect.arrayContaining([
      { customer: { companyId: 'company' } }, { customerId: 'c' }, { customer: { branchId: 'b' } }, { items: { some: { productId: 'p' } } },
      { orderDate: { gte: new Date('2026-08-31T18:30:00Z'), lte: new Date('2026-09-23T18:29:59.999Z') } },
    ]));
  });

  it('exports beyond one page without truncation and escapes spreadsheet formulas', async () => {
    const database = db(); database.salesOrder.count.mockResolvedValue(501);
    database.salesOrder.findMany.mockResolvedValueOnce(Array.from({ length: 500 }, (_, index) => ({ id: String(index), orderNumber: '=1+1', totalAmount: new Prisma.Decimal('5.25') }))).mockResolvedValueOnce([{ id: 'last', orderNumber: 'Last order' }]);
    const report = await loadBusinessRegister(database, query, 'company', true);
    expect(report.rows).toHaveLength(501);
    expect(database.salesOrder.findMany.mock.calls[1][0]).toMatchObject({ cursor: { id: '499' }, skip: 1, take: 500 });
    const csv = registerCsv(report).content;
    expect(csv).toContain("\"'=1+1\""); expect(csv).toContain('Last order'); expect(csv).toContain('Not recorded'); expect(csv).toContain('5.25');
  });

  it('does not expose other companies through legacy creator ownership', async () => {
    const database = db(); database.user.findMany.mockResolvedValue([{ id: 'company-user' }]);
    await loadBusinessRegister(database, { ...query, dataset: 'manualAr' }, 'company');
    expect(database.user.findMany).toHaveBeenCalledWith({ where: { companyId: 'company' }, select: { id: true } });
    expect(database.hcpplArManualEntry.count.mock.calls[0][0].where.AND).toContainEqual({ createdById: { in: ['company-user'] } });
  });

  it('resolves branch warehouses inside the company for procurement', async () => {
    const database = db(); database.warehouse.findMany.mockResolvedValue([{ id: 'warehouse' }]);
    await loadBusinessRegister(database, { ...query, dataset: 'purchaseOrders', branchId: 'branch' }, 'company');
    expect(database.warehouse.findMany).toHaveBeenCalledWith({ where: { companyId: 'company', branchId: 'branch' }, select: { id: true } });
    expect(database.purchaseOrder.count.mock.calls[0][0].where.AND).toContainEqual({ purchaseIndent: { warehouseId: { in: ['warehouse'] } } });
  });

  it('returns an explicit empty result, rejects invalid requests, and propagates database errors', async () => {
    const database = db();
    expect(await loadBusinessRegister(database, query, 'company')).toMatchObject({ total: 0, rows: [] });
    for (const invalid of [{ dataset: 'refreshSession' }, { page: -1 }, { pageSize: 1000 }, { department: 'HR & Payroll' }]) await expect(loadBusinessRegister(database, { ...query, ...invalid }, 'company')).rejects.toThrow();
    await expect(loadBusinessRegister(database, query, '')).rejects.toThrow('Company context');
    database.salesOrder.count.mockRejectedValue(new Error('Database unavailable'));
    await expect(loadBusinessRegister(database, query, 'company')).rejects.toThrow('Database unavailable');
  });
});
