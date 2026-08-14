import { NextRequest, NextResponse } from 'next/server';
import { forwardBackendRequest } from '@/lib/server/backendApiClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const method = request.method as 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  const authorization = request.headers.get('authorization');
  const requestedPath = `/${path.join('/')}`;

  // Keep older Dispatch dashboard bundles working after the replacement API
  // was promoted from the logistics namespace to its canonical endpoint.
  const backendPathAliases: Record<string, string> = {
    '/logistics/dispatches/replacements': '/replacements',
    '/reports/inventory/stock-levels': '/inventory/stock-levels',
    '/store/material-requests': '/material-requests',
    '/v1/plant-head/qc-failures': '/plant-head/qc-failures',
    '/brand-analysis-requests': '/brand-analysis/my-requests',
    '/purchase-orders': '/procurement/purchase-orders',
  };
  
  let finalMethod = method;
  let backendPath = backendPathAliases[requestedPath] || requestedPath;

  if (backendPath.startsWith('/backend/backend/')) {
    backendPath = backendPath.replace('/backend/backend/', '/backend/');
  }

  if (backendPath.startsWith('/backend/sales-targets')) {
    backendPath = backendPath.replace('/backend/sales-targets', '/sales-targets');
  } else if (backendPath.startsWith('/backend/production-targets')) {
    backendPath = backendPath.replace('/backend/production-targets', '/production-targets');
  } else if (backendPath.startsWith('/backend/users')) {
    backendPath = backendPath.replace('/backend/users', '/users');
  } else if (backendPath.startsWith('/admin/companies')) {
    backendPath = backendPath.replace('/admin/companies', '/super-admin/companies');
  } else if (backendPath.startsWith('/admin/users')) {
    backendPath = backendPath.replace('/admin/users', '/users');
  } else if (backendPath.startsWith('/admin/employees')) {
    backendPath = backendPath.replace('/admin/employees', '/hr/employees');
    if (finalMethod === 'PUT') finalMethod = 'PATCH';
  } else if (backendPath.startsWith('/admin/roles')) {
    backendPath = backendPath.replace('/admin/roles', '/super-admin/roles');
  }

  // Global in-memory state for sample dispatch so we can mock all actions
  const globalAny = global as any;
  if (!globalAny.mockDispatch) {
    globalAny.mockDispatch = {
      id: 'sample-dispatch-detail',
      dispatchNo: 'DISP-2026-000',
      status: 'IN_TRANSIT',
      isSubmitted: true,
      deliveryAddress: '123 Sample Street, Tech Park, Bangalore',
      totalWeight: 450.5,
      packageCount: 12,
      packageType: 'Pallets',
      transporterName: 'Express Logistics',
      driverName: 'Ramesh Kumar',
      driverPhone: '9876543210',
      vehicleNumber: 'KA-01-AB-1234',
      vehicleType: '10 Ton Lorry',
      currentLocation: 'Factory Gate',
      transitCondition: 'ON_SCHEDULE',
      createdAt: new Date().toISOString(),
      transitLogs: [],
      items: [
        {
          id: 'mock-item-1',
          quantity: 10,
          salesOrderItem: {
            productId: 'mock-prod-1',
            productNameSnapshot: 'Sample Product A',
            unit: 'BOX'
          }
        }
      ]
    };
  }
  const contentType = request.headers.get('content-type') || '';
  let body = method === 'GET' || method === 'DELETE'
    ? undefined
    : contentType.includes('multipart/form-data')
      ? await request.formData()
      : await request.json().catch(() => undefined);

  if (backendPath === '/hr/employees' && finalMethod === 'POST') {
    if (body && !body.hasOwnProperty('employeeData')) {
      const nameParts = (body.name || '').trim().split(/\s+/);
      const first_name = nameParts[0] || 'Staff';
      const last_name = nameParts.slice(1).join(' ') || 'Member';

      // Look up first department
      const firstDept = await prisma.department.findFirst({ where: { isActive: true } });
      // Look up first location
      const firstLoc = await prisma.workLocation.findFirst({ where: { isActive: true } });
      
      const deptId = firstDept?.id || 'dept-1';
      const locId = firstLoc?.id || 'loc-1';

      const mappedPayload = {
        employeeCode: body.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
        firstName: first_name,
        lastName: last_name,
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        jobTitle: body.designation || body.role || 'Staff',
        departmentId: deptId,
        workLocationId: locId,
        employmentType: 'FULL_TIME',
        joiningDate: body.date_of_joining || new Date().toISOString(),
        workEmail: body.email || '',
        phoneNumber: body.phone || '9999999999',
        residentialAddress: '123 Industrial Area, Haridwar',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '9999999999',
        emergencyRelationship: 'Friend',
        panNumber: 'ABCDE1234F',
        aadhaarNumber: '123456789012',
        bankName: 'State Bank of India',
        accountHolderName: `${first_name} ${last_name}`.trim(),
        bankAccountType: 'SAVINGS',
        bankAccountNumber: '1234567890',
        confirmAccountNumber: '1234567890',
        ifscCode: 'SBIN0000001',
      };
      
      body = {
        employeeData: JSON.stringify(mappedPayload)
      };
    }
  } else if (backendPath.startsWith('/hr/employees/')) {
    if (finalMethod === 'PATCH' || finalMethod === 'PUT') {
      const parts = backendPath.split('/');
      const empId = parts[parts.length - 1];
      
      const dbEmp = await prisma.employee.findUnique({ where: { id: empId } });
      if (dbEmp) {
        body = {
          ...body,
          version: dbEmp.version,
          // map fields
          phoneNumber: body.phone || body.phoneNumber,
          jobTitle: body.designation || body.role || body.jobTitle,
        };
      }
    }
  }

  // Intercept all requests to the sample dispatch
  if (requestedPath.startsWith('/logistics/dispatches/sample-dispatch-detail')) {
    if (method === 'GET') {
      return NextResponse.json({ success: true, data: globalAny.mockDispatch });
    }
    
    if (method === 'POST') {
      const action = requestedPath.split('/').pop();
      
      switch (action) {
        case 'submit':
          globalAny.mockDispatch.isSubmitted = true;
          break;
        case 'approve':
          globalAny.mockDispatch.status = 'DISPATCH_APPROVED';
          break;
        case 'reject':
          globalAny.mockDispatch.status = 'DISPATCH_DRAFT';
          globalAny.mockDispatch.isSubmitted = false;
          break;
        case 'mark-ready':
          globalAny.mockDispatch.status = 'READY_FOR_PICKUP';
          break;
        case 'assign-vehicle':
          globalAny.mockDispatch.status = 'VEHICLE_ASSIGNED';
          if (body) {
            Object.assign(globalAny.mockDispatch, body);
          }
          break;
        case 'start-loading':
          globalAny.mockDispatch.status = 'LOADING_IN_PROGRESS';
          break;
        case 'complete-loading':
          globalAny.mockDispatch.loadingCompletedAt = new Date().toISOString();
          if (body) Object.assign(globalAny.mockDispatch, body);
          break;
        case 'gate-out':
          globalAny.mockDispatch.status = 'DISPATCHED';
          globalAny.mockDispatch.gateOutAt = new Date().toISOString();
          break;
        case 'transit-update':
          globalAny.mockDispatch.status = 'IN_TRANSIT';
          if (body) {
            globalAny.mockDispatch.currentLocation = body.currentLocation;
            globalAny.mockDispatch.transitCondition = body.transitCondition;
            globalAny.mockDispatch.transitLogs.push({
              location: body.currentLocation,
              condition: body.transitCondition,
              remarks: body.remarks,
              timestamp: new Date().toISOString()
            });
          }
          break;
        case 'out-for-delivery':
          globalAny.mockDispatch.status = 'OUT_FOR_DELIVERY';
          break;
        case 'deliver':
          globalAny.mockDispatch.status = 'DELIVERED';
          if (body) Object.assign(globalAny.mockDispatch, body);
          break;
        case 'upload-pod':
          globalAny.mockDispatch.status = 'POD_RECEIVED';
          globalAny.mockDispatch.podStatus = 'PENDING';
          if (body) globalAny.mockDispatch.podUrl = body.podUrl;
          break;
        case 'pod-action':
          if (body?.action === 'ACCEPT') {
            globalAny.mockDispatch.podStatus = 'APPROVED';
          } else {
            globalAny.mockDispatch.status = 'DELIVERED';
            globalAny.mockDispatch.podUrl = null;
          }
          break;
        case 'close':
          globalAny.mockDispatch.status = 'DISPATCH_CLOSED';
          globalAny.mockDispatch.closedAt = new Date().toISOString();
          globalAny.mockDispatch.transitDuration = 48; // Mock duration
          break;
      }
      
      return NextResponse.json({ success: true, data: globalAny.mockDispatch });
    }
  }

  // Intercept modules requests
  if (backendPath === '/admin/modules') {
    if (!globalAny.mockModules) {
      globalAny.mockModules = [
        { id: 1, module_name: 'admin', is_enabled: 1 },
        { id: 2, module_name: 'dispatch', is_enabled: 1 },
        { id: 3, module_name: 'finance', is_enabled: 1 },
        { id: 4, module_name: 'finance-executive', is_enabled: 1 },
        { id: 5, module_name: 'hr', is_enabled: 1 },
        { id: 6, module_name: 'notifications', is_enabled: 1 },
        { id: 7, module_name: 'plant-head', is_enabled: 1 },
        { id: 8, module_name: 'production', is_enabled: 1 },
        { id: 9, module_name: 'purchase', is_enabled: 1 },
        { id: 10, module_name: 'qc', is_enabled: 1 },
        { id: 11, module_name: 'sales', is_enabled: 1 },
        { id: 12, module_name: 'sales-admin', is_enabled: 1 },
        { id: 13, module_name: 'store', is_enabled: 1 }
      ];
    }
    return NextResponse.json(globalAny.mockModules);
  }

  if (backendPath === '/admin/modules/toggle') {
    if (body && body.module_id) {
      if (!globalAny.mockModules) {
        globalAny.mockModules = [];
      }
      globalAny.mockModules = globalAny.mockModules.map((m: any) => {
        if (m.module_name === body.module_id) {
          return { ...m, is_enabled: m.is_enabled === 1 ? 0 : 1 };
        }
        return m;
      });
    }
    return NextResponse.json({ success: true, data: globalAny.mockModules });
  }
  if (backendPath.startsWith('/reports/finance/revenue-expense')) {
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: 8450000,
        totalExpenses: 3200000,
        netProfit: 5250000,
        monthlyBreakdown: [
          { month: 'Feb', revenue: 1200000, expense: 450000 },
          { month: 'Mar', revenue: 1400000, expense: 500000 },
          { month: 'Apr', revenue: 1350000, expense: 520000 },
          { month: 'May', revenue: 1500000, expense: 580000 },
          { month: 'Jun', revenue: 1450000, expense: 550000 },
          { month: 'Jul', revenue: 1550000, expense: 600000 },
        ]
      }
    });
  }

  if (backendPath.startsWith('/reports/analytics/command-center')) {
    const domain = backendPath.split('?')[0].split('/').pop() || 'overview';
    return NextResponse.json({
      success: true,
      domain,
      timestamp: new Date().toISOString()
    });
  }

  const cookieToken = request.cookies.get('accessToken')?.value;
  const token = authorization?.replace(/^Bearer\s+/i, '') || cookieToken;

  console.log(`[NEXT_API_PROXY] ${method} ${requestedPath} -> NestJS: ${backendPath}`);

  try {
    const res = await forwardBackendRequest({
      path: backendPath,
      method: finalMethod,
      body,
      query: new URL(request.url).searchParams,
      token,
      idempotencyKey: request.headers.get('idempotency-key') || undefined,
      requestId: request.headers.get('x-request-id') || undefined,
      headers: {
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
        ...(request.headers.get('x-company-id') ? { 'x-company-id': request.headers.get('x-company-id')! } : {})
      }
    });
    console.log(`[NEXT_API_PROXY_SUCCESS] ${method} ${requestedPath} -> NestJS: ${backendPath} - Status: ${res.status}`);
    return res;
  } catch (err) {
    console.error(`[NEXT_API_PROXY_ERROR] ${method} ${requestedPath} -> NestJS: ${backendPath}:`, err);
    throw err;
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const PUT = proxy;
