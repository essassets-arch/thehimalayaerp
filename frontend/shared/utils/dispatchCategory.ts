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

  const dCat = String(
    entity.dispatchCategory ||
    entity.dispatch_category ||
    entity.product?.dispatchCategory ||
    entity.product?.dispatch_category ||
    ''
  ).toUpperCase();
  if (dCat === 'D2' || dCat === 'DISPATCH 2' || dCat === 'DISPATCH_2' || dCat.includes('CAT 2') || dCat.includes('CATEGORY 2')) return true;

  const cat = String(
    entity.category ||
    entity.product_family ||
    entity.product?.category ||
    entity.product?.product_family ||
    ''
  ).toUpperCase();
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
  const cleanNameOrSku = nameOrSku.replace(/\bHIMALAYA\b/g, '').trim();

  if (
    nameOrSku.includes('MOULDED') ||
    nameOrSku.includes('GRATING') ||
    cleanNameOrSku.startsWith('FRPMOULDED') ||
    cleanNameOrSku.startsWith('FRPGRT') ||
    cleanNameOrSku.startsWith('WCB') ||
    cleanNameOrSku.startsWith('PCB') ||
    cleanNameOrSku.startsWith('HTCB') ||
    cleanNameOrSku.startsWith('DTCB') ||
    cleanNameOrSku.startsWith('MCB') ||
    cleanNameOrSku.startsWith('BTCB') ||
    cleanNameOrSku.startsWith('FRCCP') ||
    cleanNameOrSku.startsWith('FRCT') ||
    cleanNameOrSku.startsWith('FRCSQRC') ||
    cleanNameOrSku.startsWith('FRCRFRC') ||
    cleanNameOrSku.startsWith('FRCSFSC') ||
    cleanNameOrSku.startsWith('FRCROFROC') ||
    cleanNameOrSku.startsWith('FRCGT') ||
    cleanNameOrSku.startsWith('FRCTSOC') ||
    cleanNameOrSku.startsWith('FRCTPEC') ||
    cleanNameOrSku.startsWith('FRC') ||
    cleanNameOrSku.startsWith('RCC') ||
    nameOrSku.includes('COVERBLOCK') ||
    nameOrSku.includes('COVER BLOCK') ||
    nameOrSku.includes('FRC COVER') ||
    nameOrSku.includes('RCC PIPE')
  ) {
    return true;
  }

  if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING', 'FRP GRATINGS'].includes(cat) || cat.includes('GRATING')) return true;
  if (['FRP COVERS', 'MANUFACTURING', 'FINISHED GOODS'].includes(cat)) return false;

  // 2. Check items array if entity is an order / sample / replacement / return container
  const items = entity.items || entity.products || entity.sampleItems || entity.orderItems || entity.detailedItems || [];
  if (Array.isArray(items) && items.length > 0) {
    return items.some((it) => isTradingProduct(it, productsMap));
  }

  // 3. Fallback to product map lookup if productId exists
  const pId = entity.productId || entity.product?.id;
  if (pId && productsMap && productsMap.has(pId)) {
    const matched = productsMap.get(pId);
    return isTradingProduct(matched);
  }

  if (pType === 'MANUFACTURING' || dCat === 'D1' || dCat.includes('1')) return false;

  return false;
}

export function isPureTradingOrder(order?: any, productsMap?: Map<string, any>): boolean {
  if (!order) return false;
  const items = order.detailedItems || order.items || order.orderItems || order.products || [];
  if (!Array.isArray(items) || items.length === 0) {
    return isTradingProduct(order, productsMap);
  }
  return items.every((it: any) => isTradingProduct(it, productsMap));
}

export function hasManufacturingItems(order?: any, productsMap?: Map<string, any>): boolean {
  if (!order) return false;
  const items = order.detailedItems || order.items || order.orderItems || order.products || [];
  if (!Array.isArray(items) || items.length === 0) {
    return !isTradingProduct(order, productsMap);
  }
  return items.some((it: any) => !isTradingProduct(it, productsMap));
}

export function isManufacturingProduct(entity?: any, productsMap?: Map<string, any>): boolean {
  return !isTradingProduct(entity, productsMap);
}

export function getDispatchCategory(entity?: any, productsMap?: Map<string, any>): 'D1' | 'D2' {
  return isTradingProduct(entity, productsMap) ? 'D2' : 'D1';
}
