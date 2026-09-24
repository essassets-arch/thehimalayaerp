'use client';

import React from 'react';
import BackOfficeArSheetView from '../components/BackOfficeArSheetView';
import {
  fetchHcpplArRegister,
  createHcpplArInvoice,
  updateHcpplArInvoice,
  deleteHcpplArInvoice
} from '../services/backOfficeArService';

export default function BackOfficeHcpplAr() {
  return (
    <BackOfficeArSheetView
      entity="HCPPL"
      sheetTitle="HCPPL Sheet"
      subtitle="HCPPL Accounts Receivable 21-Column Register"
      invoicePrefix="HCPPL/2627/"
      fetchRegister={fetchHcpplArRegister}
      createInvoice={createHcpplArInvoice}
      updateInvoice={updateHcpplArInvoice}
      deleteInvoice={deleteHcpplArInvoice}
      brandColor="#4f46e5"
      brandBg="#e0e7ff"
    />
  );
}
