/**
 * notificationRouteResolver.ts
 *
 * Centralized, resilient resolver that maps any notification
 * to its exact target page and document across all modules and roles.
 */

export interface NotificationLike {
  id?: string;
  route?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  module?: string | null;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  orderNumber?: string | null;
  orderNo?: string | null;
  salesOrderNumber?: string | null;
  metadata?: Record<string, any> | null;
  data?: Record<string, any> | null;
  details?: Record<string, any> | null;
  [key: string]: any;
}

export interface UserLike {
  id?: string;
  role?: string | null;
  [key: string]: any;
}

/**
 * Extracts a clean, human-readable sales order number from notification fields,
 * route, or text (message / title).
 */
export function extractOrderNumberFromNotification(
  notification: NotificationLike | null | undefined
): string | null {
  if (!notification) return null;

  // 1. Explicit properties
  const directCandidate =
    notification.orderNumber ||
    notification.orderNo ||
    notification.salesOrderNumber ||
    notification.metadata?.orderNumber ||
    notification.metadata?.orderNo ||
    notification.data?.orderNumber ||
    notification.data?.orderNo ||
    notification.details?.orderNumber ||
    notification.details?.orderNo;

  if (typeof directCandidate === 'string' && directCandidate.trim().length > 2) {
    return directCandidate.trim();
  }

  // 2. Parse route if it already points to an order slug (and is not just a UUID)
  const isUuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  if (notification.route && typeof notification.route === 'string') {
    const ordersMatch = notification.route.match(/^\/orders\/(.+)$/);
    if (ordersMatch && ordersMatch[1]) {
      const slug = decodeURIComponent(ordersMatch[1].trim());
      if (!isUuid(slug)) {
        return slug;
      }
    }
    const salesOrdersMatch = notification.route.match(
      /^\/(?:sales|supersales)\/orders\/(.+)$/
    );
    if (salesOrdersMatch && salesOrdersMatch[1]) {
      const slug = decodeURIComponent(salesOrdersMatch[1].trim());
      if (!isUuid(slug)) {
        return slug;
      }
    }
  }

  // 3. Search in message and title
  const rawText = `${notification.message || ''} ${notification.title || ''}`.trim();
  if (!rawText) return null;

  const cleanCandidate = (str?: string | null) => {
    if (!str) return null;
    let s = str.trim().replace(/^[\(\[\{"'\s]+|[\)\]\}"'\s\.,;:!?]+$/g, '');
    // Ensure it's not a dispatch or PO or GRN or IND or EXP prefix
    if (/^(DISP|PO|GRN|IND|EXP)\b/i.test(s)) return null;
    return s.length >= 3 ? s : null;
  };

  // Pattern A: Multi-slash company order format (e.g. HCPPL/2627/0170, HCPPL/2627/0169, HCL/2627/001)
  const slashMatch = rawText.match(
    /\b([A-Za-z]{2,10}\/\d{2,6}\/\d{2,6}[A-Za-z0-9_-]*)\b/i
  );
  if (slashMatch && slashMatch[1]) {
    const c = cleanCandidate(slashMatch[1]);
    if (c) return c;
  }

  // Pattern B: SO- or ORD- prefix (e.g. SO-2026-0099, ORD-1234, SO/2627/10)
  const soMatch = rawText.match(/\b((?:SO|ORD)[\/\-][A-Za-z0-9\/\-]+)\b/i);
  if (soMatch && soMatch[1]) {
    const c = cleanCandidate(soMatch[1]);
    if (c) return c;
  }

  // Pattern C: Prefix before dash / em-dash / en-dash: "HCPPL/2627/0169 — Plant Head has accepted..."
  const prefixMatch = (notification.message || '').match(
    /^([A-Za-z0-9_\-\/]+)\s*[\u2014\u2013\-\:]\s*(?:Plant Head|Production|Order|Delivery|New|Sales|Customer|Shipment|Dispatch)/i
  );
  if (prefixMatch && prefixMatch[1]) {
    const c = cleanCandidate(prefixMatch[1]);
    if (c) return c;
  }

  // Pattern D: "created for <orderNumber>" or "shipment for <orderNumber>" or "dispatch for <orderNumber>"
  const forMatch = rawText.match(
    /(?:created for|shipment for|dispatch for|delivery for|order for|sales order|order\s*#|order\s*no\.?)\s*:?\s*([A-Za-z0-9_\-\/]+)/i
  );
  if (forMatch && forMatch[1]) {
    const c = cleanCandidate(forMatch[1]);
    if (c) return c;
  }

  // Pattern E: Any 3-segment alphanumeric slash pattern (e.g. ABC/24-25/001)
  const genericSlashMatch = rawText.match(
    /\b([A-Za-z0-9_-]{2,12}\/[A-Za-z0-9_-]{2,8}\/[A-Za-z0-9_-]{2,8})\b/
  );
  if (genericSlashMatch && genericSlashMatch[1]) {
    const c = cleanCandidate(genericSlashMatch[1]);
    if (c) return c;
  }

  return null;
}

/**
 * Resolves the absolute internal navigation path for any notification.
 */
export function resolveNotificationRoute(
  notification: NotificationLike | null | undefined,
  user?: UserLike | null,
): string {
  if (!notification) return '/dashboard';

  const userRole = String(
    user?.role?.code || user?.role || user?.roleName || ''
  ).toUpperCase();
  const userEmail = String(user?.email || '').toLowerCase();
  const isSuperSales =
    userRole === 'SUPER_SALES' || userRole.includes('SUPER_SALES');
  const salesBasePath = isSuperSales ? '/supersales' : '/sales';

  const isDispatch2User =
    userRole === 'DISPATCH_2' || userRole.includes('DISPATCH_2') || userEmail.includes('sahad');
  const isDispatch1User =
    (['DISPATCH_1', 'DISPATCH_EXECUTIVE', 'DISPATCH'].includes(userRole) ||
      userRole.includes('DISPATCH_1') ||
      userRole.includes('DISPATCH_EXECUTIVE') ||
      userEmail.includes('ravikant')) &&
    !isDispatch2User;

  const entityType = String(notification.entityType || '').trim();
  const entityId = String(notification.entityId || '').trim();
  const type = String(notification.type || '').toUpperCase();
  const moduleName = String(notification.module || '').toUpperCase();
  const title = String(notification.title || '').toUpperCase();
  const message = String(notification.message || '').toUpperCase();
  const explicitRoute = typeof notification.route === 'string' ? notification.route.trim() : '';

  // 1. DYNAMIC ORDER REDIRECTION:
  // Any order-related notification (e.g. Dispatch Created, Shipment In Transit,
  // Order Accepted by Plant Head, Order Returned) MUST dynamically route to
  // the modern universal order lifecycle page: `/orders/{orderNumber}` (e.g. `/orders/HCPPL/2627/0170`),
  // and NEVER to the outdated `/sales/orders/{uuid}` or `/supersales/orders/{uuid}`.
  const extractedOrderNumber = extractOrderNumberFromNotification(notification);

  const isLegacySalesOrderRoute =
    explicitRoute.startsWith('/sales/orders') ||
    explicitRoute.startsWith('/supersales/orders') ||
    explicitRoute.startsWith('/orders');

  const isOrderRelatedNotification =
    Boolean(extractedOrderNumber) ||
    isLegacySalesOrderRoute ||
    entityType.toLowerCase() === 'salesorder' ||
    entityType.toLowerCase() === 'order' ||
    type.startsWith('SALES_ORDER_') ||
    type.startsWith('ORDER_') ||
    type === 'DISPATCH_CREATED' ||
    type === 'DISPATCH_IN_TRANSIT' ||
    type === 'DISPATCH_DELIVERED';

  if (isOrderRelatedNotification) {
    if (extractedOrderNumber) {
      return `/orders/${extractedOrderNumber}`;
    }

    if (isLegacySalesOrderRoute) {
      const match = explicitRoute.match(/^\/(?:sales|supersales)?\/?orders\/(.+)$/);
      if (match && match[1]) {
        return `/orders/${match[1].trim()}`;
      }
    }

    if (entityId) {
      return `/orders/${entityId}`;
    }
    return '/orders';
  }

  // 2. If explicit non-sales route is provided and valid, adapt if needed and return
  if (explicitRoute.startsWith('/')) {
    let r = explicitRoute;
    // Adapt sales vs supersales if needed
    if (isSuperSales && r.startsWith('/sales/')) {
      r = r.replace('/sales/', '/supersales/');
    } else if (!isSuperSales && r.startsWith('/supersales/')) {
      r = r.replace('/supersales/', '/sales/');
    }
    // Adapt dispatch 1 vs dispatch 2 strictly
    if (isDispatch2User && r.startsWith('/dispatch') && !r.startsWith('/dispatch-2')) {
      r = r.replace('/dispatch', '/dispatch-2');
    } else if (isDispatch1User && r.startsWith('/dispatch-2')) {
      r = r.replace('/dispatch-2', '/dispatch');
    }
    return r;
  }

  // 3. Sales Orders fallback (if no explicit route and no extracted order number)
  if (
    entityType.toLowerCase() === 'salesorder' ||
    type.startsWith('SALES_ORDER_') ||
    title.includes('ORDER') ||
    title.includes('SALES ORDER') ||
    message.includes('SO-') ||
    message.includes('SALES ORDER')
  ) {
    if (userRole.includes('PLANT_HEAD')) {
      return '/plant-head/incoming-orders';
    }
    if (userRole.includes('PRODUCTION')) {
      return '/production/incoming-orders';
    }
    if (isDispatch2User) {
      return '/dispatch-2/orders';
    }
    if (isDispatch1User || userRole.includes('DISPATCH')) {
      return '/dispatch/orders';
    }
    if (entityId) {
      return `/orders/${entityId}`;
    }
    return '/orders';
  }

  // 3. Leads
  if (
    entityType.toLowerCase() === 'lead' ||
    type.startsWith('LEAD_') ||
    title.includes('LEAD') ||
    message.includes('LEAD')
  ) {
    if (entityId) {
      return `${salesBasePath}/leads?leadId=${encodeURIComponent(entityId)}`;
    }
    return `${salesBasePath}/leads`;
  }

  // 4. Quotations
  if (
    entityType.toLowerCase() === 'quotation' ||
    type.startsWith('QUOTATION_') ||
    title.includes('QUOTATION') ||
    message.includes('QUOTATION')
  ) {
    if (entityId) {
      return `${salesBasePath}/quotations?id=${encodeURIComponent(entityId)}`;
    }
    return `${salesBasePath}/quotations`;
  }

  // 5. Samples
  if (
    entityType.toLowerCase() === 'sample' ||
    entityType.toLowerCase() === 'samplerequest' ||
    type.startsWith('SAMPLE_') ||
    title.includes('SAMPLE') ||
    message.includes('SAMPLE')
  ) {
    if (entityId) {
      return `${salesBasePath}/samples?id=${encodeURIComponent(entityId)}`;
    }
    return `${salesBasePath}/samples`;
  }

  // 6. Customer Complaints
  if (
    entityType.toLowerCase() === 'customercomplaint' ||
    type.startsWith('COMPLAINT_') ||
    title.includes('COMPLAINT') ||
    message.includes('COMPLAINT')
  ) {
    return `${salesBasePath}/customer-complaints`;
  }

  // 7. Payments / Invoices / Followups
  if (
    entityType.toLowerCase() === 'payment' ||
    type.startsWith('PAYMENT_') ||
    title.includes('PAYMENT') ||
    message.includes('PAYMENT') ||
    message.includes('INVOICE')
  ) {
    if (userRole.includes('FINANCE')) {
      return '/finance';
    }
    return `${salesBasePath}/payment-history`;
  }

  // 8. Purchase Orders (PO)
  if (
    entityType.toLowerCase() === 'purchaseorder' ||
    type.startsWith('PO_') ||
    title.includes('PO ') ||
    title.includes('PURCHASE ORDER') ||
    message.includes('PO-')
  ) {
    if (
      userRole.includes('SUPER') ||
      userRole.includes('ADMIN') ||
      title.includes('SUPER ADMIN') ||
      message.includes('SUPER ADMIN')
    ) {
      return '/super-admin';
    }
    if (
      userRole.includes('PLANT_HEAD') ||
      title.includes('PLANT HEAD') ||
      message.includes('PLANT HEAD')
    ) {
      return '/plant-head/purchase-approval';
    }
    if (userRole.includes('FINANCE')) {
      return '/finance';
    }
    if (userRole.includes('STORE')) {
      return '/store';
    }
    return '/super-admin';
  }

  // 9. Purchase Indents / Material Requests
  if (
    entityType.toLowerCase() === 'purchaseindent' ||
    entityType.toLowerCase() === 'materialrequest' ||
    type.startsWith('INDENT_') ||
    type.startsWith('MATERIAL_') ||
    title.includes('INDENT') ||
    message.includes('INDENT') ||
    message.includes('IND-')
  ) {
    if (userRole.includes('PLANT_HEAD')) {
      return '/plant-head';
    }
    if (userRole.includes('FINANCE')) {
      return '/finance';
    }
    return '/store';
  }

  // 10. Goods Receipt Notes (GRN / Deliveries)
  if (
    entityType.toLowerCase() === 'goodsreceiptnote' ||
    title.includes('DELIVERY') ||
    message.includes('GRN-')
  ) {
    if (userRole.includes('FINANCE')) {
      return '/finance';
    }
    return '/store';
  }

  // 11. Expense Claims
  if (
    entityType.toLowerCase() === 'expenseclaim' ||
    type.startsWith('EXPENSE_') ||
    title.includes('EXPENSE') ||
    message.includes('EXP-')
  ) {
    if (userRole.includes('SUPER') || userRole.includes('ADMIN')) {
      const claimNoMatch = message.match(/EXP-\d+/i) || title.match(/EXP-\d+/i);
      const claimNo = claimNoMatch ? claimNoMatch[0] : entityId || '';
      return claimNo
        ? `/super-admin/expense-management?expenseId=${encodeURIComponent(claimNo)}`
        : '/super-admin/expense-management';
    }
    if (userRole.includes('HR')) {
      return '/hr/employees';
    }
    if (userRole.includes('FINANCE')) {
      return '/finance';
    }
    return '/super-admin/expense-management';
  }

  // 12. Work Orders / Production
  if (
    entityType.toLowerCase() === 'workorder' ||
    type.startsWith('WORK_ORDER_') ||
    type.startsWith('PRODUCTION_') ||
    title.includes('WORK ORDER') ||
    title.includes('PRODUCTION')
  ) {
    return '/production';
  }

  // 13. QC Inspections / Failures
  if (
    entityType.toLowerCase() === 'qctest' ||
    type.startsWith('QC_') ||
    title.includes('QC') ||
    message.includes('QC')
  ) {
    if (userRole.includes('PLANT_HEAD')) {
      return '/plant-head';
    }
    return '/qc';
  }

  // 14. Dispatch / Shipments
  if (
    entityType.toLowerCase() === 'dispatch' ||
    type.startsWith('DISPATCH_') ||
    title.includes('DISPATCH') ||
    title.includes('SHIPMENT') ||
    message.includes('DISPATCH')
  ) {
    if (isDispatch2User) {
      return '/dispatch-2/orders';
    }
    if (isDispatch1User || userRole.includes('DISPATCH')) {
      return '/dispatch/orders';
    }
    return '/dispatch/orders';
  }

  // 15. HR / Employees / Attendance / Payroll
  if (
    type.startsWith('LEAVE_') ||
    type.startsWith('ATTENDANCE_') ||
    type.startsWith('PAYROLL_') ||
    moduleName.includes('HR') ||
    title.includes('LEAVE') ||
    title.includes('ATTENDANCE') ||
    title.includes('PAYROLL')
  ) {
    if (userRole.includes('HR')) {
      return '/hr/employees';
    }
    return '/employee';
  }

  // 16. Fallback based on user role
  if (userRole.includes('SUPER') || userRole.includes('ADMIN')) {
    return '/super-admin';
  }
  if (userRole.includes('SALES')) {
    return `${salesBasePath}/dashboard`;
  }
  if (userRole.includes('PLANT')) {
    return '/plant-head';
  }
  if (userRole.includes('PRODUCTION')) {
    return '/production';
  }
  if (userRole.includes('STORE')) {
    return '/store';
  }
  if (userRole.includes('QC')) {
    return '/qc';
  }
  if (userRole.includes('FINANCE')) {
    return '/finance';
  }
  if (isDispatch2User) {
    return '/dispatch-2/orders';
  }
  if (isDispatch1User || userRole.includes('DISPATCH')) {
    return '/dispatch/orders';
  }
  if (userRole.includes('HR')) {
    return '/hr/employees';
  }
  if (userRole.includes('BACK_OFFICE')) {
    return '/back-office';
  }

  return '/dashboard';
}
