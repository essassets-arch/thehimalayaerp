const fs = require('fs');
const path = 'd:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

const approveTarget = `    try {
      await apiClient.patch(\`/plant-head/material-indents/\${indent.id}/approve\`, {
        items: value.approvedItems, remarks: value.remarks
      });
      showToast?.('Indent approved and sent to Finance.');
      fetchMaterialIndents();
    } catch (err) {
      showToast?.('Failed to approve indent.');
    }`;

const rejectTarget = `    try {
      await apiClient.patch(\`/plant-head/material-indents/\${indent.id}/reject\`, { remarks });
      showToast?.('Indent rejected.');
      fetchMaterialIndents();
    } catch (err) {
      showToast?.('Failed to reject indent.');
    }`;

const approveReplace = `    approvePurchaseIndent(indent.id, value.remarks || 'Approved by Plant Head');
    showToast?.('Indent approved and sent to Finance.');`;

const rejectReplace = `    rejectPurchaseIndent(indent.id, remarks);
    showToast?.('Indent rejected.');`;

if (content.includes(approveTarget)) {
  content = content.replace(approveTarget, approveReplace);
}
if (content.includes(rejectTarget)) {
  content = content.replace(rejectTarget, rejectReplace);
}

fs.writeFileSync(path, content);
console.log('PlantHeadPortal handlers updated');
