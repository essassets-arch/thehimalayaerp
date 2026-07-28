export const orderReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_LEAD':
      return {
        ...state,
        leads: [...state.leads, action.payload]
      };
      
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(l => l.id === action.payload.id ? { ...l, ...action.payload } : l)
      };

    case 'DELETE_LEAD':
      return {
        ...state,
        leads: state.leads.filter(l => l.id !== action.payload.id)
      };

    case 'ADD_SAMPLE':
      return {
        ...state,
        samples: [...state.samples, action.payload]
      };

    case 'UPDATE_SAMPLE':
      return {
        ...state,
        samples: state.samples.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s)
      };

    case 'ADD_QUOTATION':
      return {
        ...state,
        quotations: [...state.quotations, action.payload]
      };

    case 'UPDATE_QUOTATION':
      return {
        ...state,
        quotations: state.quotations.map(q => q.id === action.payload.id ? { ...q, ...action.payload } : q)
      };

    case 'CONFIRM_ORDER': {
      const { order, payment, customer } = action.payload;
      
      // Update or add customer
      const customerExists = state.customers.some(c => c.name.toLowerCase() === customer.name.toLowerCase());
      const updatedCustomers = customerExists 
        ? state.customers.map(c => c.name.toLowerCase() === customer.name.toLowerCase() 
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                outstanding: c.outstanding + order.payment.totalAmount,
                ordersHistory: [...(c.ordersHistory || []), { orderNo: order.orderNo, product: order.products, val: order.payment.totalAmount }]
              }
            : c
          )
        : [...state.customers, customer];

      return {
        ...state,
        orders: [...state.orders, order],
        payments: [...state.payments, payment],
        customers: updatedCustomers
      };
    }

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o.orderNo === action.payload.orderNo ? { ...o, ...action.payload } : o)
      };

    case 'PLAN_ORDER': {
      const { orderNo, targetDate, priority } = action.payload;
      return {
        ...state,
        orders: state.orders.map(o => o.orderNo === orderNo 
          ? { 
              ...o, 
              status: 'Planned', 
              overallStage: 'Planned', 
              deliveryDate: targetDate, 
              priority 
            } 
          : o
        )
      };
    }

    case 'CREATE_WORK_ORDER': {
      const exists = (state.workOrders || []).some(wo => wo.id === action.payload.id);
      return {
        ...state,
        workOrders: exists
          ? (state.workOrders || []).map(wo => wo.id === action.payload.id ? action.payload : wo)
          : [...(state.workOrders || []), action.payload]
      };
    }

    case 'UPDATE_WORK_ORDER':
      return {
        ...state,
        workOrders: (state.workOrders || []).map(wo => wo.id === action.payload.id ? { ...wo, ...action.payload } : wo)
      };

    case 'SEND_TO_REPRODUCTION':
      return {
        ...state,
        reproductions: [...(state.reproductions || []), action.payload.reproduction],
        workOrders: (state.workOrders || []).map(wo => wo.id === action.payload.workOrderId ? { ...wo, status: 'Rework Queue', progress: 0, stage: 'Awaiting Re-conversion', qcHistory: action.payload.qcHistory } : wo),
        orders: (state.orders || []).map(o => o.orderNo === action.payload.orderNo ? { ...o, status: 'Planned', overallStage: 'Planned', productionStatus: 'Reworking', isReproduction: true } : o)
      };

    case 'REJECT_FAILED_WORK_ORDER':
      return {
        ...state,
        workOrders: (state.workOrders || []).map(wo => wo.id === action.payload.workOrderId ? { ...wo, status: 'Rejected', stage: 'Rejected', qcHistory: action.payload.qcHistory } : wo),
        orders: (state.orders || []).map(o => o.orderNo === action.payload.orderNo ? { ...o, status: 'Cancelled', overallStage: 'Cancelled', productionStatus: 'Cancelled' } : o)
      };

    case 'UPDATE_REPRODUCTION':
      return {
        ...state,
        reproductions: (state.reproductions || []).map(rep => rep.id === action.payload.id ? { ...rep, ...action.payload } : rep)
      };

    default:
      return state;
  }
};
