import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { dispatchAnalyticsPeriod, dispatchDay } from './dispatch-analytics-period';
import { loadRawMaterialCatalog, materialLookup, materialMovement, rawBalances } from '../inventory/raw-material-read-model';

export function materialPeriod(filter?: string, start?: string, end?: string, month?: string, year?: string) {
  if (filter === 'Today') return dispatchAnalyticsPeriod('Custom', dispatchDay(new Date()), dispatchDay(new Date()));
  if (!month && ['This Week', 'This Quarter', 'Annually'].includes(filter || '')) {
    const now = new Date(Date.now() + 330 * 60000);
    const first = new Date(now);
    if (filter === 'This Week') first.setUTCDate(first.getUTCDate() - (first.getUTCDay() + 6) % 7);
    else if (filter === 'This Quarter') first.setUTCMonth(Math.floor(first.getUTCMonth() / 3) * 3, 1);
    else first.setUTCMonth(0, 1);
    return dispatchAnalyticsPeriod('Custom', first.toISOString().slice(0, 10), now.toISOString().slice(0, 10));
  }
  return dispatchAnalyticsPeriod(filter, start, end, month, year);
}

export async function readMaterialAnalytics(db: Prisma.TransactionClient, companyId: string, filter?: string, start?: string, end?: string, month?: string, year?: string) {
  const period = materialPeriod(filter, start, end, month, year);
  const catalog = await loadRawMaterialCatalog(db, companyId);
  const lookup = materialLookup(catalog);
  const materialById = new Map(catalog.map(material => [material.id, material]));
  const ids = [...lookup.keys()];
  const where = { companyId, OR: [{ rawMaterialId: { in: ids } }, { productId: { in: ids } }], ...(period.isAllTime ? {} : { createdAt: { gte: period.startDate, lt: period.endDate } }) };
  const [current, opening, closing, transactions] = await Promise.all([
    rawBalances(db, companyId, catalog),
    period.isAllTime ? new Map(catalog.map(m => [m.id, 0])) : rawBalances(db, companyId, catalog, period.startDate),
    period.isAllTime ? rawBalances(db, companyId, catalog) : rawBalances(db, companyId, catalog, period.endDate),
    db.inventoryTransaction.findMany({ where, select: { id: true, productId: true, rawMaterialId: true, quantity: true, type: true, referenceType: true, createdAt: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
  ]);
  const metrics = new Map(catalog.map(m => [m.id, { received: 0, issued: 0, adjustment: 0, transactions: 0, unknownTransactions: 0, issueDays: new Set<string>(), lastMovement: null as string | null }]));
  const daily = new Map<string, { date: string; unit: string; received: number; issued: number; adjustment: number }>();
  for (const tx of transactions) {
    const id = lookup.get(tx.rawMaterialId || '') || lookup.get(tx.productId || '');
    if (!id) continue;
    const metric = metrics.get(id)!;
    const material = materialById.get(id)!;
    const movement = materialMovement(tx.type, Number(tx.quantity));
    const day = dispatchDay(tx.createdAt);
    metric.transactions++;
    metric.lastMovement = day;
    if (movement.kind === 'UNKNOWN') { metric.unknownTransactions++; continue; }
    const field = movement.kind === 'IN' ? 'received' : movement.kind === 'OUT' ? 'issued' : 'adjustment';
    const cents = Math.round((movement.kind === 'OUT' ? -movement.delta : movement.delta) * 100);
    metric[field] += cents;
    if (movement.kind === 'OUT') metric.issueDays.add(day);
    const dailyKey = `${day}|${material.unit}`;
    const entry = daily.get(dailyKey) || { date: day, unit: material.unit, received: 0, issued: 0, adjustment: 0 };
    entry[field] += cents;
    daily.set(dailyKey, entry);
  }
  const materials = catalog.map(m => {
    const metric = metrics.get(m.id)!;
    const currentStock = current.get(m.id)!;
    return {
      materialId: m.id, materialName: m.name, materialSku: m.sku, category: m.category, unit: m.unit, isActive: m.isActive,
      minimumStock: m.minimumStock, storageLocation: m.storageLocation || null, unitRate: m.unitPrice,
      currentStock, openingStock: opening.get(m.id), closingStock: closing.get(m.id),
      stockValue: currentStock === null || m.unitPrice === null ? null : Math.round(currentStock * m.unitPrice * 100) / 100,
      stockStatus: currentStock === null ? 'UNKNOWN' : currentStock <= 0 ? 'OUT_OF_STOCK' : currentStock < m.minimumStock ? 'LOW_STOCK' : 'IN_STOCK',
      received: metric.received / 100, issued: metric.issued / 100, adjustment: metric.adjustment / 100,
      transactions: metric.transactions, issueDays: metric.issueDays.size, lastMovement: metric.lastMovement,
      movement: metric.transactions === 0 ? 'NO_MOVEMENT' : 'ACTIVE', unknownTransactions: metric.unknownTransactions,
    };
  });
  const units = [...new Set(materials.map(m => m.unit))].sort();
  const totalsByUnit = units.map(unit => {
    const rows = materials.filter(m => m.unit === unit);
    const sum = (field: 'currentStock' | 'openingStock' | 'closingStock' | 'received' | 'issued' | 'adjustment') => rows.some(row => row[field] === null) ? null : Math.round(rows.reduce((total, row) => total + (row[field] || 0), 0) * 100) / 100;
    return { unit, materials: rows.length, currentStock: sum('currentStock'), openingStock: sum('openingStock'), closingStock: sum('closingStock'), received: sum('received'), issued: sum('issued'), adjustment: sum('adjustment') };
  });
  return {
    period: { periodLabel: period.periodLabel, startDate: period.isAllTime ? null : period.startDate.toISOString(), endDate: period.isAllTime ? null : period.endDate.toISOString() },
    generatedAt: new Date().toISOString(),
    kpis: { totalMaterials: materials.length, materialsWithMovement: materials.filter(m => m.transactions > 0).length, lowStockCount: materials.filter(m => m.stockStatus === 'LOW_STOCK').length, outOfStockCount: materials.filter(m => m.stockStatus === 'OUT_OF_STOCK').length, unknownStockCount: materials.filter(m => m.stockStatus === 'UNKNOWN').length, totalTransactions: transactions.length },
    materials, totalsByUnit,
    dailyFlow: [...daily.values()].map(row => ({ ...row, received: row.received / 100, issued: row.issued / 100, adjustment: row.adjustment / 100 })),
    dataQuality: { missingRates: materials.filter(m => m.unitRate === null).length, unknownTransactions: materials.reduce((sum, m) => sum + m.unknownTransactions, 0) },
  };
}

export async function readMaterialHistory(db: Prisma.TransactionClient, companyId: string, materialId: string, page = 1, pageSize = 20, start?: string, end?: string) {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new BadRequestException('Invalid pagination');
  const catalog = await loadRawMaterialCatalog(db, companyId);
  const material = catalog.find(m => m.id === materialId);
  if (!material) throw new NotFoundException('Material not found in Store inventory');
  if (Boolean(start) !== Boolean(end)) throw new BadRequestException('Provide both start and end dates');
  const period = start && end ? materialPeriod('Custom', start, end) : null;
  const where = { companyId, OR: [{ rawMaterialId: { in: material.aliases } }, { productId: { in: material.aliases } }], ...(period ? { createdAt: { gte: period.startDate, lt: period.endDate } } : {}) };
  const [total, rows] = await Promise.all([
    db.inventoryTransaction.count({ where }),
    db.inventoryTransaction.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * pageSize, take: pageSize, include: { warehouse: { select: { name: true } } } }),
  ]);
  return { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)), data: rows.map(row => ({ id: row.id, date: dispatchDay(row.createdAt), timestamp: row.createdAt.toISOString(), type: row.type, quantity: Number(row.quantity), unit: material.unit, referenceType: row.referenceType, reference: row.referenceId, warehouse: row.warehouse?.name || null })) };
}
