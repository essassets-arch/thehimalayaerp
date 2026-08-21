export const statusLabel = (code?: string): string => {
  const value = String(code || 'DRAFT').toUpperCase();
  if (value === 'CONVERTED_TO_SO') return 'Converted';
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ');
};

export const normalizeQuotation = (quotation: any): any => {
  if (!quotation) return null;

  const rawItems = (Array.isArray(quotation.items) && quotation.items.length > 0)
    ? quotation.items
    : (Array.isArray(quotation.detailedItems) && quotation.detailedItems.length > 0)
      ? quotation.detailedItems
      : [];

  const detailedItems = rawItems.map((item: any, idx: number) => {
    const qty = Number(item.quantity ?? item.qty ?? 0);
    const unitPrice = Number(item.unitPrice ?? item.rate ?? item.price ?? 0);
    const gross = qty * unitPrice;

    // Calculate discount percentage and amount accurately
    let discPct = 0;
    let discountRupees = 0;
    if (item.discountPercent !== undefined && item.discountPercent !== null) {
      discPct = Number(item.discountPercent);
      discountRupees = gross * (discPct / 100);
    } else if (item.discountAmount !== undefined && item.discountAmount !== null) {
      discountRupees = Number(item.discountAmount);
      discPct = gross > 0 ? Math.round((discountRupees / gross) * 100) : 0;
    } else if (item.discount !== undefined && item.discount !== null) {
      const rawDisc = Number(item.discount);
      if (gross > 0 && rawDisc > 100) {
        // Stored as rupee amount
        discountRupees = rawDisc;
        discPct = Math.round((rawDisc / gross) * 100);
      } else {
        // Stored as percentage
        discPct = rawDisc;
        discountRupees = gross * (discPct / 100);
      }
    }
    if (discPct > 100) discPct = 0;

    const taxable = gross - discountRupees;

    // Calculate tax percentage and amount accurately
    let taxPct = 18;
    let taxRupees = 0;
    if (item.taxPercent !== undefined && item.taxPercent !== null) {
      taxPct = Number(item.taxPercent);
      taxRupees = taxable * (taxPct / 100);
    } else if (item.taxAmount !== undefined && item.taxAmount !== null) {
      taxRupees = Number(item.taxAmount);
      taxPct = taxable > 0 ? Math.round((taxRupees / taxable) * 100) : 18;
    } else if (item.tax !== undefined && item.tax !== null) {
      const rawTax = Number(item.tax);
      if (taxable > 0 && rawTax > 100) {
        // Stored as rupee amount
        taxRupees = rawTax;
        taxPct = Math.round((rawTax / taxable) * 100);
      } else {
        // Stored as percentage
        taxPct = rawTax;
        taxRupees = taxable * (taxPct / 100);
      }
    } else {
      taxRupees = taxable * 0.18;
    }
    if (taxPct > 100) taxPct = 18;

    const productName = item.product?.name ?? item.productName ?? item.name ?? item.description ?? 'Product';
    const spec = item.specification ?? item.productDetails ?? item.description ?? item.product?.description ?? '';
    const code = item.product?.sku ?? item.productCode ?? item.code ?? item.productId ?? '';
    const productId = item.productId ?? item.product?.id ?? code;

    return {
      id: item.id || `item-${idx + 1}`,
      productId,
      productName,
      productCode: code,
      code,
      description: spec,
      specification: spec,
      productDetails: spec,
      quantity: qty,
      unitPrice,
      discount: discPct,
      discountPercent: discPct,
      discountAmount: discountRupees,
      tax: taxPct,
      taxPercent: taxPct,
      taxAmount: taxRupees,
      lineTotal: Number(item.lineTotal ?? (taxable + taxRupees)),
      amount: Number(item.lineTotal ?? item.amount ?? (taxable + taxRupees)),
    };
  });

  // Strict Precedence Hierarchy:
  // Quotation DB record -> (if null/undefined only) -> Customer -> (if null/undefined only) -> Lead -> Default
  const customerName =
    quotation.customerName ??
    quotation.customer_name ??
    quotation.customer?.companyName ??
    quotation.customer?.name ??
    quotation.lead?.companyName ??
    quotation.lead?.customerName ??
    quotation.lead?.projectName ??
    '';

  const groupName =
    quotation.groupName ??
    quotation.group_name ??
    quotation.customer?.groupName ??
    quotation.customer?.group_name ??
    quotation.lead?.groupName ??
    quotation.lead?.group_name ??
    '';

  const gstName =
    quotation.gstName ??
    quotation.gst_name ??
    quotation.customer?.gstName ??
    quotation.customer?.companyName ??
    quotation.customer?.name ??
    quotation.lead?.gstName ??
    quotation.lead?.companyName ??
    (customerName || '');

  const gstNumber =
    quotation.gstNumber ??
    quotation.gst_number ??
    quotation.customer?.gstin ??
    quotation.customer?.gst ??
    quotation.customer?.gstNumber ??
    quotation.lead?.gstNumber ??
    quotation.lead?.gst_number ??
    '';

  const isGstRegistered =
    quotation.isGstRegistered ??
    (gstNumber ? 'YES' : 'NO');

  // Preserve 0 values for transportation cost
  const expectedTransportationCost = Number(
    quotation.expectedTransportationCost ??
    quotation.transportCharge ??
    quotation.customer?.transportCharge ??
    quotation.lead?.transportCharge ??
    0
  );

  const paymentTerms =
    quotation.paymentTerms ??
    quotation.payment_terms ??
    quotation.customer?.paymentTerms ??
    quotation.lead?.paymentTerms ??
    '15 Days';

  const paymentTermDays =
    quotation.paymentTermDays ??
    quotation.payment_term_days ??
    null;

  const validUntil =
    quotation.validUntil ??
    quotation.validTill ??
    quotation.validityDate ??
    null;

  const remarks =
    quotation.remarks ??
    quotation.notes ??
    quotation.termsAndNotes ??
    '';

  const total = Number(
    quotation.total ??
    quotation.totalAmount ??
    quotation.grandTotal ??
    0
  );

  const quotationNumber =
    quotation.quotationNumber ??
    quotation.quotationNo ??
    quotation.id;

  return {
    ...quotation,
    id: quotation.id,
    quotationNumber,
    quotationNo: quotationNumber,
    customerName,
    groupName,
    gstName,
    gstNumber,
    isGstRegistered,
    status: statusLabel(quotation.workflowState?.code ?? quotation.status),
    validUntil,
    validTill: validUntil,
    validityDate: validUntil,
    expectedTransportationCost,
    transportCharge: expectedTransportationCost,
    paymentTerms,
    paymentTermDays,
    remarks,
    notes: remarks,
    termsAndNotes: remarks,
    total,
    totalAmount: total,
    grandTotal: total,
    subtotal: Number(quotation.subtotal ?? 0),
    discount: Number(quotation.discount ?? 0),
    tax: Number(quotation.tax ?? 0),
    detailedItems,
    items: detailedItems,
  };
};
