export const financeReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_DISPATCH': {
      const { dispatchRecord } = action.payload;
      
      const updatedOrders = state.orders.map(o => {
        const item = dispatchRecord.dispatchItems?.find(di => di.orderNo === o.orderNo);
        if (item) {
          const qty = Number(item.qty);
          const completed = (o.dispatch?.completed || 0) + qty;
          const total = o.dispatch?.total || o.quantity;
          const remaining = Math.max(0, total - completed);
          
          return {
            ...o,
            totalQty: total,
            dispatchedQty: completed,
            remainingQty: remaining,
            dispatch: {
              ...o.dispatch,
              completed,
              remaining
            },
            dispatchStatus: 'Dispatch Created',
            status: 'Dispatch Created',
            overallStage: 'Dispatch Created',
            currentDepartment: 'Dispatch'
          };
        }
        return o;
      });

      return {
        ...state,
        dispatches: [dispatchRecord, ...state.dispatches],
        orders: updatedOrders
      };
    }

    case 'DEPART_VEHICLE': {
      const { dispatchId } = action.payload;
      const targetDispatch = state.dispatches.find(d => d.id === dispatchId);
      
      const updatedDispatches = state.dispatches.map(d => 
        d.id === dispatchId ? { ...d, status: 'In Transit' } : d
      );

      const updatedOrders = state.orders.map(o => {
        const isTarget = targetDispatch?.dispatchItems?.some(di => di.orderNo === o.orderNo);
        if (isTarget) {
          return {
            ...o,
            status: 'In Transit',
            overallStage: 'In Transit',
            dispatchStatus: 'In Transit'
          };
        }
        return o;
      });

      return {
        ...state,
        dispatches: updatedDispatches,
        orders: updatedOrders
      };
    }

    case 'DELIVER_DISPATCH': {
      const { dispatchId, proofImage } = action.payload;
      
      const updatedDispatches = state.dispatches.map(d => 
        d.id === dispatchId ? { ...d, status: 'Delivered', proofImage } : d
      );

      const targetDispatch = state.dispatches.find(d => d.id === dispatchId);
      if (!targetDispatch) {
        return {
          ...state,
          dispatches: updatedDispatches
        };
      }

      const updatedOrders = state.orders.map(o => {
        const item = targetDispatch.dispatchItems?.find(di => di.orderNo === o.orderNo);
        if (item) {
          // Calculate cumulative delivered
          const previousDelivered = updatedDispatches
            .filter(d => d.status === 'Delivered' && d.id !== dispatchId)
            .flatMap(d => d.dispatchItems || [])
            .filter(di => di.orderNo === o.orderNo)
            .reduce((sum, di) => sum + Number(di.qty), 0);

          const cumulativeDelivered = previousDelivered + Number(item.qty);
          const isFull = cumulativeDelivered >= o.quantity;
          const nextStatus = isFull ? 'Payment Pending' : 'Partially Delivered';

          return {
            ...o,
            status: nextStatus,
            overallStage: nextStatus,
            dispatchStatus: isFull ? 'Delivered' : 'Partially Delivered',
            currentDepartment: isFull ? 'Finance' : 'Dispatch'
          };
        }
        return o;
      });

      return {
        ...state,
        dispatches: updatedDispatches,
        orders: updatedOrders
      };
    }

    case 'RECEIVE_PAYMENT': {
      const { paymentUpdate, orderNo } = action.payload;
      
      const updatedPayments = state.payments.map(p => 
        p.id === paymentUpdate.id ? { ...p, ...paymentUpdate } : p
      );

      const updatedOrders = state.orders.map(o => {
        if (o.orderNo === orderNo) {
          return {
            ...o,
            status: 'Payment Pending',
            overallStage: 'Payment Pending',
            currentDepartment: 'Finance'
          };
        }
        return o;
      });

      return {
        ...state,
        payments: updatedPayments,
        orders: updatedOrders
      };
    }

    case 'VERIFY_PAYMENT': {
      const { paymentId, amountVerified } = action.payload;
      
      const invoice = state.payments.find(p => p.id === paymentId);
      if (!invoice) return state;

      const orderNo = invoice.orderNo;
      
      const updatedPayments = state.payments.map(p => {
        if (p.id === paymentId) {
          const newPaid = Math.min(p.paidAmount + amountVerified, p.totalAmount);
          const isPaid = newPaid >= p.totalAmount;
          return {
            ...p,
            paidAmount: newPaid,
            status: isPaid ? 'Paid' : p.status,
            verified: 'Approved'
          };
        }
        return p;
      });

      const updatedCustomers = state.customers.map(c => {
        if (c.name.toLowerCase() === invoice.customerName.toLowerCase()) {
          const newOutstanding = Math.max(0, c.outstanding - amountVerified);
          const newRevenue = c.totalRevenue + amountVerified;
          return {
            ...c,
            outstanding: newOutstanding,
            totalRevenue: newRevenue,
            communicationLogs: [
              ...(c.communicationLogs || []),
              {
                date: new Date().toISOString().split('T')[0],
                type: 'Payment',
                summary: `Payment of ₹${amountVerified.toLocaleString('en-IN')} verified for invoice #${invoice.invoiceNo}`
              }
            ]
          };
        }
        return c;
      });

      const updatedOrders = state.orders.map(o => {
        if (o.orderNo === orderNo) {
          const newPaid = Math.min((o.payment?.paid || 0) + amountVerified, o.payment?.totalAmount || o.totalValue);
          const outstanding = Math.max(0, (o.payment?.totalAmount || o.totalValue) - newPaid);
          const isPaidInFull = newPaid >= (o.payment?.totalAmount || o.totalValue);
          
          return {
            ...o,
            payment: {
              ...o.payment,
              paid: newPaid,
              outstanding
            },
            financeStatus: isPaidInFull ? 'Paid' : 'Partial',
            status: 'Payment Verified',
            overallStage: 'Payment Verified',
            currentDepartment: (isPaidInFull && o.dispatchStatus === 'Delivered') ? 'None' : 'Finance'
          };
        }
        return o;
      });

      return {
        ...state,
        payments: updatedPayments,
        customers: updatedCustomers,
        orders: updatedOrders
      };
    }

    case 'RECORD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses]
      };

    default:
      return state;
  }
};
