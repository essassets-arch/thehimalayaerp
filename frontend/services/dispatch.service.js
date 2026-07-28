import { apiClient } from '../lib/apiClient';

export const dispatchService = {
  createDispatch: async (state, dispatchData, dispatch, currentUser) => {
    // Group dispatch items by order to accommodate single-order-per-dispatch DB constraint
    const ordersMap = {};
    for (const item of (dispatchData.dispatchItems || [])) {
      const orderNo = item.orderNo || item.orderId;
      if (!ordersMap[orderNo]) {
        ordersMap[orderNo] = [];
      }
      ordersMap[orderNo].push(item);
    }

    const orderNumbers = Object.keys(ordersMap);
    let lastResult = null;

    for (const orderNo of orderNumbers) {
      const order = state.orders.find(o => o.orderNo === orderNo);
      const orderId = order?.id || parseInt(orderNo.replace('ORD-', '')) || 1;

      const payload = {
        order_id: orderId,
        vehicle_number: dispatchData.vehicleNo,
        driver_name: dispatchData.driverName,
        driver_mobile: dispatchData.driverMobile || '9988776655',
        transporter: dispatchData.transporter || 'Himalaya Own Fleet',
        lr_number: dispatchData.lrNumber || `LR-${Math.floor(100000 + Math.random() * 900000)}`,
        eway_bill_number: dispatchData.ewayBill || `EWB-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        dispatch_date: dispatchData.dispatchDate || new Date().toISOString().split('T')[0],
        expected_delivery_date: dispatchData.expectedDeliveryDate || null,
        items: (() => {
          let remainingDispatchQty = Number(ordersMap[orderNo].reduce((sum, item) => sum + Number(item.qty), 0));
          const resultItems = [];
          
          if (order && Array.isArray(order.detailedItems)) {
            for (const item of order.detailedItems) {
              const ordered = Number(item.quantity_ordered || item.quantity || 0);
              const dispatched = Number(item.quantity_dispatched || item.delivered_qty || 0);
              const itemRemaining = Math.max(0, ordered - dispatched);
              
              if (itemRemaining > 0 && remainingDispatchQty > 0) {
                const allocate = Math.min(remainingDispatchQty, itemRemaining);
                resultItems.push({
                  product_id: item.productId || item.product_catalog_id || 1,
                  quantity: Number(allocate.toFixed(4))
                });
                remainingDispatchQty -= allocate;
              }
            }
          }
          
          // Fallback if there is still remaining quantity or no detailed items
          if (remainingDispatchQty > 0 || resultItems.length === 0) {
            const firstProduct = order?.detailedItems?.[0];
            const pId = firstProduct?.productId || firstProduct?.product_catalog_id || 1;
            
            // If the product is already in the list, just add to its quantity
            const existing = resultItems.find(r => r.product_id === pId);
            if (existing) {
              existing.quantity = Number((existing.quantity + remainingDispatchQty).toFixed(4));
            } else {
              resultItems.push({
                product_id: pId,
                quantity: Number(remainingDispatchQty.toFixed(4))
              });
            }
          }
          
          return resultItems;
        })()
      };

      // 1. Create dispatch entity
      lastResult = await apiClient.post('/dispatch', payload);

      // 2. Trigger state-machine transition
      await apiClient.post('/workflow/transition', {
        entity: 'sales_order',
        entityId: orderId,
        transitionName: 'CREATE_DISPATCH',
        payload: {
          dispatchId: lastResult?.id || lastResult?.dispatchId,
          vehicle_number: dispatchData.vehicleNo,
          eway_bill_number: payload.eway_bill_number
        },
        notes: `Dispatch created for Order ${orderNo}. Vehicle No: ${dispatchData.vehicleNo}`
      });
    }

    return { success: true, data: lastResult };
  },

  departVehicle: async (state, dispatchId, dispatch, currentUser) => {
    const dispatchRecord = state.dispatches.find(d => d.dispatch_number === dispatchId || d.id === dispatchId);
    const dbId = dispatchRecord?.dbId || dispatchRecord?.id || dispatchId;
 
    const res = await apiClient.patch(`/dispatch/${dbId}/start-delivery`);
    return { success: true, data: res };
  },
 
  deliverDispatch: async (state, dispatchId, proofFileName, dispatch, currentUser) => {
    const dispatchRecord = state.dispatches.find(d => d.dispatch_number === dispatchId || d.id === dispatchId);
    const dbId = dispatchRecord?.dbId || dispatchRecord?.id || dispatchId;
    const orderId = dispatchRecord?.orderId || dispatchRecord?.order_id;

    // 1. Update the dispatch record status to Delivered
    const res = await apiClient.patch(`/dispatch/${dbId}/status`, {
      status: 'DELIVERED',
      proof_of_delivery_url: proofFileName || ''
    });

    // 2. Trigger the state-machine transition on the Sales Order
    if (orderId) {
      await apiClient.post('/workflow/transition', {
        entity: 'sales_order',
        entityId: orderId,
        transitionName: 'CONFIRM_DELIVERY',
        payload: {
          proof_of_delivery_url: proofFileName || '',
          receiver_name: currentUser?.name || 'Customer Agent'
        },
        notes: `Delivery confirmed. Proof of delivery uploaded: ${proofFileName || 'None'}`
      });
    }

    return { success: true, data: res };
  }
};
