const fs = require('fs');
let content = fs.readFileSync('modules/finance/pages/FinancePortal.jsx', 'utf8');

// The replacement logic:
content = content.replace(
  'placeOrderManually(selectedApprovedPO.id, payload);',
  `issuePurchaseOrder(selectedApprovedPO.id, null, user?.name || 'Finance Executive');
      acceptPurchaseOrderByVendor(selectedApprovedPO.id, payload, 'System');`
);

fs.writeFileSync('modules/finance/pages/FinancePortal.jsx', content);
console.log('FinancePortal updated!');
