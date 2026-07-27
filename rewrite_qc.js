const fs = require('fs');
const path = 'd:/prototype-next/modules/qc/pages/QCPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

const importHookTarget = "const inspectGoodsReceipt = useERPStore(s => s.inspectGoodsReceipt);";
const importHookReplace = `  const approveGoodsReceipt = useERPStore(s => s.approveGoodsReceipt);
  const rejectGoodsReceipt = useERPStore(s => s.rejectGoodsReceipt);`;

const callTarget = `      }).then(res => {
        if (res.isConfirmed) {
          inspectGoodsReceipt(grn.id, true, res.value.remarks);
          showToast('GRN Approved successfully.');
        } else if (res.isDenied) {
          inspectGoodsReceipt(grn.id, false, res.value.remarks);
          showToast('GRN Rejected.');
        }
      });`;

const callReplace = `      }).then(res => {
        if (res.isConfirmed) {
          approveGoodsReceipt(grn.id, res.value.remarks);
          showToast('GRN Approved successfully.');
        } else if (res.isDenied) {
          rejectGoodsReceipt(grn.id, res.value.remarks);
          showToast('GRN Rejected.');
        }
      });`;

if (content.includes(importHookTarget)) {
  content = content.replace(importHookTarget, importHookReplace);
}

if (content.includes(callTarget)) {
  content = content.replace(callTarget, callReplace);
}

fs.writeFileSync(path, content);
console.log('QCPortal updated!');
