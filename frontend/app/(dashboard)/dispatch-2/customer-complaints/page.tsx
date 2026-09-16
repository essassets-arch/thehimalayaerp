'use client';

import dynamic from 'next/dynamic';

const DispatchCustomerComplaints = dynamic(
  () => import('../../../../modules/dispatch/components/DispatchCustomerComplaints'),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading Dispatch Complaints...
      </div>
    ),
  }
);

export default function Dispatch2CustomerComplaintsPage() {
  return <DispatchCustomerComplaints portalTitle="Dispatch 2" />;
}
