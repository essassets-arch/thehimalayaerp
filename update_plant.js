const fs = require('fs');
let content = fs.readFileSync('d:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx', 'utf8');

// 1. Add imports
content = content.replace("import { useERP } from '../../../shared/context/ERPContext';", "import { useERP } from '../../../shared/context/ERPContext';\nimport { useERPStore } from '@/store/erpStore';");

// 2. Add methods and state
content = content.replace("const [indentDetailModal, setIndentDetailModal] = useState(false);", `const [indentDetailModal, setIndentDetailModal] = useState(false);
  const purchaseIndents = useERPStore(s => s.state.purchaseIndents || []);
  const approvePurchaseIndent = useERPStore(s => s.approvePurchaseIndent);
  const rejectPurchaseIndent = useERPStore(s => s.rejectPurchaseIndent);`);

// 3. Update fetchMaterialIndents to use global state
const oldFetch = `const fetchMaterialIndents = async () => {
    setIndentsLoading(true);
    try {
      const res = await apiClient.get('/plant-head/material-indents');
      setMaterialIndents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch material indents', err);
      showToast?.('Failed to load material indents.');
    } finally {
      setIndentsLoading(false);
    }
  };`;

const newFetch = `const fetchMaterialIndents = async () => {
    setIndentsLoading(true);
    // Fetch from global state instead
    setMaterialIndents(purchaseIndents.filter(i => i.status === 'PENDING_PLANT_HEAD_APPROVAL'));
    setIndentsLoading(false);
  };`;
content = content.replace(oldFetch, newFetch);

// Update useEffect dependency
const oldEffect = `useEffect(() => {
    if (currentView === 'material-indents') fetchMaterialIndents();
  }, [currentView]);`;

const newEffect = `useEffect(() => {
    if (currentView === 'material-indents') fetchMaterialIndents();
  }, [currentView, purchaseIndents]);`;

content = content.replace(oldEffect, newEffect);

// 4. Update handleApproveIndent
const oldApproveSubmit = `try {
      await apiClient.patch(\`/plant-head/material-indents/\${indent.id}/approve\`, {
        items: value.approvedItems, remarks: value.remarks
      });
      showToast?.('Indent approved and sent to Finance.');
      fetchMaterialIndents();
    } catch (err) {
      showToast?.('Failed to approve indent.');
    }`;
const newApproveSubmit = `try {
      approvePurchaseIndent(indent.id, value.remarks);
      showToast?.('Indent approved and sent to Finance.');
    } catch (err) {
      showToast?.('Failed to approve indent.');
    }`;
content = content.replace(oldApproveSubmit, newApproveSubmit);

// 5. Update handleRejectIndent
const oldRejectSubmit = `try {
      await apiClient.patch(\`/plant-head/material-indents/\${indent.id}/reject\`, { remarks });
      showToast?.('Indent rejected.');
      fetchMaterialIndents();
    } catch (err) {
      showToast?.('Failed to reject indent.');
    }`;
const newRejectSubmit = `try {
      rejectPurchaseIndent(indent.id, remarks);
      showToast?.('Indent rejected.');
    } catch (err) {
      showToast?.('Failed to reject indent.');
    }`;
content = content.replace(oldRejectSubmit, newRejectSubmit);

fs.writeFileSync('d:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx', content);
console.log('Update successful!');
