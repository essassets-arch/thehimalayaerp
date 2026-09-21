import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Database = Pick<Prisma.TransactionClient, 'rawMaterial' | 'product' | 'inventoryTransaction'>;
const key = (value?: string | null) => (value || '').trim().toLowerCase();
export const materialUnit = (value?: string | null) => {
  const unit = key(value);
  if (['kg', 'kgs', 'kilogram', 'kilograms'].includes(unit)) return 'KG';
  if (['pc', 'pcs', 'piece', 'pieces', 'nos'].includes(unit)) return 'PCS';
  if (['l', 'ltr', 'litre', 'litres', 'liter', 'liters'].includes(unit)) return 'L';
  return value?.trim().toUpperCase() || 'NOT RECORDED';
};
export function materialMovement(type: string, quantity: number) {
  const normalized = type.trim().toUpperCase();
  if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'PURCHASE_DELIVERY'].includes(normalized)) return { kind: 'IN', delta: quantity };
  if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT', 'ISSUE_TO_PRODUCTION', 'PRODUCTION_ISSUE'].includes(normalized)) return { kind: 'OUT', delta: -quantity };
  if (normalized === 'ADJUSTMENT') return { kind: 'ADJUSTMENT', delta: quantity };
  return { kind: 'UNKNOWN', delta: 0 };
}

export async function loadRawMaterialCatalog(db: Database, companyId: string) {
  if (!companyId?.trim()) throw new BadRequestException('Authenticated company is required');
  let [raw, products] = await Promise.all([
    db.rawMaterial.findMany({ where: { companyId, isActive: true }, orderBy: { sku: 'asc' } }),
    db.product.findMany({ where: { companyId, isActive: true, OR: [
      { productType: 'RAW_MATERIAL' }, { type: 'RAW_MATERIAL' }, { category: { contains: 'Raw', mode: 'insensitive' } },
    ] }, orderBy: { sku: 'asc' } }),
  ]);
  if (raw.length === 0) {
    raw = await db.rawMaterial.findMany({ where: { isActive: true }, orderBy: { sku: 'asc' } });
  }
  const used = new Set<string>();
  const make = (rm: typeof raw[number] | null, product?: typeof products[number]) => ({
    id: rm?.id || product!.id,
    rawMaterialId: rm?.id || null,
    productId: product?.id || null,
    companyId,
    name: rm?.name || product!.name,
    sku: rm?.sku || product?.sku || '',
    publicId: rm?.publicId || product?.publicId,
    category: rm?.category || product?.category || 'Not recorded',
    unit: materialUnit(rm?.unit || product?.unit),
    minimumStock: Number(rm?.minimumStock ?? product?.minimumStock ?? 0),
    unitPrice: product?.unitPrice == null ? null : Number(product.unitPrice),
    storageLocation: rm?.storageLocation || '',
    description: product?.description || '',
    isActive: rm?.isActive ?? product?.isActive ?? true,
    productType: 'RAW_MATERIAL',
    aliases: [rm?.id, product?.id].filter((id): id is string => !!id),
  });
  const materials = raw.map(rm => {
    // A shared SKU and unit identify the legacy Product mirror. Names alone do not.
    const product = products.find(p => !used.has(p.id) && key(rm.sku) && key(p.sku) === key(rm.sku) && materialUnit(p.unit) === materialUnit(rm.unit));
    if (product) used.add(product.id);
    return make(rm, product);
  });
  for (const product of products) if (!used.has(product.id)) materials.push(make(null, product));
  return materials.sort((a, b) => (a.sku || a.name).localeCompare(b.sku || b.name));
}

export type RawCatalog = Awaited<ReturnType<typeof loadRawMaterialCatalog>>;
export function materialLookup(catalog: RawCatalog) {
  return new Map(catalog.flatMap(material => material.aliases.map(id => [id, material.id] as const)));
}

export async function rawBalances(db: Database, companyId: string, catalog: RawCatalog, before?: Date) {
  const aliases = materialLookup(catalog);
  const ids = [...aliases.keys()];
  const groups = await db.inventoryTransaction.groupBy({
    by: ['productId', 'rawMaterialId', 'type'], _sum: { quantity: true },
    where: { companyId, OR: [{ rawMaterialId: { in: ids } }, { productId: { in: ids } }], ...(before ? { createdAt: { lt: before } } : {}) },
  });
  const balances = new Map<string, number>();
  const unknown = new Set<string>();
  for (const group of groups) {
    const id = aliases.get(group.rawMaterialId || '') || aliases.get(group.productId || '');
    if (!id) continue;
    const movement = materialMovement(group.type, Number(group._sum.quantity || 0));
    if (movement.kind === 'UNKNOWN') unknown.add(id);
    balances.set(id, (balances.get(id) || 0) + Math.round(movement.delta * 100));
  }
  return new Map(catalog.map(material => [material.id, unknown.has(material.id) ? null : (balances.get(material.id) || 0) / 100]));
}

export async function loadRawInventory(db: Database, companyId: string) {
  const catalog = await loadRawMaterialCatalog(db, companyId);
  const balances = await rawBalances(db, companyId, catalog);
  const lookup = materialLookup(catalog);
  const ids = [...lookup.keys()];
  const activity = await db.inventoryTransaction.groupBy({
    by: ['productId', 'rawMaterialId', 'type'], _count: { _all: true },
    where: { companyId, createdAt: { gte: new Date(Date.now() - 90 * 86400000), lte: new Date() }, OR: [{ rawMaterialId: { in: ids } }, { productId: { in: ids } }] },
  });
  const issues = new Map<string, number>();
  for (const row of activity) {
    const id = lookup.get(row.rawMaterialId || '') || lookup.get(row.productId || '');
    if (id && materialMovement(row.type, 1).kind === 'OUT') issues.set(id, (issues.get(id) || 0) + row._count._all);
  }
  return catalog.map(material => {
    const quantity = balances.get(material.id)!;
    const issueCount90Days = issues.get(material.id) || 0;
    return { ...material, quantity, issueCount90Days, movement: issueCount90Days === 0 ? 'Non-Moving' : issueCount90Days >= 4 ? 'Fast Moving' : 'Slow Moving', stockStatus: quantity === null ? 'UNKNOWN' : quantity <= 0 ? 'OUT_OF_STOCK' : quantity < material.minimumStock ? 'LOW_STOCK' : 'IN_STOCK' };
  });
}
