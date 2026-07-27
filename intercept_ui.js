const fs = require('fs');

const STORE_PATH = 'shared/context/ERPContext.jsx';
let code = fs.readFileSync(STORE_PATH, 'utf8');

const oldUpdateOrder = `        case 'UPDATE_ORDER': {
          nextState.orders = (nextState.orders || []).map(o =>
            (o.id === payload.orderNo || o.orderNo === payload.orderNo || o.id === payload.id)
              ? { ...o, ...payload }
              : o
          );
          store.setState(nextState);
          const order = nextState.orders.find(o => o.id === payload.orderNo || o.orderNo === payload.orderNo || o.id === payload.id);
          if (order?.id) await apiClient.put(\`/orders/\${order.id}\`, order).catch(() => {});
          break;
        }`;

const newUpdateOrder = `        case 'UPDATE_ORDER': {
          // --- STRICT STATE MACHINE MAPPING ---
          const { 
            convertQuotationToOrder, 
            reviewIncomingOrder, 
            planProduction, 
            startProduction, 
            completeProductionBatch, 
            approveSalesQC, 
            createDispatchForOrder, 
            startDelivery, 
            confirmDelivery, 
            closeSalesOrder 
          } = store;

          const orderId = payload.orderNo || payload.id;
          
          try {
            if (payload.status === 'PLANT_PENDING') {
              convertQuotationToOrder(orderId, { customerName: 'Converted Order' }, 'Sales');
            } else if (payload.status === 'PLANT_ACCEPTED' || payload.workflowStatus === 'PLANT_ACCEPTED') {
              reviewIncomingOrder(orderId, 'ACCEPT', 'Accepted via Portal', 'Plant Head');
            } else if (payload.status === 'PRODUCTION_PLANNED' || payload.workflowStatus === 'PRODUCTION_PLANNED') {
              planProduction(orderId, { machine: payload.machineId || 'Main Assembly' }, 'Plant Head');
            } else if (payload.status === 'PRODUCTION_STARTED' || payload.workflowStatus === 'PRODUCTION_STARTED') {
              startProduction(orderId, 'Production');
            } else if (payload.status === 'PRODUCTION_COMPLETED' || payload.workflowStatus === 'PRODUCTION_COMPLETED') {
              completeProductionBatch(orderId, { producedQty: payload.producedQty || 1 }, 'Production');
            } else if (payload.status === 'QC_APPROVED' || payload.workflowStatus === 'QC_APPROVED') {
              approveSalesQC(orderId, { remarks: payload.remarks || 'Approved' }, 'QC');
            } else if (payload.status === 'ORDER_CLOSED') {
              closeSalesOrder(orderId, 'System');
            }
            
            if (payload.dispatchStatus === 'Ready') {
              createDispatchForOrder(orderId, { vehicleId: 'TRUCK' }, 'Dispatch');
            } else if (payload.dispatchStatus === 'In Transit') {
              // Hack to find dispatch ID based on order ID
              const dId = (store.state.dispatches || []).find(d => d.orderId === orderId)?.id;
              if (dId) startDelivery(dId, 'Dispatch');
            } else if (payload.dispatchStatus === 'Delivered') {
              const dId = (store.state.dispatches || []).find(d => d.orderId === orderId)?.id;
              if (dId) confirmDelivery(dId, { receivedBy: 'Customer' }, 'Dispatch');
            }
          } catch(err) {
            console.error("Strict mapping caught an invalid transition:", err.message);
          }
          // Fallback legacy merge for non-strict fields (like visual flags, etc.)
          nextState.orders = (store.getState().orders || []).map(o =>
            (o.id === payload.orderNo || o.orderNo === payload.orderNo || o.id === payload.id)
              ? { ...o, ...payload }
              : o
          );
          store.setState(nextState);
          const order = nextState.orders.find(o => o.id === payload.orderNo || o.orderNo === payload.orderNo || o.id === payload.id);
          if (order?.id) await apiClient.put(\`/orders/\${order.id}\`, order).catch(() => {});
          break;
        }`;

if (code.includes(oldUpdateOrder)) {
  code = code.replace(oldUpdateOrder, newUpdateOrder);
  fs.writeFileSync(STORE_PATH, code, 'utf8');
  console.log("Successfully intercepted UI actions in ERPContext.jsx!");
} else {
  console.log("Could not find oldUpdateOrder in ERPContext.jsx.");
}
