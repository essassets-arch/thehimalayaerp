/**
 * Customer Identity Privacy & Redaction Engine.
 *
 * Enforces strict trade-secret isolation for intermediate factory/operations roles
 * between Sales and Dispatch:
 *   - Plant Head (PLANT_HEAD, PLANTHEAD, PLANT_MANAGER, FACTORY_MANAGER)
 *   - Production (PRODUCTION, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, PRODUCTION_MANAGER, PRODUCTION_SUPERVISOR)
 *   - QC (QC, QC_INSPECTOR, QC_MANAGER, QC_ENGINEER, QUALITY, QUALITY_CONTROL)
 *   - Store (STORE, STORE_MANAGER, STORE_EXECUTIVE, STORE_KEEPER, WAREHOUSE_MANAGER)
 *
 * These roles MUST ONLY see Order ID (orderNumber) + product/quantity specifications,
 * NEVER customer names, contacts, phone numbers, GST, addresses, or lead/company names.
 *
 * Roles that retain full customer visibility:
 *   SUPER_ADMIN, ADMIN, SALES*, SUPER_SALES*, DISPATCH*, LOGISTICS*, FINANCE*, ACCOUNTS*, BACK_OFFICE, HR*.
 */

function extractRoleCode(role?: unknown): string {
  if (!role) return '';
  if (typeof role === 'object' && role !== null) {
    const r = role as Record<string, unknown>;
    return String(r.code || r.name || r.role || '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
  }
  return String(role)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

export function isCustomerBlindRole(role?: unknown): boolean {
  const norm = extractRoleCode(role);
  if (!norm) return false;

  // Explicit allowlist of full-visibility roles (never blinded)
  if (
    norm === 'SUPER_ADMIN' ||
    norm === 'SUPERADMIN' ||
    norm === 'ADMIN' ||
    norm === 'SUPER_USER' ||
    norm.includes('SUPER_ADMIN') ||
    norm.includes('SALES') ||
    norm.includes('DISPATCH') ||
    norm.includes('LOGISTICS') ||
    norm.includes('FINANCE') ||
    norm.includes('ACCOUNT') ||
    norm.includes('BACK_OFFICE') ||
    norm === 'HR' ||
    norm.startsWith('HR_') ||
    norm.includes('DIRECTOR')
  ) {
    return false;
  }

  return (
    norm === 'PLANT_HEAD' ||
    norm === 'PLANTHEAD' ||
    norm === 'PLANT_MANAGER' ||
    norm === 'FACTORY_MANAGER' ||
    norm.includes('PLANT_HEAD') ||
    norm.includes('PLANTHEAD') ||
    norm === 'PRODUCTION' ||
    norm.startsWith('PRODUCTION_') ||
    norm === 'QC' ||
    norm.startsWith('QC_') ||
    norm === 'QUALITY' ||
    norm === 'QUALITY_CONTROL' ||
    norm === 'STORE' ||
    norm.startsWith('STORE_') ||
    norm === 'WAREHOUSE' ||
    norm.startsWith('WAREHOUSE_')
  );
}

/**
 * Nested object keys representing non-customer entities whose `name`/`companyName`/contact
 * fields MUST NOT be touched (e.g. raw-material vendors, employees, own company, products).
 */
const SAFE_NON_CUSTOMER_CONTAINERS = new Set([
  'supplier',
  'suppliers',
  'vendor',
  'vendors',
  'employee',
  'employees',
  'user',
  'users',
  'department',
  'departments',
  'warehouse',
  'warehouses',
  'company',
  'companies',
  'branch',
  'branches',
  'role',
  'roles',
  'product',
  'products',
  'rawMaterial',
  'rawMaterials',
  'material',
  'materials',
  'createdBy',
  'updatedBy',
  'approvedBy',
  'rejectedBy',
  'issuedBy',
  'receivedBy',
  'submittedBy',
  'assignedTo',
  'salesExecutive',
  'inspector',
  'operator',
  'reportingManager',
  'actor',
  'transporter',
  'workflowState',
  'workLocation',
  'purchaseOrder',
  'purchaseOrders',
  'purchaseIndent',
  'purchaseIndents',
  'grn',
  'grns',
  'vendorInvoice',
  'vendorInvoices',
  'vendorPayment',
  'vendorPayments',
]);

/**
 * URL route prefixes that strictly deal with non-customer entities
 * (auth, profile, HR, procurement vendors, inventory raw materials, products).
 */
const SAFE_NON_CUSTOMER_ROUTE_PREFIXES = [
  '/auth/',
  '/profile',
  '/hr/',
  '/users',
  '/admin/users',
  '/suppliers',
  '/warehouses',
  '/products',
  '/procurement/',
  '/inventory/raw',
  '/location/',
  '/attendance',
  '/leave',
  '/expenses',
];

const CUSTOMER_NAME_FIELDS = new Set([
  'customerName',
  'customer_name',
  'resolvedCustomer',
  'clientName',
  'client_name',
  'partyName',
  'party_name',
  'buyerName',
  'buyer_name',
  'consigneeName',
  'consignee_name',
  'customerCompanyName',
  'customerCompany',
  'leadCompanyName',
  'endCustomer',
  'endCustomerName',
  'billingName',
]);

const CUSTOMER_PII_NULL_FIELDS = new Set([
  'customerPhone',
  'customer_phone',
  'customerMobile',
  'customerEmail',
  'customer_email',
  'customerGstin',
  'customer_gstin',
  'customerGst',
  'customerContact',
  'customerContactPerson',
  'customerCode',
  'customer_code',
  'customerAddress',
  'customer_address',
  'billingAddress',
  'shippingAddress',
  'deliveryAddress',
  'siteAddress',
  'siteInchargeName',
  'siteInchargeMobile',
  'siteInchargePhone',
  'contactPerson',
  'contact_person',
  'gstName',
  'gstNumber',
  'groupName',
  'projectName',
  'customerCity',
  'customerState',
  'customerPincode',
  'customerLocation',
  'customerPurchaseOrderNo',
  'replacementDeliveryAddress',
  'replacementAddress',
  'pickupAddress',
  'consigneeAddress',
]);

const CUSTOMER_ANALYTICS_ARRAY_KEYS = new Set([
  'byCustomer',
  'topCustomers',
  'customerBreakdown',
  'customerRanking',
  'customerAnalytics',
  'customers',
  'customersList',
  'customerList',
  'rankedCustomers',
  'newCustomers',
  'clientList',
  'topClients',
]);

function extractOrderReference(obj: Record<string, any>): string | null {
  const candidates = [
    obj.orderNumber,
    obj.orderNo,
    obj.order_no,
    obj.soNumber,
    obj.resolvedSoNumber,
    obj.salesOrderNumber,
    obj.salesOrderNo,
    obj.salesOrder?.orderNumber,
    obj.originalSalesOrder?.orderNumber,
    obj.productionPlan?.salesOrder?.orderNumber,
    obj.workOrder?.productionPlan?.salesOrder?.orderNumber,
    obj.dispatch?.salesOrder?.orderNumber,
    obj.workOrderNumber,
    obj.woNumber,
    obj.planNumber,
    obj.dispatchNo,
    obj.complaintNumber,
    obj.returnNumber,
    obj.replacementNumber,
    obj.sampleNumber,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) {
      return c.trim();
    }
  }
  return null;
}

function sanitizeCustomerObject(
  cust: any,
  orderRef: string | null,
): Record<string, any> | null {
  if (!cust || typeof cust !== 'object') return null;
  const label = orderRef || 'Confidential';
  return {
    ...(cust.id ? { id: cust.id } : {}),
    masked: true,
    companyName: label,
    name: label,
    contactPerson: null,
    phone: null,
    alternatePhone: null,
    email: null,
    gstin: null,
    pan: null,
    billingAddress: null,
    shippingAddress: null,
    address: null,
    city: null,
    state: null,
    pincode: null,
    customerCode: null,
  };
}

function sanitizeLeadObject(lead: any): Record<string, any> | null {
  if (!lead || typeof lead !== 'object') return null;
  return {
    ...(lead.id ? { id: lead.id } : {}),
    masked: true,
    companyName: null,
    groupName: null,
    projectName: null,
    gstName: null,
    gstNumber: null,
    contactPerson: null,
    phone: null,
    email: null,
    address: null,
    deliveryAddress: null,
    productInterest: lead.productInterest ?? null,
  };
}

function sanitizeQuotationObject(
  q: any,
  orderRef: string | null,
  seen: WeakSet<object>,
): any {
  if (!q || typeof q !== 'object') return q;
  const cleaned = redactRecursive(q, seen, orderRef, false);
  cleaned.customer = q.customer ? sanitizeCustomerObject(q.customer, orderRef) : null;
  cleaned.lead = q.lead ? sanitizeLeadObject(q.lead) : null;
  cleaned.companyName = null;
  cleaned.address = null;
  cleaned.deliveryAddress = null;
  cleaned.siteInchargeName = null;
  cleaned.siteInchargeMobile = null;
  cleaned.contactPerson = null;
  cleaned.phone = null;
  cleaned.gstName = null;
  cleaned.gstNumber = null;
  cleaned.groupName = null;
  cleaned.projectName = null;
  return cleaned;
}

function redactRecursive(
  value: any,
  seen: WeakSet<object>,
  inheritedOrderRef: string | null,
  inSafeContainer: boolean,
): any {
  if (
    value === null ||
    value === undefined ||
    typeof value !== 'object' ||
    value instanceof Date ||
    Buffer.isBuffer(value)
  ) {
    return value;
  }

  // Handle Prisma Decimal-like objects safely without mangling them
  if (
    typeof value.toNumber === 'function' &&
    typeof value.toFixed === 'function' &&
    'd' in value &&
    'e' in value &&
    's' in value
  ) {
    return value;
  }

  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) =>
      redactRecursive(item, seen, inheritedOrderRef, inSafeContainer),
    );
  }

  if (inSafeContainer) {
    return value;
  }

  const obj = value as Record<string, any>;
  const orderRef = extractOrderReference(obj) || inheritedOrderRef;
  const safeLabel = orderRef || 'Confidential';

  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(obj)) {
    // 1. Preserve non-customer containers (suppliers, vendors, employees, products, etc.)
    if (SAFE_NON_CUSTOMER_CONTAINERS.has(key)) {
      result[key] = val;
      continue;
    }

    // 2. Redact nested customer / client / party objects
    if (key === 'customer' || key === 'client' || key === 'party') {
      result[key] =
        val && typeof val === 'object'
          ? sanitizeCustomerObject(val, orderRef)
          : typeof val === 'string'
            ? safeLabel
            : null;
      continue;
    }

    // 3. Redact nested lead objects
    if (key === 'lead' || key === 'sourceLead') {
      result[key] = val && typeof val === 'object' ? sanitizeLeadObject(val) : null;
      continue;
    }

    // 4. Redact nested quotation / sourceQuotation objects
    if (key === 'quotation' || key === 'sourceQuotation') {
      result[key] =
        val && typeof val === 'object'
          ? sanitizeQuotationObject(val, orderRef, seen)
          : null;
      continue;
    }

    // 5. Clear customer-grouped analytics arrays in factory dashboards
    if (CUSTOMER_ANALYTICS_ARRAY_KEYS.has(key) && Array.isArray(val)) {
      result[key] = [];
      continue;
    }

    // 6. Replace explicit customer name display fields with Order ID (never customer name)
    if (CUSTOMER_NAME_FIELDS.has(key)) {
      result[key] = safeLabel;
      continue;
    }

    // 7. Nullify customer PII / contact / address / GST fields
    if (CUSTOMER_PII_NULL_FIELDS.has(key)) {
      result[key] = null;
      continue;
    }

    // 8. If this object looks like an Order / Dispatch / Complaint / Return / Sample / TestReport
    //    and has a direct `companyName` field (NOT a supplier/vendor/tenant company), mask it too
    if (
      key === 'companyName' &&
      (orderRef ||
        'customerId' in obj ||
        'salesOrderId' in obj ||
        'workOrderId' in obj ||
        'dispatchNo' in obj ||
        'complaintNumber' in obj)
    ) {
      result[key] = safeLabel;
      continue;
    }

    if (
      key === 'destination' &&
      (orderRef || 'soNumber' in obj || 'dispatchNo' in obj || 'salesOrderId' in obj)
    ) {
      result[key] = null;
      continue;
    }

    // 9. Recurse into nested objects / arrays
    result[key] = redactRecursive(val, seen, orderRef, false);
  }

  return result;
}

