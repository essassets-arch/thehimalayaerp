const fs = require('fs');
const file = 'D:/prototype-next-main/frontend/modules/store/pages/StorePortal.jsx';
let content = fs.readFileSync(file, 'utf8');

const startWorkspace = '  const renderPOWorkspace = () => {';
const endWorkspace = '  const handleDownloadStorePOPdf = (po) => {';

const idx1 = content.indexOf(startWorkspace);
const idx2 = content.indexOf(endWorkspace);

if (idx1 === -1 || idx2 === -1) {
    console.log("Could not find boundaries for renderPOWorkspace!");
    process.exit(1);
}

const oldWorkspace = content.substring(idx1, idx2);

const newWorkspace = \  const renderPOWorkspace = () => {
    const currentTabId = activeTab || 'Create Request';

    return (
      <div style={{ minHeight: '80vh', padding: '24px', background: '#f8fafc', animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          minHeight: '600px'
        }}>
          {currentTabId === 'Create Request' && <CreateMaterialIndent />}
          {currentTabId === 'Verify Delivery' && <VerifyPODelivery />}
          {currentTabId === 'Delivery History' && renderPOListTab()}
          {currentTabId === 'GRN History' && <GoodsReceiptNote />}
          {currentTabId === 'Material Rejections' && <MaterialRejections />}
          {currentTabId === 'Replacement Deliveries' && <ReceiveReplacement />}
          {currentTabId === 'Indent History' && <IndentHistory />}
        </div>
      </div>
    );
  };

\;

content = content.replace(oldWorkspace, newWorkspace);

const startListTab = '  const renderPOListTab = () => {\\n    const allPOs';
const endListTab = '    const filterCounts = {';

const idx3 = content.indexOf(startListTab);
const idx4 = content.indexOf(endListTab);

if (idx3 === -1 || idx4 === -1) {
    console.log("Could not find boundaries for renderPOListTab!");
    process.exit(1);
}

const oldListTab = content.substring(idx3, idx4);

const newListTab = \  const renderPOListTab = () => {
    let allPOs = [...(state.purchaseIndents || []), ...(state.purchaseOrders || [])].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

    if (!allPOs || allPOs.length === 0) {
      allPOs = [
        {
          id: 'PO-2026-891', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'PARTIALLY_RECEIVED', notes: 'Urgent material required for Assembly Line 1',
          items: [{ material: 'Steel Sheets (RM-1605)', quantity: 500, receivedQuantity: 250 }]
        },
        {
          id: 'PO-2026-890', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: 'COMPLETED', notes: 'Routine restocking',
          items: [{ material: 'Aluminium Alloy Ingots', quantity: 200, receivedQuantity: 200 }, { material: 'Industrial Lubricant', quantity: 50, receivedQuantity: 50 }]
        },
        {
          id: 'PO-2026-889', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          status: 'SENT_TO_STORE', notes: 'Pending verification from logistics',
          items: [{ material: 'Copper Wire Roles 5mm', quantity: 150, receivedQuantity: 0 }]
        },
        {
          id: 'PO-2026-888', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          status: 'REJECTED', notes: 'Quality inspection failed at dock',
          items: [{ material: 'Titanium Fasteners M8', quantity: 1000, receivedQuantity: 0 }]
        }
      ];
    }

    const completedStatuses = ['COMPLETED', 'GRN_RECEIVED', 'FULLY_RECEIVED', 'CLOSED', 'CONVERTED_TO_PO', 'PO_CLOSED', 'STOCK_POSTED', 'PAYMENT_COMPLETED'];
    const pendingStatuses = ['REQUESTED', 'PO_CREATED', 'SENT_TO_STORE', 'PARTIALLY_RECEIVED', 'AWAITING_FINANCE_CONFIRMATION', 'REJECTED', 'DRAFT', 'PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'PO_ORDERED', 'GRN_SUBMITTED', 'GRN_APPROVED'];

    const filteredPOs = poListFilter === 'All'
      ? allPOs
      : poListFilter === 'Completed'
        ? allPOs.filter(po => completedStatuses.includes(po.status))
        : allPOs.filter(po => pendingStatuses.includes(po.status) || !completedStatuses.includes(po.status));

\;

content = content.replace(oldListTab, newListTab);

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully replaced both chunks via Node.");
