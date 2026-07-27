const fs = require('fs');
const path = require('path');

const salesDir = path.join(__dirname, 'app/(dashboard)/sales');
const mkdir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };

const routes = {
  'dashboard': {
    imports: "import DashboardView from '@/components/DashboardView';\nimport { useERP } from '@/shared/context/ERPContext';\nimport { useRouter } from 'next/navigation';\nimport { useNotificationStore } from '@/store/notificationStore';",
    body: `
  const { state, dispatch } = useERP();
  const navigate = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const handleActionClick = (actionName, message) => showToast(message);
  return <DashboardView state={state} dispatch={dispatch} navigate={navigate} onQuickAction={handleActionClick} />;
`
  },
  'leads': {
    imports: "import LeadsView from '@/components/LeadsView';\nimport { useERP } from '@/shared/context/ERPContext';\nimport { useLeads } from '@/modules/sales/hooks/useLeads';\nimport { useReminders } from '@/modules/sales/hooks/useReminders';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useSearchStore } from '@/store/searchStore';\nimport { useRouter } from 'next/navigation';",
    body: `
  const { state } = useERP();
  const router = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const { leads, convertToSample, generateQuotationFromLead, updateLeadStatus, updateLead, addFollowup, deleteLead } = useLeads(showToast);
  const { reminders, createReminder, updateReminder, completeReminder } = useReminders(showToast);

  return (
    <LeadsView
      leads={leads}
      reminders={reminders}
      samples={state.samples || []}
      quotations={state.quotations || []}
      orders={state.orders || []}
      onAddLeadClick={() => router.push('/sales/leads/create')}
      onEditLeadClick={(id) => router.push(\`/sales/leads/\${id}/edit\`)}
      onConvertToSample={convertToSample}
      onGenerateQuotation={generateQuotationFromLead}
      onUpdateStatus={updateLeadStatus}
      onUpdateLead={updateLead}
      onAddFollowup={addFollowup}
      onDeleteLead={deleteLead}
      onSaveReminder={createReminder}
      onUpdateReminder={updateReminder}
      onCompleteReminder={completeReminder}
      searchQuery={globalSearch}
    />
  );
`
  },
  'leads/create': {
    imports: "import CreateLead from '@/components/CreateLead';\nimport { useLeads } from '@/modules/sales/hooks/useLeads';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useRouter } from 'next/navigation';",
    body: `
  const router = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const { leads, addLead, generateQuotationFromLead, deleteLead } = useLeads(showToast);
  
  return (
    <CreateLead
      key="new"
      leads={leads}
      onAddLead={addLead}
      onGenerateQuotation={generateQuotationFromLead}
      onDeleteLead={deleteLead}
      onCancel={() => router.push('/sales/leads')}
      editingLead={null}
    />
  );
`
  },
  'leads/[id]/edit': {
    imports: "import CreateLead from '@/components/CreateLead';\nimport { useLeads } from '@/modules/sales/hooks/useLeads';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useRouter, useParams } from 'next/navigation';",
    body: `
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id;
  const showToast = useNotificationStore(s => s.showToast);
  const { leads, updateLead, deleteLead } = useLeads(showToast);
  
  const leadToEdit = leadId ? leads.find(l => String(l.id) === String(leadId)) : null;

  if (!leadToEdit && leads.length > 0) {
    return <div>Lead not found</div>;
  }

  return (
    <CreateLead
      key={\`edit-\${leadId}\`}
      leads={leads}
      onAddLead={(updatedData) => updateLead(leadToEdit.id, updatedData)}
      onDeleteLead={deleteLead}
      onCancel={() => router.push('/sales/leads')}
      editingLead={leadToEdit}
    />
  );
`
  },
  'quotations': {
    imports: "import QuotationsView from '@/components/QuotationsView';\nimport { useERP, useERPStore } from '@/shared/context/ERPContext';\nimport { useQuotations } from '@/modules/sales/hooks/useQuotations';\nimport { useLeads } from '@/modules/sales/hooks/useLeads';\nimport { useReminders } from '@/modules/sales/hooks/useReminders';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useSearchStore } from '@/store/searchStore';\nimport { useRouter } from 'next/navigation';\nimport { useState } from 'react';",
    body: `
  const { state } = useERP();
  const router = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const [prefillQuotationData, setPrefillQuotationData] = useState(null);
  
  const { quotations, updateQuotation, confirmOrder } = useQuotations(showToast);
  const { leads } = useLeads(showToast);
  const { reminders, createReminder, updateReminder, completeReminder } = useReminders(showToast);
  
  const customers = state.customers || [];
  
  const onConvertToOrder = async (qtn) => {
    showToast('Sales: Creating purchase order...');
    const res = await confirmOrder(qtn);
    if (res?.success) router.push('/sales/orders');
  };

  return (
    <QuotationsView
      quotations={quotations}
      leads={leads}
      customers={customers}
      reminders={reminders}
      onCreateQuoteClick={() => {
        useERPStore.getState().clearQuotationDraft();
        router.push('/sales/quotations/create');
      }}
      onCreateLead={() => router.push('/sales/leads/create')}
      onUpdateQuotationStatus={(qId, status) => updateQuotation(qId, { status })}
      onUpdateQuotation={(qId, data) => updateQuotation(qId, data)}
      onConvertToOrder={onConvertToOrder}
      onSendPDF={(qId) => showToast(\`PDF invoice sent for Quotation #\${qId}\`)}
      onSaveReminder={createReminder}
      onUpdateReminder={updateReminder}
      onCompleteReminder={completeReminder}
      prefillData={prefillQuotationData}
      clearPrefill={() => setPrefillQuotationData(null)}
      searchQuery={globalSearch}
    />
  );
`
  },
  'quotations/create': {
    imports: "import CreateQuotation from '@/components/CreateQuotation';\nimport { useERP } from '@/shared/context/ERPContext';\nimport { useQuotations } from '@/modules/sales/hooks/useQuotations';\nimport { useLeads } from '@/modules/sales/hooks/useLeads';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useRouter } from 'next/navigation';\nimport { useState } from 'react';",
    body: `
  const { state } = useERP();
  const router = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const [prefillQuotationData, setPrefillQuotationData] = useState(null);
  
  const { createQuotation } = useQuotations(showToast);
  const { leads, updateLead } = useLeads(showToast);
  const customers = state.customers || [];

  const onAddQuotation = async (qData) => {
    const res = await createQuotation(qData);
    if (res?.success) {
      const matchedLead = leads.find(
        (l) =>
          l.companyName?.toLowerCase() === qData.customerName?.trim().toLowerCase() ||
          l.projectName?.toLowerCase()  === qData.customerName?.trim().toLowerCase()
      );
      if (matchedLead) {
        updateLead(matchedLead.id, { status: 'Quotation' }).catch(() => {});
      }
      setPrefillQuotationData(null);
      router.push('/sales/quotations');
    }
  };

  return (
    <CreateQuotation
      key={prefillQuotationData?.id || 'new'}
      leads={leads}
      customers={customers}
      prefilledCustomer={prefillQuotationData?.leadName || ''}
      prefilledProduct={prefillQuotationData?.product || prefillQuotationData?.productName || ''}
      prefilledQuantity={prefillQuotationData?.quantity || 1}
      onAddQuotation={onAddQuotation}
      onCreateLead={() => router.push('/sales/leads/create')}
      onCancel={() => {
        setPrefillQuotationData(null);
        router.push('/sales/quotations');
      }}
    />
  );
`
  },
  'orders': {
    imports: "import OrdersView from '@/components/OrdersView';\nimport { useERP } from '@/shared/context/ERPContext';\nimport { useOrders } from '@/modules/sales/hooks/useOrders';\nimport { useLeads } from '@/modules/sales/hooks/useLeads';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useSearchStore } from '@/store/searchStore';\nimport { useRouter } from 'next/navigation';",
    body: `
  const { state, dispatch, syncData } = useERP();
  const router = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const setGlobalSearch = useSearchStore(s => s.setGlobalSearch);
  
  const { orders } = useOrders(showToast, 'orders');
  const { leads } = useLeads(showToast);
  const customers = state.customers || [];

  const onUpdateOrderStatus = async (id, status) => {
    const updatePayload = { orderNo: id, status };
    if (status === 'Created') {
      Object.assign(updatePayload, { overallStage: 'Created', currentDepartment: 'Plant Head', salesStatus: 'Confirmed', timeline: [{ stage: 'Created', timestamp: Date.now(), remarks: 'Purchase order confirmed by Sales' }] });
    } else if (status === 'Planned') {
      Object.assign(updatePayload, { overallStage: 'Planned', currentDepartment: 'Production' });
    }
    dispatch({ type: 'UPDATE_ORDER', payload: updatePayload });
    showToast(\`Order status updated to \${status}\`);
  };

  return (
    <OrdersView
      orders={orders}
      leads={leads}
      customers={customers}
      onUpdateOrderStatus={onUpdateOrderStatus}
      onUpdateOrder={(id, updatedData) => {
        dispatch({ type: 'UPDATE_ORDER', payload: { orderNo: id, ...updatedData } });
        showToast('Order details updated successfully.');
      }}
      onUpdateDispatchStatus={(id, status) => {
        dispatch({ type: 'UPDATE_ORDER', payload: { orderNo: id, dispatchStatus: status } });
        showToast(\`Logistics status set to \${status}\`);
      }}
      onAskReplacement={() => showToast('Replacement requested')}
      onAskReturn={() => showToast('Return requested')}
      searchQuery={globalSearch}
      setSearchQuery={setGlobalSearch}
    />
  );
`
  },
  'customers': {
    imports: "import CustomersView from '@/components/CustomersView';\nimport { useERP } from '@/shared/context/ERPContext';\nimport { useSearchStore } from '@/store/searchStore';",
    body: `
  const { state } = useERP();
  const globalSearch = useSearchStore(s => s.globalSearch);
  return <CustomersView customers={state.customers || []} searchQuery={globalSearch} />;
`
  },
  'samples': {
    imports: "import SamplesView from '@/components/SamplesView';\nimport { useSamples } from '@/modules/sales/hooks/useSamples';\nimport { useNotificationStore } from '@/store/notificationStore';\nimport { useRouter } from 'next/navigation';",
    body: `
  const router = useRouter();
  const showToast = useNotificationStore(s => s.showToast);
  const { samples, updateSampleStatus, updateSample, createReplacementSample } = useSamples(showToast);

  return (
    <SamplesView
      samples={samples}
      onUpdateSampleStatus={updateSampleStatus}
      onUpdateSample={updateSample}
      onMoveToQuotation={() => router.push('/sales/quotations/create')}
      onCreateReplacementSample={createReplacementSample}
    />
  );
`
  },
  'reports': {
    imports: "import ReportsView from '@/components/ReportsView';\nimport { useERP } from '@/shared/context/ERPContext';\nimport { useAuth } from '@/shared/context/AuthContext';",
    body: `
  const { state } = useERP();
  const { user } = useAuth();
  return <ReportsView leads={state.leads || []} orders={state.orders || []} payments={state.payments || []} customers={state.customers || []} user={user} />;
`
  }
};

for (const [route, config] of Object.entries(routes)) {
  const dirPath = path.join(salesDir, route);
  mkdir(dirPath);
  const fileContent = \`'use client';\n\n\${config.imports}\n\nexport default function \${route.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/\\[|\\]/g, '')).join('')}Page() {\${config.body}}\n\`;
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), fileContent, 'utf8');
  console.log(\`Created \${route}/page.tsx\`);
}
