/**
 * Standardized Dispatch Category & Product Classification
 * 
 * Category 1 (D1) = Manufacturing Products (Factory Dispatch)
 * Category 2 (D2) = Trading Products (Sahad Dispatch)
 */

export function normalizeDispatchCategory(cat?: string | null): 'D1' | 'D2' | null {
  if (!cat) return null;
  const s = String(cat).trim().toUpperCase();
  if (['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'CAT 1', 'CAT_1', '1'].includes(s)) {
    return 'D1';
  }
  if (['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'CAT 2', 'CAT_2', '2'].includes(s)) {
    return 'D2';
  }
  return null;
}

export function isTradingProduct(entity?: any, productsMap?: Map<string, any>): boolean {
  if (!entity) return false;

  // 1. Direct flags
  if (entity.isTrading === true) return true;
  if (entity.isTrading === false) return false;

  const pType = String(entity.productType || entity.product_type || entity.product?.productType || entity.product?.product_type || '').toUpperCase();
  if (pType === 'TRADING') return true;
  if (pType === 'MANUFACTURING') return false;

  const dCat = String(
    entity.dispatchCategory ||
    entity.dispatch_category ||
    entity.product?.dispatchCategory ||
    entity.product?.dispatch_category ||
    ''
  ).toUpperCase();
  if (dCat === 'D2' || dCat.includes('2')) return true;
  if (dCat === 'D1' || dCat.includes('1')) return false;

  const cat = String(
    entity.category ||
    entity.product_family ||
    entity.product?.category ||
    entity.product?.product_family ||
    ''
  ).toUpperCase();
  if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat)) return true;
  if (['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING', 'FINISHED GOODS'].includes(cat)) return false;

  const name = String(
    entity.name ||
    entity.productName ||
    entity.productNameSnapshot ||
    entity.product ||
    entity.product?.name ||
    entity.specifications ||
    ''
  ).toUpperCase();

  const sku = String(
    entity.sku ||
    entity.productCode ||
    entity.productCodeSnapshot ||
    entity.productSku ||
    entity.product?.sku ||
    ''
  ).toUpperCase();

  const nameOrSku = `${name} ${sku}`;

  if (
    nameOrSku.startsWith('WCB') ||
    nameOrSku.startsWith('PCB') ||
    nameOrSku.startsWith('HTCB') ||
    nameOrSku.startsWith('DTCB') ||
    nameOrSku.startsWith('MCB') ||
    nameOrSku.startsWith('BTCB') ||
    nameOrSku.startsWith('FRCCP') ||
    nameOrSku.startsWith('FRCT') ||
    nameOrSku.startsWith('FRCSQRC') ||
    nameOrSku.startsWith('FRC') ||
    nameOrSku.startsWith('RCC') ||
    nameOrSku.includes('COVERBLOCK') ||
    nameOrSku.includes('COVER BLOCK') ||
    nameOrSku.includes('FRC COVER') ||
    nameOrSku.includes('RCC PIPE')
  ) {
    return true;
  }

  // 2. Check items array if entity is an order / sample / replacement / return container
  const items = entity.items || entity.products || entity.sampleItems || entity.orderItems || [];
  if (Array.isArray(items) && items.length > 0) {
    return items.some((it) => isTradingProduct(it, productsMap));
  }

  // 3. Fallback to product map lookup if productId exists
  const pId = entity.productId || entity.product?.id;
  if (pId && productsMap && productsMap.has(pId)) {
    const matched = productsMap.get(pId);
    return isTradingProduct(matched);
  }

  return false;
}

export function isManufacturingProduct(entity?: any, productsMap?: Map<string, any>): boolean {
  return !isTradingProduct(entity, productsMap);
}

export function getDispatchCategory(entity?: any, productsMap?: Map<string, any>): 'D1' | 'D2' {
  return isTradingProduct(entity, productsMap) ? 'D2' : 'D1';
}
