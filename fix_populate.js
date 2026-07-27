const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldUseEffect = `    // Pre-populate with orderIdParam if passed in the URL
    useEffect(() => {
        if (orderIdParam && !selectedOrderNos.includes(orderIdParam)) {
            setSelectedOrderNos(prev => prev.includes(orderIdParam) ? prev : [orderIdParam]);
            const targetOrder = (dispatchOrders || []).find((o: any) => String(o.workOrderNo || o.orderNo || o.id) === orderIdParam);
            const remaining = targetOrder ? (targetOrder.outstandingDispatch || targetOrder.quantity || '1 Tons') : '1 Tons';
            const remainingNumber = parseFloat(remaining) || 1;
            setDispatchQuantities(prev => ({
                ...prev,
                [orderIdParam]: String(remainingNumber)
            }));
        }
    }, [orderIdParam, dispatchOrders, selectedOrderNos]);`;

const newUseEffect = `    // Pre-populate with orderIdParam if passed in the URL
    useEffect(() => {
        if (orderIdParam && dispatchOrders.length > 0) {
            const targetOrder = dispatchOrders.find((o: any) => o.id === orderIdParam || o.workOrderNo === orderIdParam || o.orderNo === orderIdParam);
            if (targetOrder) {
                const actualOrderNo = String(targetOrder.workOrderNo || targetOrder.orderNo || targetOrder.id);
                if (!selectedOrderNos.includes(actualOrderNo)) {
                    setSelectedOrderNos(prev => [...prev, actualOrderNo]);
                    const remaining = targetOrder.dispatchQuantity || targetOrder.qcApprovedQuantity || targetOrder.outstandingDispatch || targetOrder.quantity || 1;
                    const remainingNumber = parseFloat(String(remaining)) || 1;
                    setDispatchQuantities(prev => ({
                        ...prev,
                        [actualOrderNo]: String(remainingNumber)
                    }));
                }
            }
        }
    }, [orderIdParam, dispatchOrders]);`;

content = content.replace(oldUseEffect, newUseEffect);

// Replace remaining definition in the .map() loop (around line 205)
// const remaining = o.outstandingDispatch || o.quantity || '0 Tons';
content = content.replace(
  /const remaining = o\.outstandingDispatch \|\| o\.quantity \|\| '0 Tons';/g,
  "const remainingVal = o.dispatchQuantity || o.qcApprovedQuantity || o.outstandingDispatch || o.quantity || 0;\n                                const remaining = typeof remainingVal === 'number' ? `${remainingVal} Units` : remainingVal;"
);

// Also replace the tons formatting in the JSX: {remaining} -> it's already a string now, so we don't need to change it, it's just {orderNo} ({remaining})

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed populate and remaining logic');
