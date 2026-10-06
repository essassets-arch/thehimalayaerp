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

export interface ProductRoutingClassification {
  dispatchCategory: 'D1' | 'D2' | null;
  productType: string;
  isTrading: boolean;
}

export function resolveProductRouting(
  input?: {
    dispatchCategory?: string | null;
    dispatch_category?: string | null;
    productType?: string | null;
    product_type?: string | null;
    isTrading?: boolean | null;
    is_trading?: boolean | null;
    category?: string | null;
    product_family?: string | null;
    name?: string | null;
    productName?: string | null;
    sku?: string | null;
    productCode?: string | null;
  } | null,
  existing?: {
    dispatchCategory?: string | null;
    productType?: string | null;
    isTrading?: boolean | null;
    category?: string | null;
  } | null
): ProductRoutingClassification {
  if (!input && !existing) {
    return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
  }

  // 1. Raw inputs
  const rawDC = input?.dispatchCategory ?? input?.dispatch_category;
  const rawPT = (input?.productType ?? input?.product_type ?? '').trim().toUpperCase();
  const rawTrading = input?.isTrading ?? input?.is_trading;
  const category = (input?.category ?? input?.product_family ?? existing?.category ?? '').trim().toUpperCase();

  // Explicit Raw Material handling
  if (
    category === 'RAW MATERIAL' ||
    rawPT === 'RAW_MATERIAL' ||
    String(existing?.productType || '').toUpperCase() === 'RAW_MATERIAL'
  ) {
    return { dispatchCategory: null, productType: 'RAW_MATERIAL', isTrading: false };
  }

  // 2. Authoritative Dispatch Category (highest priority routing selector)
  if (rawDC !== undefined && rawDC !== null && rawDC !== '' && rawDC !== 'Unassigned' && rawDC !== 'UNASSIGNED') {
    const normDC = normalizeDispatchCategory(rawDC);
    if (normDC === 'D2') {
      return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
    }
    if (normDC === 'D1') {
      return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
    }
  }

  // 3. Explicit isTrading boolean flag
  if (typeof rawTrading === 'boolean') {
    if (rawTrading) {
      return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
    } else {
      return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
    }
  }

  // 4. Explicit productType
  if (rawPT === 'TRADING') {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }
  if (rawPT === 'MANUFACTURING' || rawPT === 'HARDWARE') {
    return { dispatchCategory: 'D1', productType: rawPT, isTrading: false };
  }

  // 5. Existing record fallback (for updates where routing fields were not changed)
  if (existing) {
    const existingNormDC = normalizeDispatchCategory(existing.dispatchCategory);
    if (existing.isTrading === true || existingNormDC === 'D2' || String(existing.productType).toUpperCase() === 'TRADING') {
      return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
    }
    if (existing.isTrading === false || existingNormDC === 'D1' || String(existing.productType).toUpperCase() === 'MANUFACTURING') {
      return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
    }
  }

  // 6. Legacy fallback ONLY for genuinely unclassified legacy items
  if (
    category.includes('COVERBLOCK') ||
    category.includes('COVER BLOCK') ||
    category.includes('FRC COVER') ||
    category.includes('RCC PIPE') ||
    category.includes('OTHERS') ||
    category.includes('TRADING') ||
    category.includes('GRATING') ||
    category.includes('FRP GRATING')
  ) {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }

  const name = String(input?.name || input?.productName || '').toUpperCase();
  const sku = String(input?.sku || input?.productCode || '').toUpperCase();
  const combined = `${name} ${sku}`;

  if (
    combined.includes('MOULDED') ||
    combined.includes('GRATING') ||
    combined.includes('COVERBLOCK') ||
    combined.includes('COVER BLOCK') ||
    combined.includes('RCC PIPE')
  ) {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }

  return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
}

export function isTradingProduct(entity?: any, productsMap?: Map<string, any>): boolean {
  if (!entity) return false;

  // 1. Authoritative Product Master Flag: isTrading
  if (entity.isTrading === true || entity.product?.isTrading === true) return true;
  if (entity.isTrading === false && entity.product?.isTrading === false) {
    const rawDC = entity.dispatchCategory || entity.dispatch_category || entity.product?.dispatchCategory || entity.product?.dispatch_category;
    const normalizedDC = normalizeDispatchCategory(rawDC);
    if (normalizedDC === 'D2') return true;
    return false;
  }

  // 1b. Check items array if entity is an order / sample / replacement / return container
  const items = entity.items || entity.products || entity.sampleItems || entity.orderItems || entity.detailedItems || [];
  if (Array.isArray(items) && items.length > 0) {
    return items.some((it) => isTradingProduct(it, productsMap));
  }

  // 1c. Fallback to product map lookup if productId exists
  const pId = entity.productId || entity.product?.id;
  if (pId && productsMap && productsMap.has(pId)) {
    const matched = productsMap.get(pId);
    if (isTradingProduct(matched)) return true;
  }

  const target = entity.product || entity;
  return resolveProductRouting(target).isTrading;
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
