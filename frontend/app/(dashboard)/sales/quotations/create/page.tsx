'use client';

import CreateQuotation from '../../../../../components/CreateQuotation';
import { useERP } from '../../../../../shared/context/ERPContext';
import { useQuotations } from '../../../../../modules/sales/hooks/useQuotations';
import { useLeads } from '../../../../../modules/sales/hooks/useLeads';
import { useNotificationStore } from '../../../../../store/notificationStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateQuotationPage() {
  const { state } = useERP();
  const router = useRouter();
  const showToast = useNotificationStore((s: any) => s.showToast);
  const [prefillQuotationData, setPrefillQuotationData] = useState<any>(null);
  
  const { createQuotation } = useQuotations(showToast);
  const { leads, updateLead } = useLeads(showToast);
  const customers = state.customers || [];

  const onAddQuotation = async (qData: any) => {
    const res = await createQuotation(qData);
    if (res?.success) {
      const matchedLead = (leads as any[]).find(
        (l: any) =>
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
}

