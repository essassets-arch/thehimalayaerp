import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getSalesScope } from '../../common/utils/rbac.util';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  route: string;
}

export interface SearchResultGroup {
  type: string;
  label: string;
  results: SearchResultItem[];
}

export interface GlobalSearchResponse {
  query: string;
  count: number;
  groups: SearchResultGroup[];
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(
    q: string,
    user: any,
    limit: number = 20,
    requestedTypes?: string,
    panel?: string,
  ): Promise<GlobalSearchResponse> {
    const queryStr = (q || '').trim();
    if (queryStr.length < 2) {
      return { query: queryStr, count: 0, groups: [] };
    }

    const userId = user?.sub || user?.id;
    const role = user?.role || '';
    const companyId = user?.companyId;

    if (!companyId) {
      return { query: queryStr, count: 0, groups: [] };
    }

    const normalizedRole = String(role)
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const panelPrefix = this.getPanelPrefix(panel || normalizedRole);

    // Derive strictly allowed entity types for the CURRENT PANEL
    const panelAllowedTypes = this.getPanelAllowedTypes(panel, normalizedRole);

    const allowedTypes = requestedTypes
      ? requestedTypes
          .split(',')
          .map((t) => t.trim().toUpperCase())
          .filter((t) => panelAllowedTypes.includes(t))
      : panelAllowedTypes;

    const groups: SearchResultGroup[] = [];
    const shouldSearch = (type: string) => allowedTypes.includes(type);

    // 1. LEADS
    if (
      shouldSearch('LEAD') &&
      this.canAccessDomain(normalizedRole, [
        'SUPER_SALES',
        'SALES',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const salesScope = getSalesScope(userId, role, 'Lead');
        const leads = await this.prisma.lead.findMany({
          where: {
            companyId,
            ...salesScope,
            deletedAt: null,
            OR: [
              { leadNumber: { contains: queryStr, mode: 'insensitive' } },
              { companyName: { contains: queryStr, mode: 'insensitive' } },
              { contactPerson: { contains: queryStr, mode: 'insensitive' } },
              { projectName: { contains: queryStr, mode: 'insensitive' } },
              { groupName: { contains: queryStr, mode: 'insensitive' } },
              { phone: { contains: queryStr, mode: 'insensitive' } },
              { email: { contains: queryStr, mode: 'insensitive' } },
              { gstNumber: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          include: { workflowState: true },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (leads.length > 0) {
          groups.push({
            type: 'LEAD',
            label: 'Leads',
            results: leads.map((l) => ({
              id: l.id,
              title: l.companyName || l.leadNumber,
              subtitle: `${l.leadNumber}${l.contactPerson ? ' · ' + l.contactPerson : ''}`,
              meta: l.phone || l.email || '',
              status: l.workflowState?.name || 'NEW',
              route: `${panelPrefix}/leads/${l.id}`,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching leads:', err);
      }
    }

    // 2. QUOTATIONS
    if (
      shouldSearch('QUOTATION') &&
      this.canAccessDomain(normalizedRole, [
        'SUPER_SALES',
        'SALES',
        'FINANCE',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const salesScope = getSalesScope(userId, role, 'Quotation');
        const quotations = await this.prisma.quotation.findMany({
          where: {
            companyId,
            ...salesScope,
            deletedAt: null,
            OR: [
              { quotationNumber: { contains: queryStr, mode: 'insensitive' } },
              {
                lead: {
                  companyName: { contains: queryStr, mode: 'insensitive' },
                },
              },
              {
                lead: {
                  leadNumber: { contains: queryStr, mode: 'insensitive' },
                },
              },
            ],
          },
          include: { lead: true, workflowState: true },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (quotations.length > 0) {
          groups.push({
            type: 'QUOTATION',
            label: 'Quotations',
            results: quotations.map((q) => ({
              id: q.id,
              title: q.quotationNumber,
              subtitle: q.lead?.companyName || 'Quotation',
              meta: q.total
                ? `₹${Number(q.total).toLocaleString('en-IN')}`
                : '',
              status: q.workflowState?.name || 'DRAFT',
              route: `${panelPrefix}/quotations`,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching quotations:', err);
      }
    }

    // 3. SALES ORDERS
    if (
      shouldSearch('SALES_ORDER') &&
      this.canAccessDomain(normalizedRole, [
        'SUPER_SALES',
        'SALES',
        'PLANT_HEAD',
        'PRODUCTION',
        'DISPATCH',
        'FINANCE',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const salesScope = getSalesScope(userId, role, 'SalesOrder');
        const orders = await this.prisma.salesOrder.findMany({
          where: {
            customer: { companyId },
            ...salesScope,
            deletedAt: null,
            OR: [
              { orderNumber: { contains: queryStr, mode: 'insensitive' } },
              {
                customerPurchaseOrderNo: {
                  contains: queryStr,
                  mode: 'insensitive',
                },
              },
              {
                customer: {
                  companyName: { contains: queryStr, mode: 'insensitive' },
                },
              },
            ],
          },
          include: { customer: true, workflowState: true },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (orders.length > 0) {
          const orderRoute =
            (panel && panel.includes('plant-head')) ||
            normalizedRole === 'PLANT_HEAD'
              ? '/plant-head/incoming-orders'
              : (panel && panel.includes('production')) ||
                  normalizedRole.startsWith('PRODUCTION')
                ? '/production/incoming-orders'
                : (panel && panel.includes('dispatch')) ||
                    normalizedRole.startsWith('DISPATCH')
                  ? '/dispatch/orders'
                  : `${panelPrefix}/orders`;

          groups.push({
            type: 'SALES_ORDER',
            label: 'Sales Orders',
            results: orders.map((o) => ({
              id: o.id,
              title: o.orderNumber,
              subtitle: o.customer?.companyName || 'Sales Order',
              meta: o.customerPurchaseOrderNo
                ? `PO: ${o.customerPurchaseOrderNo}`
                : '',
              status: o.workflowState?.name || o.status || 'CONFIRMED',
              route: orderRoute,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching sales orders:', err);
      }
    }

    // 4. SAMPLES
    if (
      shouldSearch('SAMPLE') &&
      this.canAccessDomain(normalizedRole, [
        'SUPER_SALES',
        'SALES',
        'DISPATCH',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const salesScope = getSalesScope(userId, role, 'SampleRequest');
        const samples = await this.prisma.sampleRequest.findMany({
          where: {
            companyId,
            ...salesScope,
            deletedAt: null,
            OR: [
              { sampleNumber: { contains: queryStr, mode: 'insensitive' } },
              {
                customer: {
                  companyName: { contains: queryStr, mode: 'insensitive' },
                },
              },
              {
                lead: {
                  companyName: { contains: queryStr, mode: 'insensitive' },
                },
              },
            ],
          },
          include: { customer: true, lead: true },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (samples.length > 0) {
          groups.push({
            type: 'SAMPLE',
            label: 'Samples',
            results: samples.map((s) => ({
              id: s.id,
              title: s.sampleNumber,
              subtitle:
                s.customer?.companyName ||
                s.lead?.companyName ||
                'Sample Request',
              meta: s.status || '',
              status: s.status || 'CREATED',
              route:
                (panel && panel.includes('dispatch')) ||
                normalizedRole.startsWith('DISPATCH')
                  ? '/dispatch/sample-dispatch'
                  : `${panelPrefix}/samples`,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching samples:', err);
      }
    }

    // 5. CUSTOMERS
    if (
      shouldSearch('CUSTOMER') &&
      this.canAccessDomain(normalizedRole, [
        'SUPER_SALES',
        'SALES',
        'FINANCE',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const customers = await this.prisma.customer.findMany({
          where: {
            companyId,
            deletedAt: null,
            OR: [
              { companyName: { contains: queryStr, mode: 'insensitive' } },
              { customerCode: { contains: queryStr, mode: 'insensitive' } },
              { contactPerson: { contains: queryStr, mode: 'insensitive' } },
              { phone: { contains: queryStr, mode: 'insensitive' } },
              { email: { contains: queryStr, mode: 'insensitive' } },
              { gstin: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { companyName: 'asc' },
        });

        if (customers.length > 0) {
          groups.push({
            type: 'CUSTOMER',
            label: 'Customers',
            results: customers.map((c) => ({
              id: c.id,
              title: c.companyName,
              subtitle: c.contactPerson || c.customerCode || 'Customer',
              meta: c.phone || c.email || c.gstin || '',
              status: c.status || 'ACTIVE',
              route: `${panelPrefix}/customers`,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching customers:', err);
      }
    }

    // 6. WORK ORDERS
    if (
      shouldSearch('WORK_ORDER') &&
      this.canAccessDomain(normalizedRole, [
        'PLANT_HEAD',
        'PRODUCTION',
        'QC',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const workOrders = await this.prisma.workOrder.findMany({
          where: {
            OR: [
              { workOrderNumber: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (workOrders.length > 0) {
          const woRoute =
            (panel && panel.includes('plant-head')) ||
            normalizedRole === 'PLANT_HEAD'
              ? '/plant-head/planning'
              : (panel && panel.includes('qc')) || normalizedRole === 'QC'
                ? '/qc/pending'
                : '/production/work-orders';

          groups.push({
            type: 'WORK_ORDER',
            label: 'Work Orders',
            results: workOrders.map((w) => ({
              id: w.id,
              title: w.workOrderNumber,
              subtitle: 'Work Order',
              meta: `Qty: ${w.quantity}`,
              status: w.status || 'CREATED',
              route: woRoute,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching work orders:', err);
      }
    }

    // 7. PRODUCTS / MATERIALS
    if (
      shouldSearch('PRODUCT') &&
      this.canAccessDomain(normalizedRole, [
        'PLANT_HEAD',
        'PRODUCTION',
        'STORE',
        'SUPER_ADMIN',
        'ADMIN',
      ])
    ) {
      try {
        const products = await this.prisma.product.findMany({
          where: {
            companyId,
            isActive: true,
            OR: [
              { name: { contains: queryStr, mode: 'insensitive' } },
              { sku: { contains: queryStr, mode: 'insensitive' } },
              { category: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { name: 'asc' },
        });

        if (products.length > 0) {
          const prodRoute =
            (panel && panel.includes('store')) || normalizedRole === 'STORE'
              ? '/store/raw-inventory'
              : (panel && panel.includes('plant-head')) ||
                  normalizedRole === 'PLANT_HEAD'
                ? '/plant-head/products'
                : '/production/all-stock';

          groups.push({
            type: 'PRODUCT',
            label: 'Products & Materials',
            results: products.map((p) => ({
              id: p.id,
              title: p.name,
              subtitle: `${p.sku || 'SKU'} · ${p.category || 'General'}`,
              meta: p.unit || '',
              status: p.productType || 'PRODUCT',
              route: prodRoute,
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching products:', err);
      }
    }

    // 8. MATERIAL REQUESTS
    if (
      shouldSearch('MATERIAL_REQUEST') &&
      this.canAccessDomain(normalizedRole, [
        'PLANT_HEAD',
        'PRODUCTION',
        'STORE',
        'ADMIN',
        'SUPER_ADMIN',
      ])
    ) {
      try {
        const matReqs = await this.prisma.materialRequest.findMany({
          where: {
            companyId,
            OR: [
              { publicId: { contains: queryStr, mode: 'insensitive' } },
              { workOrderNo: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (matReqs.length > 0) {
          groups.push({
            type: 'MATERIAL_REQUEST',
            label: 'Material Requests',
            results: matReqs.map((m) => ({
              id: m.id,
              title: m.publicId || m.workOrderNo || 'MR',
              subtitle: 'Material Requisition',
              meta: m.priority || '',
              status: m.status || 'PENDING',
              route:
                (panel && panel.includes('plant-head')) ||
                normalizedRole === 'PLANT_HEAD'
                  ? '/plant-head/material-approvals'
                  : '/store/material-requests',
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching material requests:', err);
      }
    }

    // 9. DISPATCHES
    if (
      shouldSearch('DISPATCH') &&
      this.canAccessDomain(normalizedRole, [
        'DISPATCH',
        'PLANT_HEAD',
        'SUPER_ADMIN',
        'ADMIN',
      ])
    ) {
      try {
        const dispatches = await this.prisma.dispatch.findMany({
          where: {
            OR: [
              { dispatchNo: { contains: queryStr, mode: 'insensitive' } },
              { vehicleNumber: { contains: queryStr, mode: 'insensitive' } },
              { lrNumber: { contains: queryStr, mode: 'insensitive' } },
              { transporterName: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (dispatches.length > 0) {
          groups.push({
            type: 'DISPATCH',
            label: 'Dispatches',
            results: dispatches.map((d) => ({
              id: d.id,
              title: d.dispatchNo,
              subtitle: `${d.vehicleNumber || 'No Vehicle'} · ${d.transporterName || 'Transporter'}`,
              meta: d.lrNumber ? `LR: ${d.lrNumber}` : '',
              status: d.status || 'CREATED',
              route: '/dispatch/orders',
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching dispatches:', err);
      }
    }

    // 10. EMPLOYEES (HR)
    if (
      shouldSearch('EMPLOYEE') &&
      this.canAccessDomain(normalizedRole, ['HR', 'SUPER_ADMIN', 'ADMIN'])
    ) {
      try {
        const employees = await this.prisma.employee.findMany({
          where: {
            companyId,
            OR: [
              { employeeCode: { contains: queryStr, mode: 'insensitive' } },
              { firstName: { contains: queryStr, mode: 'insensitive' } },
              { lastName: { contains: queryStr, mode: 'insensitive' } },
              { fullName: { contains: queryStr, mode: 'insensitive' } },
              { jobTitle: { contains: queryStr, mode: 'insensitive' } },
              { workEmail: { contains: queryStr, mode: 'insensitive' } },
              { phoneNumber: { contains: queryStr, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { firstName: 'asc' },
        });

        if (employees.length > 0) {
          groups.push({
            type: 'EMPLOYEE',
            label: 'Employees',
            results: employees.map((e) => ({
              id: e.id,
              title: e.fullName || `${e.firstName} ${e.lastName}`.trim(),
              subtitle: `${e.employeeCode} · ${e.jobTitle || 'Staff'}`,
              meta: e.phoneNumber || e.workEmail || '',
              status: e.status || 'ACTIVE',
              route:
                (panel && panel.includes('hr')) || normalizedRole === 'HR'
                  ? '/hr/employees'
                  : '/super-admin/employees',
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching employees:', err);
      }
    }

    // 11. PURCHASE ORDERS (FINANCE)
    if (
      shouldSearch('PURCHASE_ORDER') &&
      this.canAccessDomain(normalizedRole, ['FINANCE', 'SUPER_ADMIN', 'ADMIN'])
    ) {
      try {
        const pos = await this.prisma.purchaseOrder.findMany({
          where: {
            companyId,
            OR: [
              { poNumber: { contains: queryStr, mode: 'insensitive' } },
              {
                supplier: { name: { contains: queryStr, mode: 'insensitive' } },
              },
            ],
          },
          include: { supplier: true },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        if (pos.length > 0) {
          groups.push({
            type: 'PURCHASE_ORDER',
            label: 'Purchase Orders',
            results: pos.map((p) => ({
              id: p.id,
              title: p.poNumber || p.publicId || 'PO',
              subtitle: p.supplier?.name || 'Purchase Order',
              meta: p.totalAmount
                ? `₹${Number(p.totalAmount).toLocaleString('en-IN')}`
                : '',
              status: p.status || 'DRAFT',
              route: '/finance/po-requests',
            })),
          });
        }
      } catch (err) {
        console.error('[SEARCH] Error searching purchase orders:', err);
      }
    }

    const totalCount = groups.reduce((acc, g) => acc + g.results.length, 0);

    groups.forEach((g) => {
      g.results.sort((a, b) => {
        const aExact =
          a.title.toLowerCase() === queryStr.toLowerCase() ||
          a.subtitle.toLowerCase().includes(queryStr.toLowerCase());
        const bExact =
          b.title.toLowerCase() === queryStr.toLowerCase() ||
          b.subtitle.toLowerCase().includes(queryStr.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });
    });

    return {
      query: queryStr,
      count: totalCount,
      groups,
    };
  }

  private getPanelAllowedTypes(panel?: string, role?: string): string[] {
    const rawPanel = (panel || '').toLowerCase().trim();
    const rawRole = (role || '').toLowerCase().trim();

    let activePanel = '';
    if (rawPanel.includes('supersales')) activePanel = 'supersales';
    else if (rawPanel.includes('sales')) activePanel = 'sales';
    else if (
      rawPanel.includes('plant-head') ||
      rawPanel.includes('plant_head') ||
      rawPanel.includes('planthead')
    )
      activePanel = 'plant_head';
    else if (rawPanel.includes('production')) activePanel = 'production';
    else if (rawPanel.includes('store')) activePanel = 'store';
    else if (rawPanel.includes('qc')) activePanel = 'qc';
    else if (rawPanel.includes('dispatch')) activePanel = 'dispatch';
    else if (rawPanel.includes('finance')) activePanel = 'finance';
    else if (rawPanel.includes('hr')) activePanel = 'hr';
    else if (
      rawPanel.includes('super-admin') ||
      rawPanel.includes('super_admin') ||
      rawPanel.includes('admin')
    )
      activePanel = 'super_admin';

    if (!activePanel) {
      if (rawRole.includes('supersales')) activePanel = 'supersales';
      else if (rawRole.includes('sales')) activePanel = 'sales';
      else if (rawRole.includes('plant_head')) activePanel = 'plant_head';
      else if (rawRole.includes('production')) activePanel = 'production';
      else if (rawRole.includes('store')) activePanel = 'store';
      else if (rawRole.includes('qc')) activePanel = 'qc';
      else if (rawRole.includes('dispatch')) activePanel = 'dispatch';
      else if (rawRole.includes('finance')) activePanel = 'finance';
      else if (rawRole.includes('hr')) activePanel = 'hr';
      else activePanel = 'sales';
    }

    switch (activePanel) {
      case 'supersales':
      case 'sales':
        return [
          'LEAD',
          'QUOTATION',
          'SALES_ORDER',
          'SAMPLE',
          'CUSTOMER',
          'CUSTOMER_COMPLAINT',
          'REMINDER',
        ];

      case 'plant_head':
        return [
          'SALES_ORDER',
          'WORK_ORDER',
          'MATERIAL_REQUEST',
          'PURCHASE_INDENT',
          'PRODUCT',
          'DISPATCH',
        ];

      case 'production':
        return ['SALES_ORDER', 'WORK_ORDER', 'MATERIAL_REQUEST', 'PRODUCT'];

      case 'store':
        return ['PRODUCT', 'MATERIAL_REQUEST', 'PURCHASE_INDENT'];

      case 'qc':
        return ['WORK_ORDER', 'QC_INSPECTION'];

      case 'dispatch':
        return ['DISPATCH', 'SALES_ORDER', 'SAMPLE'];

      case 'finance':
        return [
          'SALES_ORDER',
          'QUOTATION',
          'CUSTOMER_PAYMENT',
          'PURCHASE_ORDER',
          'VENDOR_INVOICE',
          'CUSTOMER',
        ];

      case 'hr':
        return ['EMPLOYEE'];

      case 'super_admin':
        return [
          'LEAD',
          'QUOTATION',
          'SALES_ORDER',
          'SAMPLE',
          'CUSTOMER',
          'WORK_ORDER',
          'PRODUCT',
          'MATERIAL_REQUEST',
          'DISPATCH',
          'EMPLOYEE',
          'PURCHASE_ORDER',
        ];

      default:
        return ['LEAD', 'QUOTATION', 'SALES_ORDER', 'SAMPLE', 'CUSTOMER'];
    }
  }

  private getPanelPrefix(normalizedRoleOrPanel: string): string {
    const raw = String(normalizedRoleOrPanel)
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    if (raw.includes('SUPERSALES')) return '/supersales';
    if (raw.includes('SALES')) return '/sales';
    if (raw.includes('PLANT')) return '/plant-head';
    if (raw.includes('PRODUCTION')) return '/production';
    if (raw.includes('STORE')) return '/store';
    if (raw.includes('QC')) return '/qc';
    if (raw.includes('DISPATCH')) return '/dispatch';
    if (raw.includes('FINANCE')) return '/finance';
    if (raw.includes('HR')) return '/hr';
    if (raw.includes('ADMIN')) return '/super-admin';
    return '/sales';
  }

  private canAccessDomain(role: string, allowedCategories: string[]): boolean {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SUPER_USER')
      return true;
    for (const cat of allowedCategories) {
      if (cat === 'SUPER_SALES' && role === 'SUPER_SALES') return true;
      if (cat === 'SALES' && (role.includes('SALES') || role === 'SUPER_SALES'))
        return true;
      if (cat === 'PLANT_HEAD' && role === 'PLANT_HEAD') return true;
      if (
        cat === 'PRODUCTION' &&
        (role.includes('PRODUCTION') || role === 'PLANT_HEAD')
      )
        return true;
      if (cat === 'STORE' && (role.includes('STORE') || role === 'PLANT_HEAD'))
        return true;
      if (cat === 'QC' && (role === 'QC' || role === 'PLANT_HEAD')) return true;
      if (
        cat === 'DISPATCH' &&
        (role.includes('DISPATCH') || role === 'PLANT_HEAD')
      )
        return true;
      if (cat === 'FINANCE' && role.includes('FINANCE')) return true;
      if (cat === 'HR' && role === 'HR') return true;
    }
    return false;
  }
}
