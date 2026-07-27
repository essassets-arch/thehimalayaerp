const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldBlock = `        }).then(async (result) => {
            if (result.isConfirmed) {
                let allSuccess = true;

                // Process dispatch record for each selected order
                for (const alloc of allocations) {
                    const orderId = alloc.order.id;
                    const dispatchData = {
                        vehicleNumber: vehicleNo,
                        driverName: driverName,
                        driverPhone: '9876543210',
                        transporterName: 'Himalaya Own Fleet',
                        transportCost: Number(transportCost || 0) / allocations.length, // Split cost
                        dispatchDate: new Date().toISOString().split('T')[0],
                        expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                        gatePassNumber: \`GP-\${new Date().getFullYear()}-\${Math.floor(100 + Math.random() * 900)}\`,
                        deliveryChallanNumber: \`DC-\${new Date().getFullYear()}-\${Math.floor(100 + Math.random() * 900)}\`,
                        invoiceNumber: \`INV-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`,
                        remarks: 'Scheduled from Fulfillment Booking',
                        quantity: \`\${alloc.qty} Tons\`,
                        totalWeight: \`\${alloc.qty} Tons\`,
                        outstandingDispatch: \`\${parseFloat(alloc.order.outstandingDispatch || alloc.order.quantity || '0') - alloc.qty} Tons\`,
                    };

                    const ok = await createDispatch(orderId, dispatchData);
                    if (!ok) allSuccess = false;
                }

                if (allSuccess) {`;

const newBlock = `        }).then((result) => {
            if (result.isConfirmed) {
                // Process dispatch record for each selected order using localStorage
                const activeTransit = JSON.parse(localStorage.getItem('erp_active_transit') || '[]');
                const currentDispatchOrders = JSON.parse(localStorage.getItem('erp_dispatch_orders') || '[]');
                const updatedDispatchOrders = [...currentDispatchOrders];

                for (const alloc of allocations) {
                    const orderId = alloc.order.id;
                    const dispatchData = {
                        id: \`TRANSIT-\${Date.now()}-\${Math.floor(Math.random()*1000)}\`,
                        dispatchOrderId: orderId,
                        orderId: alloc.order.orderId || alloc.order.id,
                        workOrderNo: alloc.order.workOrderNo || alloc.order.orderNo,
                        productName: alloc.order.productName || alloc.order.product,
                        customerName: alloc.order.customerName,
                        vehicleNumber: vehicleNo,
                        driverName: driverName,
                        driverPhone: '9876543210',
                        transporterName: 'Himalaya Own Fleet',
                        transportCost: Number(transportCost || 0) / allocations.length,
                        dispatchDate: new Date().toISOString().split('T')[0],
                        expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                        gatePassNumber: \`GP-\${new Date().getFullYear()}-\${Math.floor(100 + Math.random() * 900)}\`,
                        deliveryChallanNumber: \`DC-\${new Date().getFullYear()}-\${Math.floor(100 + Math.random() * 900)}\`,
                        invoiceNumber: \`INV-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`,
                        remarks: 'Scheduled from Fulfillment Booking',
                        quantity: alloc.qty,
                        totalWeight: alloc.qty,
                        status: 'IN_TRANSIT',
                        createdAt: new Date().toISOString()
                    };

                    activeTransit.unshift(dispatchData);

                    // Reduce dispatch quantity in dispatchOrders
                    const orderIndex = updatedDispatchOrders.findIndex((o: any) => o.id === orderId);
                    if (orderIndex !== -1) {
                        const newRemaining = Number(updatedDispatchOrders[orderIndex].dispatchQuantity) - Number(alloc.qty);
                        if (newRemaining <= 0) {
                            updatedDispatchOrders.splice(orderIndex, 1);
                        } else {
                            updatedDispatchOrders[orderIndex].dispatchQuantity = newRemaining;
                        }
                    }
                }

                localStorage.setItem('erp_active_transit', JSON.stringify(activeTransit));
                localStorage.setItem('erp_dispatch_orders', JSON.stringify(updatedDispatchOrders));

                if (true) {`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Replaced backend API call with localStorage');
