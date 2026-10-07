/**
 * Authoritative Trading Product & Order Classification Utility
 * 
 * Rules:
 * Category 1 (D1) = Manufacturing Products (Factory Dispatch)
 * Category 2 (D2) = Trading Products (Sahad Dispatch - Direct Dispatch 2)
 *
 * Trading Products MUST bypass Plant Head and Factory Production entirely.
 * After Sales Order, they route directly to Dispatch 2 in READY_FOR_DISPATCH status.
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

/**
 * Authoritative Canonical Product Routing Resolver
 *
 * Enforces the Single Source of Truth for Product Routing:
 * Product.isTrading + Product.dispatchCategory + Product.productType are authoritative.
 * Product name, SKU, category text, keywords, FRC, Grating, Moulded, etc. must NEVER override them.
 */
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
    category.includes('MOULDED')
  ) {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }

  const name = String(input?.name || input?.productName || (input as any)?.customProductName || (input as any)?.productNameSnapshot || '').toUpperCase();
  const sku = String(input?.sku || input?.productCode || '').toUpperCase();
  const itemType = String((input as any)?.type || '').toUpperCase();
  const combined = `${name} ${sku} ${itemType}`;

  if (
    combined.includes('MOULDED') ||
    combined.includes('COVERBLOCK') ||
    combined.includes('COVER BLOCK') ||
    combined.includes('RCC PIPE') ||
    /\b(WCB|PCB|HTCB|DTCB|MCB|BTCB|FRCCP|FRCT|FRCSQRC|FRCRFRC|FRCSFSC|FRCROFROC|FRCGT|FRCTSOC|FRCTPEC)\b/.test(combined)
  ) {
    return { dispatchCategory: 'D2', productType: 'TRADING', isTrading: true };
  }

  return { dispatchCategory: 'D1', productType: 'MANUFACTURING', isTrading: false };
}

export function isTradingProduct(product?: any, item?: any): boolean {
  if (!product && !item) return false;

  // 1. Direct boolean flags
  if (product?.isTrading === true || item?.isTrading === true) return true;
  if (product?.isTrading === false && item?.isTrading === false) {
    const rawDC = product?.dispatchCategory || product?.dispatch_category || item?.dispatchCategory || item?.dispatch_category;
    return normalizeDispatchCategory(rawDC) === 'D2';
  }

  // 1b. Check if entity is an order / container with items
  const containerItems =
    product?.items ||
    product?.orderItems ||
    product?.detailedItems ||
    product?.products ||
    item?.items ||
    item?.orderItems ||
    item?.detailedItems;
  if (Array.isArray(containerItems) && containerItems.length > 0) {
    return containerItems.some((it) => isTradingProduct(it.product || it, it));
  }

  // 2. Canonical resolver
  const target = product || item;
  return resolveProductRouting(target).isTrading;
}

export function isPureTradingOrder(order: any): boolean {
  if (!order) return false;
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : (Array.isArray(order.orderItems) && order.orderItems.length > 0
      ? order.orderItems
      : (Array.isArray(order.detailedItems) && order.detailedItems.length > 0
        ? order.detailedItems
        : []));

  if (items.length === 0) {
    return isTradingProduct(order);
  }

  return items.every((it: any) => isTradingProduct(it.product || it, it));
}

export function hasManufacturingItems(order: any): boolean {
  if (!order) return false;
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : (Array.isArray(order.orderItems) && order.orderItems.length > 0
      ? order.orderItems
      : (Array.isArray(order.detailedItems) && order.detailedItems.length > 0
        ? order.detailedItems
        : []));

  if (items.length === 0) {
    return !isTradingProduct(order);
  }

  return items.some((it: any) => !isTradingProduct(it.product || it, it));
}
