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

  // 2. Authoritative Dispatch Category 2 / Explicit Trading Signals
  if (rawDC !== undefined && rawDC !== null && rawDC !== '' && rawDC !== 'Unassigned' && rawDC !== 'UNASSIGNED') {
    const normDC = normalizeDispatchCategory(rawDC);
    if (normDC === 'D2') {
      return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
    }
  }

  if (rawTrading === true || rawPT === 'TRADING') {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }

  // 3. Category & Keyword Matching for Trading Products
  // Items in COVERBLOCK, FRC COVER, RCC PIPE, MOULDED, or with codes like BTCB, WCB, etc.
  // are ALWAYS Trading (Dispatch 2) and must never default to Kasna Factory Manufacturing (D1).
  const name = String(input?.name || input?.productName || (input as any)?.customProductName || (input as any)?.productNameSnapshot || '').toUpperCase();
  const sku = String(input?.sku || input?.productCode || '').toUpperCase();
  const itemType = String((input as any)?.type || '').toUpperCase();
  const combined = `${name} ${sku} ${itemType} ${category}`;

  const isTradingFamilyOrKeyword =
    category.includes('COVERBLOCK') ||
    category.includes('COVER BLOCK') ||
    category.includes('FRC COVER') ||
    category.includes('FRC COVERS') ||
    category.includes('RCC PIPE') ||
    category.includes('TRADING') ||
    category.includes('MOULDED') ||
    combined.includes('MOULDED') ||
    combined.includes('COVERBLOCK') ||
    combined.includes('COVER BLOCK') ||
    combined.includes('RCC PIPE') ||
    /\b(WCB|PCB|HTCB|DTCB|MCB|BTCB|FRCCP|FRCT|FRCSQRC|FRCRFRC|FRCSFSC|FRCROFROC|FRCGT|FRCTSOC|FRCTPEC)\b/.test(combined);

  if (isTradingFamilyOrKeyword) {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }

  // 4. Authoritative Dispatch Category 1
  if (rawDC !== undefined && rawDC !== null && rawDC !== '' && rawDC !== 'Unassigned' && rawDC !== 'UNASSIGNED') {
    const normDC = normalizeDispatchCategory(rawDC);
    if (normDC === 'D1') {
      return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
    }
  }

  // 5. Explicit isTrading boolean flag (false)
  if (typeof rawTrading === 'boolean') {
    if (rawTrading) {
      return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
    } else {
      return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
    }
  }

  // 6. Explicit productType
  if (rawPT === 'MANUFACTURING' || rawPT === 'HARDWARE') {
    return { dispatchCategory: 'D1', productType: rawPT, isTrading: false };
  }

  // 7. Existing record fallback (for updates where routing fields were not changed)
  if (existing) {
    const existingNormDC = normalizeDispatchCategory(existing.dispatchCategory);
    if (existing.isTrading === true || existingNormDC === 'D2' || String(existing.productType).toUpperCase() === 'TRADING') {
      return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
    }
    if (existing.isTrading === false || existingNormDC === 'D1' || String(existing.productType).toUpperCase() === 'MANUFACTURING') {
      return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
    }
  }

  return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
}

export function isTradingProduct(entity?: any, productsMap?: Map<string, any>): boolean {
  if (!entity) return false;

  // 1. Authoritative Product Master Flag: isTrading
  if (entity.isTrading === true || entity.product?.isTrading === true) return true;

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
