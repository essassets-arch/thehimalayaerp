'use client';

import CreateLead from '../../../../../components/CreateLead';
import { useLeads } from '../../../../../modules/sales/hooks/useLeads';
import { useNotificationStore } from '../../../../../store/notificationStore';
import { useRouter } from 'next/navigation';

export default function CreateLeadPage() {
  const router = useRouter();
  const showToast = useNotificationStore((s: any) => s.showToast);
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
}

