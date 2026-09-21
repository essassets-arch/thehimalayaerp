import { readMaterialAnalytics, readMaterialHistory } from './material-analytics';
import { loadRawInventory, loadRawMaterialCatalog } from '../inventory/raw-material-read-model';

function fixture() {
  const raw = Array.from({ length: 235 }, (_, i) => ({ id: `r${i}`, sku: `RM-${i}`, name: `Material ${i}`, companyId: 'a', unit: i === 1 ? 'PCS' : 'KG', minimumStock: 5, isActive: true }));
  const products = [{ id: 'mirror', sku: 'RM-0', name: 'Material 0', companyId: 'a', unit: 'Kg', unitPrice: 2, isActive: true }, { id: 'separate', sku: 'DIFFERENT-SKU', name: 'Material 0', companyId: 'a', unit: 'KG', unitPrice: 3, isActive: true }];
  const tx = (id: string, type: string, quantity: number, date: string, rawMaterialId: string | null = 'r0', productId: string | null = null, companyId = 'a') => ({ id, type, quantity, createdAt: new Date(date), rawMaterialId, productId, companyId, warehouse: { name: 'Store' }, referenceType: 'RECORDED', referenceId: id });
  const transactions = [
    tx('opening', 'OPENING_STOCK', 100, '2026-08-31T18:29:59Z'),
    tx('receipt', 'IN', 20, '2026-08-31T18:30:00Z', null, 'mirror'),
    tx('both-links-once', 'OUT', 7, '2026-09-12T00:00:00Z', 'r0', 'mirror'),
    tx('adjustment', 'ADJUSTMENT', -3, '2026-09-20T00:00:00Z'),
    tx('last-september', 'QUICK_STOCK_OUT', 10, '2026-09-30T18:29:59Z'),
    tx('october', 'OUT', 5, '2026-09-30T18:30:00Z'),
    tx('pieces', 'IN', 80, '2026-09-15T00:00:00Z', 'r1'),
    tx('foreign', 'IN', 999, '2026-09-15T00:00:00Z', 'r0', null, 'b'),
  ];
  const match = (row: any, where: any) => row.companyId === where.companyId &&
    (!where.createdAt?.gte || row.createdAt >= where.createdAt.gte) &&
    (!where.createdAt?.lt || row.createdAt < where.createdAt.lt) &&
    (!where.createdAt?.lte || row.createdAt <= where.createdAt.lte) &&
    (!where.OR || where.OR.some((condition: any) => Object.entries(condition).some(([field, rule]: [string, any]) => rule.in.includes(row[field]))));
  const db = {
    rawMaterial: { findMany: jest.fn(async ({ where }) => raw.filter(row => row.companyId === where.companyId)) },
    product: { findMany: jest.fn(async ({ where }) => products.filter(row => row.companyId === where.companyId)) },
    inventoryTransaction: {
      groupBy: jest.fn(async ({ where, _count }) => {
        const grouped = new Map<string, any>();
        for (const row of transactions.filter(row => match(row, where))) {
          const key = `${row.rawMaterialId}|${row.productId}|${row.type}`;
          const existing = grouped.get(key) || { rawMaterialId: row.rawMaterialId, productId: row.productId, type: row.type, _sum: { quantity: 0 }, _count: { _all: 0 } };
          existing._sum.quantity += row.quantity; existing._count._all++;
          grouped.set(key, existing);
        }
        return [...grouped.values()];
      }),
      findMany: jest.fn(async ({ where, skip = 0, take }) => transactions.filter(row => match(row, where)).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).slice(skip, take ? skip + take : undefined)),
      count: jest.fn(async ({ where }) => transactions.filter(row => match(row, where)).length),
    },
  };
  return { db: db as any, raw, transactions };
}

