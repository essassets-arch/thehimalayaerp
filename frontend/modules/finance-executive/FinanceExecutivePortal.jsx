'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PaymentVerificationView from './PaymentVerification/PaymentVerificationView';
import PaymentHistoryView from './PaymentHistory/PaymentHistoryView';
import ReceiptsView from './Receipts/ReceiptsView';
import OutstandingView from './Outstanding/OutstandingView';
import CustomersView from './Customers/CustomersView';

export default function FinanceExecutivePortal() {
  const params = useParams();
  const view = params?.slug?.[0] || 'payment-verification';

  const renderView = () => {
    switch (view) {
      case 'payment-verification':
        return <PaymentVerificationView />;
      case 'payment-history':
        return <PaymentHistoryView />;
      case 'payment-receipts':
        return <ReceiptsView />;
      case 'outstanding-payments':
        return <OutstandingView />;
      case 'customers':
        return <CustomersView />;
      default:
        return <PaymentVerificationView />;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {renderView()}
    </div>
  );
}
