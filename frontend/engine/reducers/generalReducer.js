export const generalReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SYNC_BACKEND_DATA':
      return {
        ...state,
        orders: Array.isArray(action.payload.orders) ? action.payload.orders : state.orders || [],
        purchaseOrders: Array.isArray(action.payload.purchaseOrders) ? action.payload.purchaseOrders : state.purchaseOrders || [],
        dispatches: Array.isArray(action.payload.dispatches) ? action.payload.dispatches : state.dispatches || [],
        payments: Array.isArray(action.payload.payments) ? action.payload.payments : state.payments || [],
        invoices: Array.isArray(action.payload.invoices) ? action.payload.invoices : state.invoices || [],
        notifications: Array.isArray(action.payload.notifications) ? action.payload.notifications : state.notifications || [],
        leads: Array.isArray(action.payload.leads) ? action.payload.leads : state.leads || [],
        samples: Array.isArray(action.payload.samples) ? action.payload.samples : state.samples || [],
        quotations: Array.isArray(action.payload.quotations) ? action.payload.quotations : state.quotations || [],
        users: Array.isArray(action.payload.users) ? action.payload.users : state.users || [],
        employees: Array.isArray(action.payload.employees) ? action.payload.employees : state.employees || [],
        leaves: Array.isArray(action.payload.leaves) ? action.payload.leaves : state.leaves || [],
        auditLogs: Array.isArray(action.payload.auditLogs) ? action.payload.auditLogs : state.auditLogs || [],
        settings: action.payload.settings ? { ...state.settings, ...action.payload.settings } : state.settings || {},
        disabledModules: Array.isArray(action.payload.disabledModules) ? action.payload.disabledModules : state.disabledModules || [],
        productCatalog: Array.isArray(action.payload.productCatalog) ? action.payload.productCatalog : state.productCatalog || [],
        rawInventory: Array.isArray(action.payload.rawInventory) ? action.payload.rawInventory : state.rawInventory || [],
        finishedInventory: Array.isArray(action.payload.finishedInventory) ? action.payload.finishedInventory : state.finishedInventory || [],
        machines: Array.isArray(action.payload.machines) ? action.payload.machines : state.machines || [],
        bom: Array.isArray(action.payload.bom) ? action.payload.bom : state.bom || [],
        workOrders: Array.isArray(action.payload.workOrders) ? action.payload.workOrders : state.workOrders || [],
        materialRequests: Array.isArray(action.payload.materialRequests) ? action.payload.materialRequests : state.materialRequests || [],
        exitClearances: Array.isArray(action.payload.exitClearances) ? action.payload.exitClearances : (state.exitClearances || [])
      };

    case 'RECORD_EVENT':
      return {
        ...state,
        eventStore: [...(state.eventStore || []), action.payload]
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.department === action.payload ? { ...n, read: true } : n
        )
      };

    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLogs: [action.payload, ...state.auditLogs]
      };

    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [...state.employees, action.payload]
      };

    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e)
      };

    case 'RECORD_LEAVE':
      return {
        ...state,
        leaves: [...state.leaves, action.payload]
      };

    case 'UPDATE_LEAVE':
      return {
        ...state,
        leaves: state.leaves.map(leave =>
          leave.id === action.payload.id ? { ...leave, ...action.payload } : leave
        )
      };

    case 'RUN_PAYROLL':
      return {
        ...state,
        employees: state.employees.map(e => {
          if (e.id === action.payload.empId) {
            return {
              ...e,
              payroll: action.payload.payroll
            };
          }
          return e;
        })
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [...(state.users || []), { status: 'Active', ...action.payload }],
        settings: {
          ...(state.settings || {}),
          salesTargets: {
            ...((state.settings || {}).salesTargets || {}),
            [action.payload.id]: 0
          }
        }
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: (state.users || []).map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u)
      };

    case 'DELETE_USER': {
      const updatedTargets = { ...((state.settings || {}).salesTargets || {}) };
      delete updatedTargets[action.payload];
      return {
        ...state,
        users: (state.users || []).filter(u => u.id !== action.payload),
        settings: {
          ...(state.settings || {}),
          salesTargets: updatedTargets
        }
      };
    }

    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: (state.employees || []).filter(e => e.id !== action.payload)
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...(state.settings || {}), ...action.payload }
      };

    case 'UPDATE_SHIFT':
      return {
        ...state,
        shifts: (state.shifts || []).map(s => s.empId === action.payload.empId ? { ...s, ...action.payload } : s)
      };

    case 'UPDATE_EXIT_CLEARANCE':
      return {
        ...state,
        exitClearances: (state.exitClearances || []).map(ex => (ex.empId === action.payload.empId || ex.id === action.payload.id) ? { ...ex, ...action.payload } : ex)
      };

    case 'ADD_EXIT_CLEARANCE':
      return {
        ...state,
        exitClearances: [
          action.payload,
          ...(state.exitClearances || []).filter(ex => ex.empId !== action.payload.empId && ex.id !== action.payload.id)
        ]
      };

    case 'DELETE_EXIT_CLEARANCE':
      return {
        ...state,
        exitClearances: (state.exitClearances || []).filter(ex => ex.empId !== action.payload && ex.id !== action.payload)
      };

    case 'SET_EXIT_CLEARANCES':
      return {
        ...state,
        exitClearances: Array.isArray(action.payload) ? action.payload : []
      };

    case 'ADD_PAYMENT_REMINDER':
      return {
        ...state,
        paymentReminders: [action.payload, ...(state.paymentReminders || [])]
      };

    case 'DELETE_PAYMENT_REMINDER':
      return {
        ...state,
        paymentReminders: (state.paymentReminders || []).filter(r => r.id !== action.payload)
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        productCatalog: [...(state.productCatalog || []), action.payload]
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        productCatalog: (state.productCatalog || []).map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        productCatalog: (state.productCatalog || []).filter(p => p.id !== action.payload)
      };

    case 'DELETE_PRODUCTS':
      return {
        ...state,
        productCatalog: (state.productCatalog || []).filter(p => !action.payload.includes(p.id))
      };

    case 'TOGGLE_MODULE': {
      const moduleName = action.payload; // e.g. 'qc'
      const disabled = state.disabledModules || [];
      const updated = disabled.includes(moduleName)
        ? disabled.filter(m => m !== moduleName)
        : [...disabled, moduleName];
      return {
        ...state,
        disabledModules: updated
      };
    }

    case 'CREATE_DIRECT_ORDER': {
      const { order, payment, customer, auditLog } = action.payload;
      const existingCustomers = state.customers || [];
      const customerExists = existingCustomers.some(c => c.name.toLowerCase() === customer.name.toLowerCase());
      const updatedCustomers = customerExists 
        ? existingCustomers.map(c => c.name.toLowerCase() === customer.name.toLowerCase() 
            ? {
                ...c,
                totalOrders: (c.totalOrders || 0) + 1,
                outstanding: (c.outstanding || 0) + (payment.totalAmount || 0),
                ordersHistory: [...(c.ordersHistory || []), { orderNo: order.orderNo, product: order.products, val: payment.totalAmount }]
              }
            : c
          )
        : [...existingCustomers, customer];

      return {
        ...state,
        orders: [...(state.orders || []), order],
        directOrders: [...(state.directOrders || []), order],
        customers: updatedCustomers,
        payments: [...(state.payments || []), payment],
        auditLogs: [auditLog, ...(state.auditLogs || [])]
      };
    }

    case 'CREATE_DIRECT_QUOTE': {
      const { quotation, auditLog } = action.payload;
      return {
        ...state,
        quotations: [...(state.quotations || []), quotation],
        directQuotes: [...(state.directQuotes || []), quotation],
        auditLogs: [auditLog, ...(state.auditLogs || [])]
      };
    }

    case 'CONVERT_QUOTE_TO_ORDER': {
      const { quoteId, order, payment, customer, auditLog } = action.payload;
      const existingCustomers = state.customers || [];
      const customerExists = existingCustomers.some(c => c.name.toLowerCase() === customer.name.toLowerCase());
      const updatedCustomers = customerExists 
        ? existingCustomers.map(c => c.name.toLowerCase() === customer.name.toLowerCase() 
            ? {
                ...c,
                totalOrders: (c.totalOrders || 0) + 1,
                outstanding: (c.outstanding || 0) + (payment.totalAmount || 0),
                ordersHistory: [...(c.ordersHistory || []), { orderNo: order.orderNo, product: order.products, val: payment.totalAmount }]
              }
            : c
          )
        : [...existingCustomers, customer];

      return {
        ...state,
        quotations: (state.quotations || []).map(q => q.id === quoteId ? { ...q, status: 'Converted', convertedOrderNo: order.orderNo } : q),
        directQuotes: (state.directQuotes || []).map(q => q.id === quoteId ? { ...q, status: 'Converted', convertedOrderNo: order.orderNo } : q),
        orders: [...(state.orders || []), order],
        directOrders: [...(state.directOrders || []), order],
        customers: updatedCustomers,
        payments: [...(state.payments || []), payment],
        auditLogs: [auditLog, ...(state.auditLogs || [])]
      };
    }

    default:
      return state;
  }
};
