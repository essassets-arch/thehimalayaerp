'use client';

import CreateLead from '../../../../../../components/CreateLead';
import { useLeads } from '../../../../../../modules/sales/hooks/useLeads';
import { useNotificationStore } from '../../../../../../store/notificationStore';
import { useRouter, useParams } from 'next/navigation';
import { use, useMemo } from 'react';

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;
  const showToast = useNotificationStore((s: any) => s.showToast);
  const { leads, updateLead, deleteLead } = useLeads(showToast);
  
  const leadToEdit = useMemo(() => {
    return leadId ? (leads as any[]).find((l: any) => String(l.id) === String(leadId)) : null;
  }, [leads, leadId]);

  if (!leadToEdit && (leads as any[]).length > 0) {
    return <div className="p-8 text-center text-gray-500">Lead not found</div>;
  }

  return (
    <CreateLead
      key={`edit-${leadId}`}
      leads={leads as any}
      onAddLead={(updatedData: any) => updateLead(leadToEdit?.id, updatedData)}
      onDeleteLead={deleteLead}
      onGenerateQuotation={() => router.push(`/sales/quotations/create?leadId=${leadId}`)}
      onCancel={() => router.push('/sales/leads')}
      editingLead={leadToEdit}
    />
  );
}