export function redactCustomerIdentity<T>(
  data: T,
  options?: { routePath?: string },
): T {
  if (data === null || data === undefined) return data;

  const routePath = String(options?.routePath || '').toLowerCase();
  const normalizedRoute = routePath.replace(/^\/api\/v\d+/, '').replace(/^\/api\/backend/, '');
  if (
    SAFE_NON_CUSTOMER_ROUTE_PREFIXES.some((prefix) =>
      normalizedRoute.startsWith(prefix),
    )
  ) {
    return data;
  }

  const seen = new WeakSet<object>();
  return redactRecursive(data, seen, null, false) as T;
}

/**
 * Scrub customer company names from notification titles & messages for customer-blind roles.
 */
export function sanitizeNotificationTextForBlindRole(
  text: string | null | undefined,
  knownCustomerNames: string[] = [],
): string {
  if (!text) return '';
  let out = String(text);

  // 1. Replace exact matches of real company customer names (longest first to avoid partial overlaps)
  if (knownCustomerNames.length > 0) {
    for (const rawName of knownCustomerNames) {
      const name = String(rawName || '').trim();
      if (name.length < 3) continue;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      if (regex.test(out)) {
        out = out.replace(regex, 'Confidential Client');
      }
    }
  }

  // 2. Scrub common notification phrase patterns containing customer identity
  out = out
    .replace(/\b(?:for|from)\s+customer\s+[^.,;()\n]+/gi, 'for Confidential Client')
    .replace(/\b(?:customer|client|party|buyer|consignee)\s*:\s*[^.,;|\n]+/gi, 'Client: Confidential')
    .replace(/\bfor\s+\(?\s*Confidential Client\s*\)?/gi, '(Confidential Client)');

  return out;
}
