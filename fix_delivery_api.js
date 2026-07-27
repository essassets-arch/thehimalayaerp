const fs = require('fs');
const filePathDelivery = 'd:/prototype-next/app/(dashboard)/dispatch/delivery/page.tsx';
let contentDelivery = fs.readFileSync(filePathDelivery, 'utf-8');

// Replace markDelivered API call with localStorage in delivery/page.tsx
const oldDeliverApi = `                const ok = await markDelivered(orderId, deliveryData);
                if (ok) {
                    // O2P: advance to delivery + auto-invoice step
                    o2p.setActiveOrder(String(orderId));
                    o2p.confirmDelivery({ orderId: String(orderId), actor: 'Dispatch' });
                    Swal.fire({
                        icon: 'success',
                        title: 'Delivery Completed!',
                        text: \`Consignment \${dispatchId} marked as Delivered.\`,
                        timer: 1800,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Action Failed', text: 'Could not record delivery confirmation.' });
                }`;

const newDeliverApi = `                // Update localStorage
                const activeTransit = JSON.parse(localStorage.getItem('erp_active_transit') || '[]');
                const index = activeTransit.findIndex((d: any) => d.id === dispatchId || d.dispatchOrderId === dispatchId);
                
                if (index !== -1) {
                    const deliveredItem = { ...activeTransit[index], ...deliveryData, status: 'DELIVERED' };
                    activeTransit.splice(index, 1);
                    localStorage.setItem('erp_active_transit', JSON.stringify(activeTransit));
                    
                    const deliveredOrders = JSON.parse(localStorage.getItem('erp_delivered_orders') || '[]');
                    deliveredOrders.push(deliveredItem);
                    localStorage.setItem('erp_delivered_orders', JSON.stringify(deliveredOrders));
                    
                    setLocalActive(activeTransit);
                }

                // O2P: advance to delivery + auto-invoice step
                o2p.setActiveOrder(String(orderId));
                o2p.confirmDelivery({ orderId: String(orderId), actor: 'Dispatch' });
                Swal.fire({
                    icon: 'success',
                    title: 'Delivery Completed!',
                    text: \`Consignment \${dispatchId} marked as Delivered.\`,
                    timer: 1800,
                    showConfirmButton: false
                });`;

contentDelivery = contentDelivery.replace(oldDeliverApi, newDeliverApi);

// Add local state for active transit
const stateInitOld = `    const o2p = useO2PWorkflow();

    // Match exact filtering logic from target renderDelivery()
    const activeTransit = (state.dispatches || []).filter((d: any) => 
        ['OUT_FOR_DELIVERY', 'Out for Delivery', 'In Transit', 'in transit', 'in_transit'].includes(String(d.status || d.dispatchStatus).trim())
    );`;

const stateInitNew = `    const o2p = useO2PWorkflow();
    const [localActive, setLocalActive] = useState<any[]>([]);
    
    React.useEffect(() => {
        setLocalActive(JSON.parse(localStorage.getItem('erp_active_transit') || '[]'));
    }, []);

    // Merge dummy data from context with our new localStorage prototype records
    const dummyTransit = (state.dispatches || []).filter((d: any) => 
        ['OUT_FOR_DELIVERY', 'Out for Delivery', 'In Transit', 'in transit', 'in_transit'].includes(String(d.status || d.dispatchStatus).trim())
    );
    const activeTransit = [...localActive, ...dummyTransit];`;

contentDelivery = contentDelivery.replace(stateInitOld, stateInitNew);
fs.writeFileSync(filePathDelivery, contentDelivery, 'utf-8');

// Do the same for in-transit/page.tsx
const filePathTransit = 'd:/prototype-next/app/(dashboard)/dispatch/in-transit/page.tsx';
let contentTransit = fs.readFileSync(filePathTransit, 'utf-8');

const oldTransitApi = `                const ok = await markInTransit(recordId);
                if (ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Vehicle Departed!',
                        text: \`Consignment \${recordId} marked as Out for Delivery.\`,
                        timer: 1800,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Action Failed', text: 'Could not record departure.' });
                }`;

const newTransitApi = `                // Update localStorage
                const activeTransit = JSON.parse(localStorage.getItem('erp_active_transit') || '[]');
                const index = activeTransit.findIndex((d: any) => d.id === recordId || d.dispatchOrderId === recordId);
                
                if (index !== -1) {
                    activeTransit[index].status = 'OUT_FOR_DELIVERY';
                    localStorage.setItem('erp_active_transit', JSON.stringify(activeTransit));
                    setLocalActive(activeTransit);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Vehicle Departed!',
                    text: \`Consignment \${recordId} marked as Out for Delivery.\`,
                    timer: 1800,
                    showConfirmButton: false
                });`;

contentTransit = contentTransit.replace(oldTransitApi, newTransitApi);

const stateInitTransitOld = `    const router = useRouter();

    // Match exact filtering logic from target renderInTransit()
    const activeDispatches = (state.dispatches || []).filter((d: any) => 
        ['IN_TRANSIT', 'In Transit', 'Dispatch Created', 'Planned', 'created', 'dispatch created'].includes(String(d.status || d.dispatchStatus).trim())
    );`;

const stateInitTransitNew = `    const router = useRouter();
    const [localActive, setLocalActive] = useState<any[]>([]);
    
    React.useEffect(() => {
        setLocalActive(JSON.parse(localStorage.getItem('erp_active_transit') || '[]'));
    }, []);

    // Match exact filtering logic from target renderInTransit()
    const dummyDispatches = (state.dispatches || []).filter((d: any) => 
        ['IN_TRANSIT', 'In Transit', 'Dispatch Created', 'Planned', 'created', 'dispatch created'].includes(String(d.status || d.dispatchStatus).trim())
    );
    const activeDispatches = [...localActive.filter((d: any) => d.status !== 'OUT_FOR_DELIVERY'), ...dummyDispatches];`;

contentTransit = contentTransit.replace(stateInitTransitOld, stateInitTransitNew);
fs.writeFileSync(filePathTransit, contentTransit, 'utf-8');

console.log('Fixed in-transit and delivery API logic');
