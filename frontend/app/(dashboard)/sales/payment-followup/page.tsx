'use client';

import SharedPaymentTable from '@/components/SharedPaymentTable';

export default function SalesPaymentFollowupPage() {
  return (
    <div className="p-6">
      <SharedPaymentTable mode="sales" />
    </div>
  );
}
