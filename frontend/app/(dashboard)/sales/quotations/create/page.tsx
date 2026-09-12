'use client';

import CreateQuotation from '../../../../../components/CreateQuotation';
import { useERP } from '../../../../../shared/context/ERPContext';
import { useQuotations } from '../../../../../modules/sales/hooks/useQuotations';
import { useLeads } from '../../../../../modules/sales/hooks/useLeads';
import { useNotificationStore } from '../../../../../store/notificationStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CreateQuotationPage() {
  const { state } = useERP();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams?.get('leadId');
  const showToast = useNotificationStore((s: any) => s.showToast);
  const [prefillQuotationData, setPrefillQuotationData] = useState<any>(null);
  
  const { createQuotation } = useQuotations(showToast);
  const { leads, updateLead, loadLeads } = useLeads(showToast);
  const customers = state.customers || [];

  useEffect(() => {
    loadLeads?.();
  }, [loadLeads]);

  useEffect(() => {
    if (leadId && leads?.length > 0) {
      const targetLead = (leads as any[]).find((l: any) => l.id === leadId);
      if (targetLead) {
        setPrefillQuotationData({
          id: targetLead.id,
          leadName: targetLead.companyName || targetLead.projectName || '',
          product: targetLead.productInterest || '',
          quantity: targetLead.estimatedQuantity || 1,
        });
      }
    }
  }, [leadId, leads]);

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