describe('Store-backed material analytics', () => {
  it('includes more than 230 materials and zero-movement rows without merging names', async () => {
    const { db } = fixture();
    const report = await readMaterialAnalytics(db, 'a', undefined, undefined, undefined, '2026-09');
    expect(report.kpis.totalMaterials).toBe(236);
    expect(report.materials.find(row => row.materialId === 'r234')?.movement).toBe('NO_MOVEMENT');
    expect(report.materials.filter(row => row.materialName === 'Material 0')).toHaveLength(2);
    expect(report.materials.find(row => row.materialId === 'mirror')).toBeUndefined();
  });
  it('matches Store current balances and reconciles the selected month', async () => {
    const { db } = fixture();
    const [report, store] = await Promise.all([readMaterialAnalytics(db, 'a', undefined, undefined, undefined, '2026-09'), loadRawInventory(db, 'a')]);
    for (const row of report.materials) expect(row.currentStock).toBe(store.find(m => m.id === row.materialId)?.quantity);
    const material = report.materials.find(row => row.materialId === 'r0')!;
    expect(material).toMatchObject({ openingStock: 100, received: 20, issued: 17, adjustment: -3, closingStock: 100, currentStock: 95, transactions: 4 });
    expect(material.openingStock! + material.received - material.issued + material.adjustment).toBe(material.closingStock);
  });
  it('keeps pieces separate from kilograms and does not fabricate missing rates', async () => {
    const { db } = fixture();
    const report = await readMaterialAnalytics(db, 'a', undefined, undefined, undefined, '2026-09');
    expect(report.totalsByUnit.find(row => row.unit === 'PCS')?.received).toBe(80);
    expect(report.totalsByUnit.find(row => row.unit === 'KG')?.received).toBe(20);
    expect(report.materials.find(row => row.materialId === 'r1')?.unitRate).toBeNull();
  });
  it('preserves signed reversal postings in period and current balances', async () => {
    const { db, transactions } = fixture();
    transactions.push({ ...transactions[2], id: 'reversal', quantity: -2 });
    const report = await readMaterialAnalytics(db, 'a', undefined, undefined, undefined, '2026-09');
    expect(report.materials.find(row => row.materialId === 'r0')).toMatchObject({ issued: 15, closingStock: 102, currentStock: 97 });
  });
  it('shows negative stock and flags unknown ledger types instead of making up balances', async () => {
    const { db, transactions } = fixture();
    transactions.push({ ...transactions[0], id: 'negative', rawMaterialId: 'r2', type: 'OUT', quantity: 8 });
    transactions.push({ ...transactions[0], id: 'unknown', rawMaterialId: 'r3', type: 'UNRECOGNIZED', quantity: 8 });
    const report = await readMaterialAnalytics(db, 'a', undefined, undefined, undefined, '2026-09');
    expect(report.materials.find(row => row.materialId === 'r2')?.currentStock).toBe(-8);
    expect(report.materials.find(row => row.materialId === 'r3')?.currentStock).toBeNull();
    expect(report.kpis.unknownStockCount).toBe(1);
  });
  it('never substitutes another company when results are empty', async () => {
    const { db } = fixture();
    const report = await readMaterialAnalytics(db, 'empty', undefined, undefined, undefined, '2026-09');
    expect(report.materials).toEqual([]);
    for (const mock of [db.rawMaterial.findMany, db.product.findMany, db.inventoryTransaction.groupBy, db.inventoryTransaction.findMany]) {
      for (const [query] of mock.mock.calls) expect(query.where.companyId).toBe('empty');
    }
    await expect(loadRawMaterialCatalog(db, '')).rejects.toThrow('Authenticated company');
  });
  it('history includes both material aliases exactly once within the requested period', async () => {
    const { db } = fixture();
    const history = await readMaterialHistory(db, 'a', 'r0', 1, 20, '2026-09-01', '2026-09-30');
    expect(history.total).toBe(4);
    expect(history.data.map(row => row.id)).toEqual(['receipt', 'both-links-once', 'adjustment', 'last-september']);
    await expect(readMaterialHistory(db, 'other', 'r0')).rejects.toThrow('Material not found');
    await expect(readMaterialHistory(db, 'a', 'r0', 0)).rejects.toThrow('Invalid pagination');
  });
  it('fails visibly on query failures and rejects invalid dates', async () => {
    const { db } = fixture();
    await expect(readMaterialAnalytics(db, 'a', 'Custom', '2026-02-30', '2026-03-01')).rejects.toThrow();
    db.inventoryTransaction.groupBy.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(readMaterialAnalytics(db, 'a')).rejects.toThrow('Database unavailable');
  });
});
