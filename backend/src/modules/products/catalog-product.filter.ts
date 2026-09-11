export const RAW_KEYWORDS = [
  'cement', 'sand', 'aggregate', 'gravel', 'stone', 'pigment', 'powder', 
  'water paper', 'brush', 'welcor', 'haksaw', 'drill', 'thappi', 'chisel', 
  'clamp', 'hammer', 'bucket', 'ghamela', 'carbon', 'pva', 'wax', 'polish', 
  'resin', 'cobalt', 'catalyst', 'fly ash', 'admixture'
];

export const CATALOG_PRODUCTS_BASE_WHERE = {
  isActive: true,
  productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
};

export function getCatalogProductsPrismaWhere(companyId?: string) {
  const where: any = {
    isActive: true,
    productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
  };
  if (companyId) {
    where.companyId = companyId;
  }
  return where;
}

/**
 * Reusable catalog filter to ensure single source-of-truth invariant:
 * COUNT(active Product catalog in Plant Head) === COUNT(active Product catalog in Production All Stock)
 */
export function isCatalogProduct(p: {
  productType?: string | null;
  category?: string | null;
  sku?: string | null;
  publicId?: string | null;
  name?: string | null;
}): boolean {
  if (!p) return false;
  const origType = String(p.productType || '').toUpperCase();
  const family = String(p.category || '').toLowerCase();
  const code = String(p.sku || p.publicId || '').toUpperCase();
  const name = String(p.name || '').toLowerCase();

  if (origType === 'RAW_MATERIAL' || origType === 'HARDWARE') return false;
  if (['raw material', 'hardware', 'electric', 'consumables', 'consumable'].includes(family)) return false;
  if (code.startsWith('HCPPL') || code.startsWith('RM-') || code.startsWith('HM')) return false;
  if (RAW_KEYWORDS.some((kw) => name.includes(kw))) return false;
  return true;
}

