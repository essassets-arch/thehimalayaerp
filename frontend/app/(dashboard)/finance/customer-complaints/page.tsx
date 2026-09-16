'use client';

import dynamic from 'next/dynamic';

const FinanceCustomerComplaints = dynamic(
  () => import('../../../../modules/finance/components/FinanceCustomerComplaints'),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading Finance Complaints Resolution Portal...
      </div>
    ),
  }
);

export default function FinanceCustomerComplaintsPage() {
  return <FinanceCustomerComplaints />;
}
