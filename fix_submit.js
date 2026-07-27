const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace logic in handleDispatchSubmit
const oldLoopStart = `        for (const order of activeOrders) {
            const orderId = order.id;
            const remaining = parseFloat(order.outstandingDispatch || order.quantity || '1') || 1;`;

const newLoopStart = `        for (const order of activeOrders) {
            const orderId = String(order.workOrderNo || order.orderNo || order.id);
            const remaining = parseFloat(String(order.dispatchQuantity || order.qcApprovedQuantity || order.outstandingDispatch || order.quantity || '1')) || 1;`;

content = content.replace(oldLoopStart, newLoopStart);

// Also fix the text in Swal.fire (Tons -> Units/quantity)
content = content.replace(/Cannot dispatch \$\{qtyVal\} Tons/g, 'Cannot dispatch ${qtyVal} Units');
content = content.replace(/Remaining capacity is \$\{remaining\} Tons/g, 'Remaining capacity is ${remaining} Units');
content = content.replace(/dispatch of \$\{totalQtyToDispatch\} Tons/g, 'dispatch of ${totalQtyToDispatch} Units');
content = content.replace(/Tons successfully assigned/g, 'Units successfully assigned');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed submit validation logic');
